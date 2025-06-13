import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './DB/connect.js';
import { socketFunctions } from './socket.js';
import gamesRoutes from './routes/gamesRoutes.js';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connectDB();

app.get('/', (req, res) => {
  res.send("This is the backend server of the chess app");
});

app.use('/users', userRoutes);
app.use('/games', gamesRoutes)

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Adjust as needed for production
    methods: ["GET", "POST"]
  }
});

socketFunctions(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
