import React, { useState, useEffect, useCallback } from 'react';
import { Driver, DriverStatus } from '../types';
import { getDrivers, getDashboardStats } from '../services/apiService';

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1 dark:border dark:border-slate-700/50 dark:hover:border-slate-600">
    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

const weeklyRideData = [
  { day: 'Seg', rides: 0 },
  { day: 'Ter', rides: 0 },
  { day: 'Qua', rides: 0 },
  { day: 'Qui', rides: 0 },
  { day: 'Sex', rides: 0 },
  { day: 'Sáb', rides: 0 },
  { day: 'Dom', rides: 0 },
];

const RideHistoryWidget: React.FC<{ onStatsUpdate: (stats: { completedToday: number }) => void }> = ({ onStatsUpdate }) => {
    type TimeFilter = 'week' | 'month' | 'year';
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
    const [data, setData] = useState({ totalRides: 0, totalRevenue: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const stats = await getDashboardStats(timeFilter);
                setData({ totalRides: stats.totalRides, totalRevenue: stats.totalRevenue });
                onStatsUpdate({ completedToday: stats.completedToday });
            } catch (e) {
                console.error("Failed to fetch dashboard stats", e);
                setData({ totalRides: 0, totalRevenue: 0 });
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [timeFilter, onStatsUpdate]);

    const getButtonClasses = (filter: TimeFilter) => 
        `px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
            timeFilter === filter 
            ? 'bg-[#0057b8] text-white shadow' 
            : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
        }`;
    
    const StatPlaceholder = () => <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md dark:border dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Histórico de Corridas</h2>
                <div className="flex space-x-2 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-full">
                    <button onClick={() => setTimeFilter('week')} className={getButtonClasses('week')}>Esta Semana</button>
                    <button onClick={() => setTimeFilter('month')} className={getButtonClasses('month')}>Este Mês</button>
                    <button onClick={() => setTimeFilter('year')} className={getButtonClasses('year')}>Este Ano</button>
                </div>
            </div>
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatPlaceholder />
                    <StatPlaceholder />
                    <StatPlaceholder />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400">Total de Corridas</h3>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{data.totalRides}</p>
                    </div>
                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400">Receita Total</h3>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">R$ {data.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400">Avaliação Média</h3>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">N/A ★</p>
                    </div>
                </div>
            )}
        </div>
    );
};


const Dashboard: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({ completedToday: 0 });

  const handleStatsUpdate = useCallback((stats: { completedToday: number }) => {
    setDashboardStats(stats);
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true);
      try {
        const driverData = await getDrivers();
        setDrivers(driverData);
      } catch (error) {
        console.error("Failed to fetch drivers", error);
        // Aqui você poderia definir um estado de erro para exibir na UI
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  const onlineDrivers = drivers.filter(d => d.status === 'online').length;
  const onTripDrivers = drivers.filter(d => d.status === 'on_trip').length;
  const totalDrivers = drivers.length;
  // Esses valores seriam carregados de uma API
  const registeredCustomers = "0";

  const maxRides = 100; // Valor padrão quando não há dados

  const pathD = 'M 0,200 C 116.67,200 116.67,200 233.33,200 C 350,200 350,200 466.67,200 C 583.33,200 583.33,200 700,200';
  const areaPathD = `${pathD} L 700,205 L 0,205 Z`;

  const DriverStatusBadge: React.FC<{ status: DriverStatus }> = ({ status }) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Motoristas Online" value={`${onlineDrivers}`} color="text-green-500" />
        <StatCard title="Motoristas em Viagem" value={`${onTripDrivers}`} color="text-blue-500" />
        <StatCard title="Total de Motoristas" value={`${totalDrivers}`} color="text-slate-700 dark:text-slate-300" />
        <StatCard title="Clientes Cadastrados" value={registeredCustomers} color="text-slate-700 dark:text-slate-300" />
        <StatCard title="Corridas Concluídas (Hoje)" value={`${dashboardStats.completedToday}`} color="text-[#0057b8]" />
      </div>

      <RideHistoryWidget onStatsUpdate={handleStatsUpdate} />

       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md dark:border dark:border-slate-700/50">
        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Resumo Semanal de Corridas</h2>
        <div className="relative h-80">
          <div className="absolute top-0 bottom-10 left-0 flex flex-col justify-between text-right text-xs font-medium text-slate-400 dark:text-slate-500 w-8 pr-2">
              <span>{maxRides}</span>
              <span>{Math.round(maxRides * 0.75)}</span>
              <span>{Math.round(maxRides * 0.5)}</span>
              <span>{Math.round(maxRides * 0.25)}</span>
              <span>0</span>
          </div>
          
          <div className="absolute top-0 left-10 right-0 bottom-10">
              <div className="absolute inset-0 grid grid-rows-4">
                  {[...Array(5)].map((_, i) => <div key={i} className="border-t border-slate-200/80 dark:border-slate-700/80"></div>)}
              </div>

              <div className="relative w-full h-full">
                <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 700 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </linearGradient>
                  </defs>
                  <path d={areaPathD} fill="url(#waveGradient)" className="opacity-75" />
                  <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
          </div>

          <div className="absolute bottom-0 left-10 right-0 flex justify-around">
              {weeklyRideData.map(data => (
                <span key={data.day} className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-2">{data.day}</span>
              ))}
          </div>
        </div>
      </div>


      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md dark:border dark:border-slate-700/50">
        <h2 className="text-xl font-semibold mb-4 dark:text-slate-100">Status dos Motoristas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b dark:border-slate-700">
                <th className="p-3">Nome</th>
                <th className="p-3">Status</th>
                <th className="p-3">Localização</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-slate-500 dark:text-slate-400">Carregando motoristas...</td>
                </tr>
              ) : drivers.length > 0 ? (
                drivers.map(driver => (
                  <tr key={driver.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-3 font-medium">{driver.name}</td>
                    <td className="p-3">
                      <DriverStatusBadge status={driver.status} />
                    </td>
                    <td className="p-3 text-sm text-slate-500 dark:text-slate-400">{driver.status !== 'offline' ? `${driver.position.lat.toFixed(4)}, ${driver.position.lng.toFixed(4)}` : 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-slate-500 dark:text-slate-400">Nenhum motorista cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;