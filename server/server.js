import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import "dotenv/config";
import mongoose from 'mongoose';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';


// create express app
const app = express();

// create http server
const server = createServer(app);

// create socket.io server
export const io = new Server(server, {
    cors: {origin: '*'} // allow all origins
});

// store online users
export const userSocketMap = {}  // {userId: socketId}
io.on('connection', (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if (userId)  userSocketMap[userId] = socket.id

    // emit online user to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})

// Middleware
app.use(express.json({limit: '4mb'}));  // allow files up to 4mb
app.use(cors())

// --------------------------------------------------------------------


// Routes
app.use("/api/status", (req, res) => res.send("Server is live"))
app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

// --------------------------------------------------------------------

async function connectDB(){
    try {
        // connect to mongodb
        await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log("Connected to DataBase");

        // port no   specified in .env file or default to 5000
        const PORT = process.env.PORT || 5000;
        
        // start server and send message to console
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch(e){
        console.error("unable to connect to DataBase" )
    }
}


connectDB() 