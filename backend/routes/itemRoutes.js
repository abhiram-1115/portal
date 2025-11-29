import { Router } from 'express';
import { getApprovedItems, getAllItems, addItem, approveItem, claimItem, deleteItem } from '../controllers/itemController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { single } from '../middleware/uploadMiddleware.js';
const router = Router();

// Get all approved items
router.get('/', getApprovedItems);

// Get all items (admin only)
router.get('/all', protect, adminOnly, getAllItems);

// Add a new item (login required)
router.post('/add', protect, single('image'), addItem);

// Approve an item (admin work)
router.put('/approve/:id', protect, adminOnly, approveItem);

// Mark item as claimed
router.put('/claim/:id', protect, claimItem);

// Delete an item
router.delete('/delete/:id', protect, deleteItem);

export default router;
        