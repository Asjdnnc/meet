import { sign } from 'crypto'
import {Router} from 'express'
import { signup,login,allUser } from '../controller/user.controller.js'
import activityRouter from '../route/activity.route.js'
const userRouter = Router()

userRouter.post('/login',login)
userRouter.post('/signup',signup)
userRouter.use('/activity',activityRouter)
userRouter.get('/allUser',allUser);
export default userRouter;