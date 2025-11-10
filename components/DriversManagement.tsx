import React, { useState, useEffect } from 'react';
import { Driver } from '../types';
import { getDrivers } from '../services/apiService';
import TrashIcon from './icons/TrashIcon';
import EditIcon from './icons/EditIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import ConfirmationModal from './ConfirmationModal';

const DriversManagement: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

    useEffect(() => {
        const fetchDrivers = async () => {
            setIsLoading(true);
            try {
                const driverData = await getDrivers();
                setDrivers(driverData);
            } catch (error) {
                console.error("Failed to fetch drivers", error);
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

    const DriverStatusBadge: React.FC<{ status: Driver['status'] }> = ({ status }) => {
        const statusInfo = {
          online: { text: 'Online', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' },
          on_trip: { text: 'Em Viagem', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
          offline: { text: 'Offline', color: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
        };
        return (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusInfo[status].color}`}>
            {statusInfo[status].text}
          </span>
        );
      };

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md dark:border dark:border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Gerenciar Motoristas</h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0057b8] text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                        <UserPlusIcon className="h-5 w-5" />
                        <span>Novo Motorista</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-slate-700">
                                <th className="p-3">Nome</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Localização</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={4} className="text-center p-4">Carregando...</td></tr>
                            ) : drivers.map(driver => (
                                <tr key={driver.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3 flex items-center gap-3">
                                        <img src={driver.avatarUrl} alt={driver.name} className="w-8 h-8 rounded-full" />
                                        <span className="font-medium">{driver.name}</span>
                                    </td>
                                    <td className="p-3"><DriverStatusBadge status={driver.status} /></td>
                                    <td className="p-3 text-sm">{driver.status !== 'offline' ? `${driver.position.lat.toFixed(4)}, ${driver.position.lng.toFixed(4)}` : 'N/A'}</td>
                                    <td className="p-3 text-right space-x-2">
                                        <button className="p-2 text-slate-500 hover:text-[#0057b8] rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><EditIcon /></button>
                                        <button onClick={() => handleDeleteClick(driver)} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
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
