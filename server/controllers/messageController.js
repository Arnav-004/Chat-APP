import Message from "../models/message.js";
import UserDb from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap} from "../server.js"

export const getUsersForSidebar = async (req, res) => {
    try {
        const userId  = req.user._id;
        // ne -> not equal
        // select -> exclude password field
        const filteredUsers = await UserDb.find({ _id: { $ne: userId } }).select("-password");

        // count number of messages not seen
        const unseenMessages = [] 
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({
                senderId: user._id,
                receiverId: user._id,
                seen: false
            });
            
            if(messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        });

        await Promise.all(promises);

        res.status(200).json({success: true, users: filteredUsers, unseenMessages});
    } catch (error) {
        console.error("Error fetching users for sidebar:", error.message);
        res.status(500).json({ message: error.message });
    }
}

// get all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const currentUserId = req.user._id;

        // find all messages between current user and selected user
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: currentUserId }
            ]
        }).sort({ createdAt: 1 });
        // update all messages from selected user to current user as seen
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: currentUserId}, {seen: true }
        );

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        res.status(500).json({ message: error.message });
    }
}

// api to mark messages as seen using messageId
export const markMessagesAsSeen = async (req, res) => {
    try {
        const { messageId } = req.params;

        // update message as seen
        const updatedMessage = await Message.findByIdAndUpdate(
            messageId,
            { seen: true }
        );
        res.status(200).json({ success: true, message: updatedMessage });
    } catch (error) {
        console.error("Error marking messages as seen:", error.message);
        res.status(500).json({ message: error.message });
    }
}

// send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receiverId = req.params.id; // selected user id
        const senderId = req.user._id;
        console.log('req   ',req.user)
        console.log('sender   ',senderId)
        let imageUrl = null;
        if (image) {
            // Upload image to Cloudinary
            // Make sure to configure cloudinary with your credentials elsewhere in your app
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        // create new message
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });

        // emit the new message to the reciver's socket
        const reciverSocketId = userSocketMap[receiverId]
        if(reciverSocketId){
            io.to(reciverSocketId).emit("newMessage", newMessage)
        }

        res.status(200).json({ success: true, newMessage });
    } catch (error) {
        console.error("Error sending message:", error.message);
        res.status(500).json({ message: error.message });
    }
}
