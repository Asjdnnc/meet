import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import {Server} from "socket.io"
import {createServer} from 'http'
import cors from 'cors'
import connectToSocket from './controller/socketManager.js'
const app = express();
const port = 8080;
import userRouter from './route/users.route.js';

dotenv.config();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.db_url)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
}
);

const server = createServer(app); 
const io = connectToSocket(server);  

app.set("port",(process.env.PORT || port));

app.use("/users",userRouter);

app.get('/', (req, res) => {
  res.json('Welcome to the Meet App Backend!');
}
);

server.listen(app.get("port"), () => {
  console.log(`Server is running on http://localhost:${port}`);
});
