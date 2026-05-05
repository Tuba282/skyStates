import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderEmail: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Unread', 'Read', 'Replied'], default: 'Unread' },
  reply: {
    text: { type: String },
    repliedAt: { type: Date },
  },
  createdAt: { type: Date, default: Date.now },
});

if (mongoose.models.Inquiry) {
  delete mongoose.models.Inquiry;
}
export default mongoose.model('Inquiry', InquirySchema);
