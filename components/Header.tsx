import React, { useState } from 'react';
import { User } from '../types';
import ProfileModal from './ProfileModal';

// Mock user for demo purposes
const mockUser: User = {
    id: 1,
    name: 'Admin Goly',
    email: 'admin@goly.com',
    role: 'admin',
    avatarUrl: 'https://i.pravatar.cc/150?u=admin@goly.com'
};

interface HeaderProps {
    pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
    const [user, setUser] = useState<User>(mockUser);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    const handleSaveProfile = (updatedUser: User) => {
        // API call to save user would go here
        setUser(updatedUser);
        setIsProfileModalOpen(false);
    };

    return (
        <>
            <header className="bg-white dark:bg-slate-800 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{pageTitle}</h1>
                <div className="flex items-center space-x-4">
                    <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center space-x-3 group">
                        <span className="text-right hidden sm:block">
                            <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-[#0057b8] dark:group-hover:text-blue-400">{user.name}</span>
                            <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user.role}</span>
                        </span>
                        <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600 group-hover:border-[#0057b8] dark:group-hover:border-blue-400 transition-colors" />
                    </button>
                </div>
            </header>
            {isProfileModalOpen && (
                <ProfileModal 
                    user={user} 
                    onClose={() => setIsProfileModalOpen(false)} 
                    onSave={handleSaveProfile} 
                />
            )}
        </>
    );
};

export default Header;
