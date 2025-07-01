import User from '../models/User.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export const signup = async(req ,res)=>{
    const {name, username, password} = req.body;
    if(!name || !username || !password){
        return res.status(400).json({message: 'Please fill all the fields'});
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            username,
            password: hashedPassword,
            token: jwt.sign({ username }, process.env.secret_key, { expiresIn: '8h' })
        });
        await user.save();
        return res.status(201).json({message: 'User created successfully',token: user.token});
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
}
export const login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if(!user){
        return res.status(404).json({message: 'User not found'});
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(401).json({message: 'Invalid password'});
    }
    const token = jwt.sign({ username }, process.env.secret_key, { expiresIn: '8h' });
    user.token = token;
    await user.save();
    return res.status(200).json({message: 'Login successful', token: user.token});
}

