import {model, Schema} from "mongoose";


const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    profilePic: { type: String, default: "" },
    bio: { type: String}
}, {
    timestamps: true  // Automatically add createdAt and updatedAt fields
});

const UserDb = model('User', userSchema);
export default UserDb;