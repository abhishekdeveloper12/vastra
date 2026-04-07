import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String }, // optional if audio
      audio: { type: String }, // audio file URL (optional)
      timestamp: { type: Date, default: Date.now },
      read: { type: Boolean, default: false },
    }
  ]
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
