import React, { useState } from 'react';
import { User } from '../types';
import Modal from './Modal';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';

interface RegisterUserModalProps {
  onClose: () => void;
  onSave: (newUser: Omit<User, 'id' | 'avatarUrl'>) => void;
}

const RegisterUserModal: React.FC<RegisterUserModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operator' as 'admin' | 'operator',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simula uma chamada de API
    setTimeout(() => {
        // Em um app real, a senha não seria passada diretamente.
        // O backend faria o hash.
        const { password, ...userToSave } = formData;
        onSave(userToSave);
        setIsSaving(false);
    }, 500);
  };

  return (
    <Modal title="Cadastrar Novo Usuário" onClose={onClose}>
      <form onSubmit={handleSaveClick} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Nome Completo</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full p-3 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200"
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
            required
            className="mt-1 block w-full p-3 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200"
          />
        </div>
        <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Senha Provisória</label>
            <div className="relative mt-1">
                <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="block w-full p-3 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
            </div>
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Função</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200"
          >
            <option value="operator">Operador</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-[#0057b8] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Salvando...' : 'Cadastrar Usuário'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RegisterUserModal;
