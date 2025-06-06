import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets, { userDummyData } from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

// Sidebar component displays the list of users and provides navigation options.
const Sidebar = () => {

    const { getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext);

    const { logout, onlineUsers } = useContext(AuthContext)

    const [input, setInput] = useState(false);
    
    const navigate = useNavigate();

    const filteredUsers = input ? users.filter((user)=> user.fullName.toLowerCase().includes(input.toLowerCase())) : users;

    useEffect(() => {
        getUsers();
    }, [onlineUsers])

    return (
        <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? 'max-md:hidden' : ''}`}>
            {/* Header section */}
            <div className="pb-5">
                <div className="flex justify-between items-center">
                    {/* App logo */}
                    <img src={assets.logo} alt="logo" className='max-w-40'/>
                    
                    {/* Menu dropdown */}
                    <div className="relative py-2 group">
                        <img src={assets.menu_icon} alt="menu" className='max-h-5 cursor-pointer' />
                        <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
                            {/* Edit Profile option */}
                            <p onClick={()=>navigate('/profile')}  className="text-sm cursor-pointer">Edit Profile</p>
                            <hr className='my-2 border-t border-gray-500'/>
                            {/* Logout option */}
                            <p onClick={()=> logout()} className="text-sm cursor-pointer">Logout</p>
                        </div>
                    </div>
                </div>

                {/* Search bar */}
                <div className="rounded-full bg-[#282142] flex items-center mt-5 gap-2 px-4 py-3">
                    <img src={assets.search_icon} alt="Search"  className='w-3'/>
                    <input onChange={(e)=>setInput(e.target.value)} type="text" placeholder='Search User...'  className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' />
                </div>
            </div>

            {/* User list */}
            <div className="flex flex-col ">
                {filteredUsers.map((user, index) => (
                    <div key={index}  className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm hover:bg-[#282142] ${selectedUser?.id === user.id && 'bg-[#282142]/50'}`} 
                    onClick={() => {setSelectedUser(user); setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }))} }>

                        {/* User profile picture */}
                        <img src={user?.profilePic || assets.avatar_icon} alt="user" className='w-[35px] aspect-[1/1] rounded-full' />
                        
                        {/* User details */}
                        <div className="flex flex-col leading-5">
                            <p className='text-sm font-semibold'>{user.fullName}</p>
                            {/* Online/Offline status */}
                            {onlineUsers.includes(user._id) ? <span className='text-green-400 text-xs'>Online</span> : <span className='text-xs text-neutral-400'>Offline</span>}
                            {/* Notification badge for offline users */}
                            {unseenMessages[user._id] > 0 && <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50'>{unseenMessages[user._id]}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;