import React, { useState, useEffect, useCallback } from 'react';
import { Driver, DriverStatus } from '../types.ts';
import { getDrivers, getDashboardStats } from '../services/apiService.ts';

const StatCard: React.FC<{ title: string; value: string; color: string }> = React.memo(({ title, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-1">
    <h3 className="text-sm font-medium text-slate-500">{title}</h3>
    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
));

// Dados de exemplo para o gráfico. Em uma aplicação real, viriam da API.
const weeklyRideData = [
  { day: 'Seg', rides: 65 },
  { day: 'Ter', rides: 59 },
  { day: 'Qua', rides: 80 },
  { day: 'Qui', rides: 81 },
  { day: 'Sex', rides: 56 },
  { day: 'Sáb', rides: 95 },
  { day: 'Dom', rides: 70 },
];

// Função auxiliar para gerar os caminhos do SVG para o gráfico
const generateChartPaths = (data: { rides: number }[], width: number, height: number) => {
    if (data.length === 0) {
        const flatLine = `M 0,${height} L ${width},${height}`;
        return { pathD: flatLine, areaPathD: `${flatLine} L ${width},${height} L 0,${height} Z`, maxRides: 100 };
    }

    const maxRides = Math.max(...data.map(d => d.rides), 100); // Garante uma altura mínima de 100
    const points = data.map((d, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - (d.rides / maxRides) * height,
    }));

    const smoothing = 0.2;
    const controlPoint = (current: {x:number, y:number}, previous: {x:number, y:number}, next: {x:number, y:number}, isEnd?: boolean) => {
        const p = previous || current;
        const n = next || current;
        const o = { x: n.x - p.x, y: n.y - p.y };
        const angle = Math.atan2(o.y, o.x) + (isEnd ? Math.PI : 0);
        const length = Math.sqrt(o.x * o.x + o.y * o.y) * smoothing;
        const x = current.x + Math.cos(angle) * length;
        const y = current.y + Math.sin(angle) * length;
        return [x, y];
    };

    const pathD = points.reduce((acc, point, i, a) => {
        if (i === 0) return `M ${point.x.toFixed(2)},${point.y.toFixed(2)}`;
        const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
        const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
        return `${acc} C ${cpsX.toFixed(2)},${cpsY.toFixed(2)} ${cpeX.toFixed(2)},${cpeY.toFixed(2)} ${point.x.toFixed(2)},${point.y.toFixed(2)}`;
    }, "");
    
    const areaPathD = `${pathD} L ${width},${height + 5} L 0,${height + 5} Z`;

    return { pathD, areaPathD, maxRides };
};


const RideHistoryWidget: React.FC<{ onStatsUpdate: (stats: { completedToday: number }) => void }> = ({ onStatsUpdate }) => {
    type TimeFilter = 'week' | 'month' | 'year';
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
    const [data, setData] = useState({ totalRides: 0, totalRevenue: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async (filter: TimeFilter) => {
        setIsLoading(true);
        setError(null);
        try {
            const stats = await getDashboardStats(filter);
            setData({ totalRides: stats.totalRides, totalRevenue: stats.totalRevenue });
            onStatsUpdate({ completedToday: stats.completedToday });
        } catch (e) {
            console.error("Failed to fetch dashboard stats", e);
            setError("Não foi possível carregar as estatísticas.");
            setData({ totalRides: 0, totalRevenue: 0 });
        } finally {
            setIsLoading(false);
        }
    }, [onStatsUpdate]);

    useEffect(() => {
        fetchStats(timeFilter);
    }, [timeFilter, fetchStats]);

    const getButtonClasses = (filter: TimeFilter) => 
        `px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
            timeFilter === filter 
            ? 'bg-[#0057b8] text-white shadow' 
            : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
        }`;
    
    const StatPlaceholder = () => <div className="h-12 bg-slate-200 rounded-md animate-pulse"></div>;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatPlaceholder />
                    <StatPlaceholder />
                    <StatPlaceholder />
                </div>
            );
        }
        if (error) {
            return <p className="text-center text-red-500 py-4">{error}</p>;
        }
        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                    <h3 className="text-slate-500">Total de Corridas</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{data.totalRides}</p>
                </div>
                <div>
                    <h3 className="text-slate-500">Receita Total</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">R$ {data.totalRevenue.toFixed(2)}</p>
                </div>
                <div>
                    <h3 className="text-slate-500">Avaliação Média</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">N/A ★</p>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Histórico de Corridas</h2>
                <div className="flex space-x-2 bg-slate-50 p-1 rounded-full">
                    <button onClick={() => setTimeFilter('week')} className={getButtonClasses('week')}>Esta Semana</button>
                    <button onClick={() => setTimeFilter('month')} className={getButtonClasses('month')}>Este Mês</button>
                    <button onClick={() => setTimeFilter('year')} className={getButtonClasses('year')}>Este Ano</button>
                </div>
            </div>
            {renderContent()}
        </div>
    );
};


const Dashboard: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({ completedToday: 0 });

  const handleStatsUpdate = useCallback((stats: { completedToday: number }) => {
    setDashboardStats(stats);
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const driverData = await getDrivers();
        setDrivers(driverData);
      } catch (error) {
        console.error("Failed to fetch drivers", error);
        setError("Não foi possível carregar a lista de motoristas.");
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

  const { pathD, areaPathD, maxRides } = generateChartPaths(weeklyRideData, 700, 200);

  const DriverStatusBadge: React.FC<{ status: DriverStatus }> = ({ status }) => {
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Motoristas Online" value={`${onlineDrivers}`} color="text-green-500" />
        <StatCard title="Motoristas em Viagem" value={`${onTripDrivers}`} color="text-blue-500" />
        <StatCard title="Total de Motoristas" value={`${totalDrivers}`} color="text-slate-900" />
        <StatCard title="Clientes Cadastrados" value={registeredCustomers} color="text-slate-900" />
        <StatCard title="Corridas Concluídas (Hoje)" value={`${dashboardStats.completedToday}`} color="text-[#0057b8]" />
      </div>

      <RideHistoryWidget onStatsUpdate={handleStatsUpdate} />

       <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-slate-900">Resumo Semanal de Corridas</h2>
        <div className="relative h-80">
          <div className="absolute top-0 bottom-10 left-0 flex flex-col justify-between text-right text-xs font-medium text-slate-400 w-8 pr-2">
              <span>{maxRides}</span>
              <span>{Math.round(maxRides * 0.75)}</span>
              <span>{Math.round(maxRides * 0.5)}</span>
              <span>{Math.round(maxRides * 0.25)}</span>
              <span>0</span>
          </div>
          
          <div className="absolute top-0 left-10 right-0 bottom-10">
              <div className="absolute inset-0 grid grid-rows-4">
                  {[...Array(5)].map((_, i) => <div key={i} className="border-t border-slate-200/80"></div>)}
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
                <span key={data.day} className="text-xs font-medium text-slate-500 pt-2">{data.day}</span>
              ))}
          </div>
        </div>
      </div>


      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Status dos Motoristas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-3">Nome</th>
                <th className="p-3">Status</th>
                <th className="p-3">Localização</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-slate-500">Carregando motoristas...</td>
                </tr>
              ) : error ? (
                <tr>
                    <td colSpan={3} className="text-center p-4 text-red-500">{error}</td>
                </tr>
              ) : drivers.length > 0 ? (
                drivers.map(driver => (
                  <tr key={driver.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{driver.name}</td>
                    <td className="p-3">
                      <DriverStatusBadge status={driver.status} />
                    </td>
                    <td className="p-3 text-sm text-slate-500">{driver.status !== 'offline' ? `${driver.position.lat.toFixed(4)}, ${driver.position.lng.toFixed(4)}` : 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-slate-500">Nenhum motorista cadastrado.</td>
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