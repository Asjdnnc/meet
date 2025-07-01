import express from 'express';
import { getAllActivity, addActivity } from '../controller/userActivityController.js';

const activityRouter = express.Router();

activityRouter.get('/get_all_activity', getAllActivity);
activityRouter.post('/add_activity', addActivity);

export default activityRouter;