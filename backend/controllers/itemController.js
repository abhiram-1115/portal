import Item from '../models/item.js';

// Add new item
  export async function addItem(req, res) {
    try {
      const { name, description, type, category, location, contactDetails } = req.body;
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'Image is required' });
      }

      // Get image URL from uploaded file
      const imageUrl = `/uploads/${req.file.filename}`;

      // Parse contactDetails if it's a string
      let parsedContactDetails = contactDetails;
      if (typeof contactDetails === 'string') {
        try {
          parsedContactDetails = JSON.parse(contactDetails);
        } catch (e) {
          parsedContactDetails = { email: contactDetails };
        }
      }

      const newItem = new Item({
        name: name || 'Unnamed Item',
        description,
        image: imageUrl,
        type,
        category,
        location,
        contactDetails: parsedContactDetails,
        status: 'pending',
        createdBy: req.user.id,
      });

      await newItem.save();
      res.status(201).json({ message: 'Item added successfully', item: newItem });
    } catch (error) {
      console.error('Error adding item:', error);
      res.status(500).json({ message: 'Error adding item: ' + error.message });
    }
  }

// Get all approved items
export async function getApprovedItems(req, res) {
  try {
    const items = await Item.find({ status: 'approved' });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items' });
  }
}

// Get all items (admin only)
export async function getAllItems(req, res) {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items' });
  }
}

// Approve an item
export async function approveItem(req, res) {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.status = 'approved';
    await item.save();

    res.json({ message: 'Item approved' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving item' });
  }
}

// Reject an item
export async function rejectItem(req, res) {
  try {
    const { reason } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.status = 'rejected';
    item.rejectionReason = reason || 'Item does not meet guidelines';
    await item.save();

    res.json({ message: 'Item rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting item' });
  }
}

// Mark item as claimed
export async function claimItem(req, res) {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Check if item is already claimed
    if (item.status === 'claimed') {
      return res.status(400).json({ message: 'Item is already claimed' });
    }

    // Check if item is approved (only approved items can be claimed)
    if (item.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved items can be claimed' });
    }

    item.status = 'claimed';
    item.claimedBy = req.user.id;
    item.claimedAt = new Date();
    await item.save();

    res.json({ message: 'Item marked as claimed successfully' });
  } catch (error) {
    console.error('Error claiming item:', error);
    res.status(500).json({ message: 'Error marking item claimed' });
  }
}

// Delete an item
export async function deleteItem(req, res) {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item' });
  }
}

/**
 * POST /api/items/:id/claim
 * body: { message?: string }
 */
const requestClaim = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const requesterId = getAuthUserId(req);
    const ownerId = getOwnerId(item);

    if (ownerId && ownerId === requesterId) {
      return res.status(400).json({ message: "Owner cannot claim own item" });
    }

    if (item.claim?.status === "pending") {
      return res.status(409).json({ message: "A claim is already pending" });
    }

    if (item.claim?.status === "approved") {
      return res.status(409).json({ message: "Item is already claimed" });
    }

    item.claim = {
      status: "pending",
      requestedBy: requesterId,
      message: (req.body?.message || "").trim(),
      requestedAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
    };

    await item.save();
    return res.status(201).json({ message: "Claim request submitted", claim: item.claim });
  } catch (error) {
    return res.status(500).json({ message: "Failed to request claim", error: error.message });
  }
};

/**
 * PATCH /api/items/:id/claim/review
 * body: { decision: "approve" | "reject" }
 * Allowed: admin or item owner
 */
const reviewClaim = async (req, res) => {
  try {
    const { decision } = req.body || {};
    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be 'approve' or 'reject'" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.claim?.status !== "pending") {
      return res.status(400).json({ message: "No pending claim to review" });
    }

    const reviewerId = getAuthUserId(req);
    const ownerId = getOwnerId(item);
    const isAdmin = !!req.user?.isAdmin;

    if (!isAdmin && (!ownerId || ownerId !== reviewerId)) {
      return res.status(403).json({ message: "Not authorized to review this claim" });
    }

    item.claim.status = decision === "approve" ? "approved" : "rejected";
    item.claim.reviewedBy = reviewerId;
    item.claim.reviewedAt = new Date();

    await item.save();
    return res.json({ message: `Claim ${item.claim.status}`, claim: item.claim });
  } catch (error) {
    return res.status(500).json({ message: "Failed to review claim", error: error.message });
  }
};

/**
 * GET /api/items/claims/pending
 * Allowed: admin only
 */
const getPendingClaims = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const items = await Item.find({ "claim.status": "pending" })
      .populate("claim.requestedBy", "name email")
      .sort({ "claim.requestedAt": -1 });

    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pending claims", error: error.message });
  }
};

const getAuthUserId = (req) => String(req.user?._id || req.user?.id || "");
const getOwnerId = (item) =>
  String(item.user || item.createdBy || item.reportedBy || "");

// rename these NEW handlers only (keep any older requestClaim handler untouched)
export const requestItemClaim = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const requesterId = String(req.user?._id || req.user?.id || "");
    const ownerId = String(item.user || item.createdBy || item.reportedBy || "");

    if (ownerId && ownerId === requesterId) {
      return res.status(400).json({ message: "Owner cannot claim own item" });
    }

    if (item.claim?.status === "pending") {
      return res.status(409).json({ message: "A claim is already pending" });
    }

    if (item.claim?.status === "approved") {
      return res.status(409).json({ message: "Item is already claimed" });
    }

    item.claim = {
      status: "pending",
      requestedBy: requesterId,
      message: (req.body?.message || "").trim(),
      requestedAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
    };

    await item.save();
    return res.status(201).json({ message: "Claim request submitted", claim: item.claim });
  } catch (error) {
    return res.status(500).json({ message: "Failed to request claim", error: error.message });
  }
};

export const reviewItemClaim = async (req, res) => {
  try {
    const { decision } = req.body || {};
    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be 'approve' or 'reject'" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.claim?.status !== "pending") {
      return res.status(400).json({ message: "No pending claim to review" });
    }

    const reviewerId = String(req.user?._id || req.user?.id || "");
    const ownerId = String(item.user || item.createdBy || item.reportedBy || "");
    const isAdmin = !!req.user?.isAdmin;

    if (!isAdmin && (!ownerId || ownerId !== reviewerId)) {
      return res.status(403).json({ message: "Not authorized to review this claim" });
    }

    item.claim.status = decision === "approve" ? "approved" : "rejected";
    item.claim.reviewedBy = reviewerId;
    item.claim.reviewedAt = new Date();

    await item.save();
    return res.json({ message: `Claim ${item.claim.status}`, claim: item.claim });
  } catch (error) {
    return res.status(500).json({ message: "Failed to review claim", error: error.message });
  }
};

export const getPendingItemClaims = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const items = await Item.find({ "claim.status": "pending" })
      .populate("claim.requestedBy", "name email")
      .sort({ "claim.requestedAt": -1 });

    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch pending claims", error: error.message });
  }
};

export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("claim.requestedBy", "name email");
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Public can only view approved items; admin can view any
    const isAdmin = !!req.user?.isAdmin;
    if (item.status !== "approved" && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this item" });
    }

    return res.json(item);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch item", error: error.message });
  }
};
