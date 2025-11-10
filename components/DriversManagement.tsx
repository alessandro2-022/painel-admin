import React, { useState, useEffect } from 'react';
import { Driver } from '../types.ts';
import { getDrivers } from '../services/apiService.ts';
import TrashIcon from './icons/TrashIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import UserPlusIcon from './icons/UserPlusIcon.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';

const DriversManagement: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchDrivers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const driverData = await getDrivers();
                setDrivers(driverData);
            } catch (error) {
                console.error("Failed to fetch drivers", error);
                setError("Não foi possível carregar os motoristas.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDrivers();
    }, []);
    
    const handleDeleteClick = (driver: Driver) => {
        setDriverToDelete(driver);
    };

    const handleConfirmDelete = () => {
        if (!driverToDelete) return;
        // In a real app, call an API to delete the driver
        console.log(`Deleting driver ${driverToDelete.name}`);
        setDrivers(drivers.filter(d => d.id !== driverToDelete.id));
        setDriverToDelete(null);
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

    const DriverStatusBadge: React.FC<{ status: Driver['status'] }> = ({ status }) => {
        const statusInfo = {
          online: { text: 'Online', color: 'bg-green-100 text-green-700' },
          on_trip: { text: 'Em Viagem', color: 'bg-blue-100 text-blue-700' },
          offline: { text: 'Offline', color: 'bg-slate-200 text-slate-600' },
        };
        return (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusInfo[status].color}`}>
            {statusInfo[status].text}
          </span>
        );
      };

      const filteredDrivers = drivers.filter(driver =>
        driver.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-900">Gerenciar Motoristas</h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0057b8] text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                        <UserPlusIcon className="h-5 w-5" />
                        <span>Novo Motorista</span>
                    </button>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Procurar por nome..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-3 pl-10 border-slate-300 rounded-lg focus:ring-[#0057b8] focus:border-[#0057b8] text-slate-900"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="p-3 text-slate-700">Nome</th>
                                <th className="p-3 text-slate-700">Status</th>
                                <th className="p-3 text-slate-700">Registrado em</th>
                                <th className="p-3 text-slate-700">Localização</th>
                                <th className="p-3 text-right text-slate-700">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center p-4 text-slate-500">Carregando...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={5} className="text-center p-4 text-red-500">{error}</td></tr>
                            ) : filteredDrivers.length > 0 ? (
                                filteredDrivers.map(driver => (
                                    <tr key={driver.id} className="border-b border-slate-200 hover:bg-slate-50">
                                        <td className="p-3 flex items-center gap-3">
                                            <img src={driver.avatarUrl} alt={driver.name} className="w-8 h-8 rounded-full" />
                                            <span className="font-medium text-slate-900">{driver.name}</span>
                                        </td>
                                        <td className="p-3"><DriverStatusBadge status={driver.status} /></td>
                                        <td className="p-3 text-sm text-slate-700">{formatDate(driver.registeredAt)}</td>
                                        <td className="p-3 text-sm text-slate-700">{driver.status !== 'offline' ? `${driver.position.lat.toFixed(4)}, ${driver.position.lng.toFixed(4)}` : 'N/A'}</td>
                                        <td className="p-3 text-right space-x-2">
                                            <button className="p-2 text-slate-500 hover:text-[#0057b8] rounded-full hover:bg-slate-200"><EditIcon /></button>
                                            <button onClick={() => handleDeleteClick(driver)} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-200"><TrashIcon /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="text-center p-4 text-slate-500">Nenhum motorista encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <ConfirmationModal
                    isOpen={!!driverToDelete}
                    onClose={() => setDriverToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Exclusão"
                    message={`Tem certeza de que deseja remover o motorista "${driverToDelete?.name}"? Esta ação não pode ser desfeita.`}
                    confirmText="Excluir"
                    isDestructive
                />
            </div>
        </div>
    );
};

export default DriversManagement;