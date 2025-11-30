import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  type: { type: String, enum: ['lost', 'found'], required: true },
  category: { type: String },
  location: { type: String },
  date: { type: Date, default: Date.now },
  contactDetails: {
    email: { type: String, required: true },
  },
  status: { type: String, enum: ['pending', 'approved', 'claimed', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimedAt: { type: Date },
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);
export default Item;
                