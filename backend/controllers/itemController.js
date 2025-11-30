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
