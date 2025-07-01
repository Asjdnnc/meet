import UserActivity from '../models/userActivity.model.js';
import User from '../models/User.model.js';

export const getAllActivity = async (req, res) => {
  try {
    let userId = req.user && req.user.id;
    // If userId is not present, try to get from username
    if (!userId) {
      let username = req.user && req.user.username;
      if (!username && req.query.username) {
        username = req.query.username;  
      }
      if (username) {
        const user = await User.findOne({ username });
        if (user) {
          userId = user._id;
        }
      }
    }
    if (!userId) {
      return res.status(400).json({ msg: 'User not identified for activity history.' });
    }
    const activities = await UserActivity.find({ userId }).sort({ date: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ msg: 'Server error fetching activity' });
  }   
};

export const addActivity = async (req, res) => {
  try {
    const { meetingCode, date, userId } = req.body;
    const user = await User.findOne({ name: userId });
    console.log("user", user);
    const activity = new UserActivity({ userId: user._id, meetingCode, date: date || new Date() });
    console.log("activity", activity);
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ msg: 'Server error adding activity' });
  }
};