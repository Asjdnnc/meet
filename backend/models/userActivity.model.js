import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meetingCode: { type: String, required: true },
  date: { type: Date, required: true },
  // Add more fields as needed (duration, participants, etc.)
});

export default mongoose.model('UserActivity', userActivitySchema);