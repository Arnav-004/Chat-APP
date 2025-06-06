import {model, Schema} from "mongoose";

const objectId = Schema.Types.ObjectId;

const messageSchema = new Schema({
    senderId: { type: objectId, ref: "User", required: true },
    receiverId: { type: objectId, ref: "User", required: true },
    text: { type: String },
    image: { type: String },
    seen: {type: Boolean, default: false},
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

const Message = model('Message', messageSchema);
export default Message;