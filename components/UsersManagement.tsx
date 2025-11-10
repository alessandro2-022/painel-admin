import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types.ts';
import { getUsers, createUser, deleteUser } from '../services/apiService.ts';
import TrashIcon from './icons/TrashIcon.tsx';
import UserPlusIcon from './icons/UserPlusIcon.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import RegisterUserModal from './RegisterUserModal.tsx';

const UsersManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const userData = await getUsers();
            setUsers(userData);
        } catch (err) {
            setError('Falha ao carregar os usuários. Tente novamente mais tarde.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        setError(null);
        try {
            await deleteUser(userToDelete.id);
            setUsers(users.filter(u => u.id !== userToDelete.id));
        } catch (err) {
            setError(`Falha ao excluir o usuário ${userToDelete.name}.`);
        } finally {
            setUserToDelete(null);
        }
    };

    const handleSaveNewUser = async (newUser: Omit<User, 'id' | 'avatarUrl'>) => {
        setError(null);
        try {
            await createUser(newUser);
            await fetchUsers(); // Recarrega a lista para incluir o novo usuário
        } catch (err) {
            setError('Falha ao cadastrar o novo usuário.');
        } finally {
            setIsRegisterModalOpen(false);
        }
    };

    const RoleBadge: React.FC<{ role: User['role'] }> = ({ role }) => {
        const roleInfo = {
          admin: { text: 'Admin', color: 'bg-indigo-100 text-indigo-700' },
          operator: { text: 'Operador', color: 'bg-sky-100 text-sky-700' },
        };
        return (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${roleInfo[role].color}`}>
            {roleInfo[role].text}
          </span>
        );
      };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-900">Gerenciar Usuários</h2>
                    <button 
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0057b8] text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        <span>Novo Usuário</span>
                    </button>
                </div>

                {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-center">{error}</p>}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="p-3 text-slate-700">Nome</th>
                                <th className="p-3 text-slate-700">Email</th>
                                <th className="p-3 text-slate-700">Função</th>
                                <th className="p-3 text-right text-slate-700">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center p-4 text-slate-500">Carregando usuários...</td></tr>
                            ) : users.length > 0 ? users.map(user => (
                                <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-3 flex items-center gap-3">
                                        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                        <span className="font-medium text-slate-900">{user.name}</span>
                                    </td>
                                    <td className="p-3 text-slate-700">{user.email}</td>
                                    <td className="p-3"><RoleBadge role={user.role} /></td>
                                    <td className="p-3 text-right space-x-2">
                                        <button 
                                            onClick={() => handleDeleteClick(user)} 
                                            className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-200"
                                            aria-label={`Excluir ${user.name}`}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center p-4 text-slate-500">Nenhum usuário cadastrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {isRegisterModalOpen && (
                    <RegisterUserModal
                        onClose={() => setIsRegisterModalOpen(false)}
                        onSave={handleSaveNewUser}
                    />
                )}

                <ConfirmationModal
                    isOpen={!!userToDelete}
                    onClose={() => setUserToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Exclusão"
                    message={`Tem certeza de que deseja remover o usuário "${userToDelete?.name}"? Esta ação não pode ser desfeita.`}
                    confirmText="Excluir"
                    isDestructive
                />
            </div>
        </div>
    );
};

export default UsersManagement;