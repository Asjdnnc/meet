import { sign } from 'crypto'
import {Router} from 'express'
import { signup,login } from '../controller/user.controller.js'
import activityRouter from '../route/activity.route.js'
const userRouter = Router()

userRouter.post('/login',login)
userRouter.post('/signup',signup)
userRouter.use('/activity',activityRouter)
export default userRouter;