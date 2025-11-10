import React, { useState, useEffect } from 'react';
import { User } from '../types.ts';
import ProfileModal from './ProfileModal.tsx';
import { getUsers } from '../services/apiService.ts'; // Usaremos para pegar o usuário logado

// FIX: Define the HeaderProps interface to type the component's props.
interface HeaderProps {
    pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                // Em um app real, o ID do usuário viria do contexto de autenticação.
                // Aqui, estamos pegando o primeiro usuário da lista como exemplo.
                const users = await getUsers();
                if (users.length > 0) {
                    setUser(users[0]);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
                // Mantém o usuário como nulo, o que fará com que o placeholder seja exibido
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);
    
    const handleSaveProfile = (updatedUser: User) => {
        // A API para atualizar o usuário seria chamada aqui
        setUser(updatedUser);
        setIsProfileModalOpen(false);
    };

    if (isLoading || !user) {
        // Renderiza um placeholder enquanto o usuário está carregando ou se houve um erro
        return (
             <header className="bg-white p-4 flex justify-between items-center border-b border-slate-200 h-16">
                <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
                <div className="flex items-center space-x-4 animate-pulse">
                    <div className="text-right hidden sm:block">
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                        <div className="h-3 w-16 bg-slate-200 rounded mt-1"></div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                </div>
            </header>
        );
    }

    return (
        <>
            <header className="bg-white p-4 flex justify-between items-center border-b border-slate-200 h-16">
                <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
                <div className="flex items-center space-x-4">
                    <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center space-x-3 group">
                        <div className="text-right hidden sm:block">
                            <span className="block font-semibold text-slate-900 group-hover:text-[#0057b8]">{user.name}</span>
                            <span className="block text-sm text-slate-500 capitalize">{user.role}</span>
                        </div>
                        <img src={user.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-slate-300 group-hover:border-[#0057b8] transition-colors" />
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