import { Router } from 'express';
import { getApprovedItems, getAllItems, addItem, approveItem, rejectItem, claimItem, deleteItem } from '../controllers/itemController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { single } from '../middleware/uploadMiddleware.js';
const router = Router();

// Get all approved items
router.get('/', getApprovedItems);

// Get all items (admin only)
router.get('/all', protect, adminOnly, getAllItems);

// Get pending items (admin only)
router.get('/pending', protect, adminOnly, async (req, res) => {
  try {
    const Item = (await import('../models/item.js')).default;
    const items = await Item.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending items' });
  }
});

// Add a new item (login required)
router.post('/add', protect, single('image'), addItem);

// Approve an item (admin work)
router.put('/approve/:id', protect, adminOnly, approveItem);

// Reject an item (admin only)
router.put('/reject/:id', protect, adminOnly, rejectItem);

// Mark item as claimed
router.put('/claim/:id', protect, claimItem);

// Delete an item
router.delete('/delete/:id', protect, deleteItem);

export default router;