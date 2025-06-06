import React, { use, useContext, useEffect, useRef, useState } from 'react';
import assets, { messagesDummyData } from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ChatContainer component handles the display of the chat interface.
// It shows either the chat window or a placeholder message based on the selectedUser prop.
const ChatContainer = () => {

    const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext)
    const { authUser, onlineUsers } = useContext(AuthContext)

    // Ref to scroll to the end of the chat messages
    const scrollEnd = useRef()

    const [input, setInput] = useState('');

    // Function to handle sending messages
    const handlesendMessage = async (e) => {
        e.preventDefault();
        if (!input) return null;
        if (input.trim() === "") return null;

        // Send the message using the sendMessage function from ChatContext
        await sendMessage({ text: input.trim()});

        // Clear the input field after sending the message
        setInput('');
    }

    // handle sending image
    const handleSendImage = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        if ( !file || !file.type.startsWith("image/") ){
            toast.error("Please select a valid image file");
            return;
        }
        const reader = new FileReader();

        reader.onloadend = async () => {
            await sendMessage({ image: reader.result });
            e.target.value = ''
        }

        reader.readAsDataURL(file);
    }

    useEffect(() => {
        if(selectedUser){
            // Fetch messages for the selected user when the component mounts
            getMessages(selectedUser._id);
        }
    }, [selectedUser])

    useEffect(()=>{
        // Scroll to the end of the chat messages when a new message is added
        if( scrollEnd.current && messages){
            scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages])
    
    // If a user is selected, display the chat interface.
    return selectedUser ? (
        <div className='h-full overflow-scroll relative backdrop-blur-lg border-l border-gray-600'>
            
            {/* Header section of the chat interface */}
            <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
                {/* User profile picture */}
                <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-8 rounded-full' />
                
                {/* User name and online status */}
                <p className='flex-1 text-lg text-white flex items-center gap-2'>
                    {selectedUser.fullName} 
                    {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500' />}
                </p>
                
                {/* Back button to deselect the user */}
                <img src={assets.arrow_icon} alt="" onClick={()=> setSelectedUser(null)} className='md:hidden max-w-7' />
                
                {/* Help icon */}
                <img src={assets.help_icon} alt=""  className='max-md:hidden max-w-5' />
            </div>

            {/* Chat messages section */}
            <div className='flex flex-col h-[calc(100%-125px)] overflow-y-scroll pb-6 p-3'>
                {/* Chat messages */}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end justify-end gap-2 ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}>
                        {/* User profile picture */}
                        {msg.image ? (
                            <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8 ' />
                        ) : (
                            // Message bubble  680f50e4f10f3cd28382ecf9
                            <p className={`max-w-[200px] p-2 md:text-sm font-light mb-8 break-all bg-violet-500/30 text-white rounded-lg ${msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'} `}>{msg.text}</p>
                        )}
                        
                        {/* message time */}
                        <div className='text-center text-xs'>
                            <img src={msg.senderId === authUser._id ? authUser.profilePic || assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-7 rounded-full'/>
                            <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
                        </div>
                    </div>
                ))}
                <div ref={scrollEnd}></div>
            </div>

            {/* Input section for sending messages */}
            <div className='absolute bottom-0 left-0 right-0 p-3 border-t border-stone-500 flex items-center gap-3'>
                <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full'>

                    {/* Input field for typing messages */}
                    <input onChange={(e)=>setInput(e.target.value)} value={input}
                    onKeyDown={(e) => e.key === 'Enter' ? handlesendMessage(e) : null}
                    type="text" placeholder='Type a message...' className='rounded-lg border-none p-3 outline-none text-white text-sm placeholder-gray-400 flex-1' />
                    
                    {/* Icon to attach image */}
                    <input onChange={handleSendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
                    <label htmlFor="image">
                        <img src={assets.gallery_icon} alt=""  className='w-5 mr-2 cursor-pointer'/>
                    </label>
                </div> 
                {/* Send button */}
                <img onClick={handlesendMessage} src={assets.send_button} alt="Send" className='w-7 cursor-pointer' />
            </div>
        </div> ) : (

        // Placeholder message when no user is selected
        <div className='flex flex-col items-center justify-center h-full gap-2 text-gray-500 bg-white/10 max-md:hidden'>
            {/* App logo */}
            <img src={assets.logo_icon} alt="" className='max-w-16' />
            
            {/* Placeholder text */}
            <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
        </div>
    )
};

export default ChatContainer;