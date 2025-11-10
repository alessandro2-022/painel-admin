import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Modal from './Modal';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });

  useEffect(() => {
    // Reseta o formulário se o usuário mudar (improvável, mas seguro)
    setFormData({ name: user.name, email: user.email });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
    setIsEditing(false); // Volta para o modo de visualização após salvar
  };

  return (
    <Modal title={isEditing ? 'Editar Perfil' : 'Meu Perfil'} onClose={onClose}>
      <form onSubmit={handleSaveClick}>
        <div className="flex flex-col items-center text-center">
            <img src={user.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full mb-4 border-4 border-slate-200 dark:border-slate-600 shadow-md" />
        </div>
        <div className="space-y-4 mt-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nome</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 block w-full p-3 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="mt-1 block w-full p-3 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200 disabled:bg-slate-100 dark:disabled:bg-slate-700/50 disabled:cursor-not-allowed"
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Função</label>
            <p className="mt-1 block w-full p-3 bg-slate-100 dark:bg-slate-700/50 rounded-md capitalize text-slate-500 dark:text-slate-400">{user.role}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: user.name, email: user.email }); // Reseta alterações
                }}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0057b8] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                Salvar Alterações
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#0057b8] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Editar
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ProfileModal;
