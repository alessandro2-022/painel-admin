import React, { useState, useEffect } from 'react';
import { Driver } from '../types';
import { MOCK_DRIVERS } from '../constants';

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

const initialHistoryData = {
    week: { totalRides: '0', totalRevenue: 'R$ 0,00', avgRating: 'N/A' },
    month: { totalRides: '0', totalRevenue: 'R$ 0,00', avgRating: 'N/A' },
    year: { totalRides: '0', totalRevenue: 'R$ 0,00', avgRating: 'N/A' },
};


const RideHistoryWidget: React.FC = () => {
    type TimeFilter = 'week' | 'month' | 'year';
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
    const [data, setData] = useState(initialHistoryData.week);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Em um app real, aqui seria feita uma chamada de API
        // com base no timeFilter para buscar os dados.
        setTimeout(() => {
             setData(initialHistoryData[timeFilter]);
             setIsLoading(false);
        }, 500);
    }, [timeFilter]);

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
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{data.totalRevenue}</p>
                    </div>
                    <div>
                        <h3 className="text-slate-500 dark:text-slate-400">Avaliação Média</h3>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{data.avgRating} ★</p>
                    </div>
                </div>
            )}
        </div>
    );
};


const Dashboard: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simula o carregamento de dados de uma API
  useEffect(() => {
    // Em uma aplicação real, aqui você faria a chamada fetch para sua API
    // ex: fetch('/api/drivers').then(res => res.json()).then(data => setDrivers(data));
    setTimeout(() => {
      setDrivers(MOCK_DRIVERS);
      setIsLoading(false);
    }, 1000);
  }, []);

  const onlineDrivers = drivers.filter(d => d.online).length;
  const totalDrivers = drivers.length;
  // Esses valores seriam carregados de uma API
  const registeredCustomers = "0";
  const completedRides = "0";
  const driverCancellations = "0";
  const userCancellations = "0";

  const maxRides = 100; // Valor padrão quando não há dados

  // SVG wave chart calculations
  const svgWidth = 700;
  const svgHeight = 200; // Visual height for the wave within the SVG
  const points = weeklyRideData.map((data, index) => {
    const x = (index / (weeklyRideData.length - 1)) * svgWidth;
    const y = svgHeight - (data.rides / maxRides) * (svgHeight - 10); // Leave some padding
    return { x, y, rides: data.rides, day: data.day };
  });

  const pathD = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const [cp1x, cp1y] = [(a[i-1].x + point.x) / 2, a[i-1].y];
    const [cp2x, cp2y] = [(a[i-1].x + point.x) / 2, point.y];
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, '');

  const areaPathD = `${pathD} L ${svgWidth},${svgHeight + 5} L 0,${svgHeight + 5} Z`;


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Motoristas Online" value={`${onlineDrivers}`} color="text-green-500" />
        <StatCard title="Total de Motoristas" value={`${totalDrivers}`} color="text-slate-700 dark:text-slate-300" />
        <StatCard title="Clientes Cadastrados" value={registeredCustomers} color="text-slate-700 dark:text-slate-300" />
        <StatCard title="Corridas Concluídas" value={completedRides} color="text-[#0057b8]" />
        <StatCard title="Cancelamentos (Motorista)" value={driverCancellations} color="text-amber-600" />
        <StatCard title="Cancelamentos (Usuário)" value={userCancellations} color="text-red-500" />
      </div>

      <RideHistoryWidget />

       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md dark:border dark:border-slate-700/50">
        <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Resumo Semanal de Corridas</h2>
        <div className="relative h-80">
          {/* Y-Axis Labels */}
          <div className="absolute top-0 bottom-10 left-0 flex flex-col justify-between text-right text-xs font-medium text-slate-400 dark:text-slate-500 w-8 pr-2">
              <span>{maxRides}</span>
              <span>{Math.round(maxRides * 0.75)}</span>
              <span>{Math.round(maxRides * 0.5)}</span>
              <span>{Math.round(maxRides * 0.25)}</span>
              <span>0</span>
          </div>
          
          {/* Chart Area */}
          <div className="absolute top-0 left-10 right-0 bottom-10">
              {/* Grid Lines */}
              <div className="absolute inset-0 grid grid-rows-4">
                  {[...Array(5)].map((_, i) => <div key={i} className="border-t border-slate-200/80 dark:border-slate-700/80"></div>)}
              </div>

              {/* SVG Wave and interactive points */}
              <div className="relative w-full h-full">
                <svg className="absolute inset-0" width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                      <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <path d={areaPathD} fill="url(#waveGradient)" className="opacity-75" />
                  <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'url(#glow)', opacity: 0.8 }}/>
                </svg>

                {/* Interactive Points & Tooltips */}
                <div className="absolute inset-0 flex justify-around">
                    {points.map(point => (
                        <div key={point.day} className="relative group w-full h-full flex justify-center">
                            <div className="absolute transition-transform duration-200 ease-out group-hover:-translate-y-1" style={{ top: `${(point.y / svgHeight) * 100}%`, left: `${(point.x / svgWidth) * 100}%` }}>
                                <div className="absolute -translate-x-1/2 -translate-y-1/2">
                                  <div className="absolute w-3 h-3 bg-white dark:bg-slate-800 border-2 border-[#3b82f6] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  <span className="absolute bottom-full mb-3 w-max bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-200 text-xs rounded py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-1/2 shadow-lg">
                                      {point.rides} corridas
                                  </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
          </div>

          {/* X-Axis Labels */}
          <div className="absolute bottom-0 left-10 right-0 flex justify-around">
              {weeklyRideData.map(data => (
                <span key={data.day} className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-2">{data.day}</span>
              ))}
          </div>
        </div>
      </div>


      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md dark:border dark:border-slate-700/50">
        <h2 className="text-xl font-semibold mb-4 dark:text-slate-100">Motoristas Online</h2>
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
              ) : drivers.filter(d => d.online).length > 0 ? (
                drivers.filter(d => d.online).map(driver => (
                  <tr key={driver.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-3 font-medium">{driver.name}</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs font-semibold px-2 py-1 rounded-full">
                        Online
                      </span>
                    </td>
                    <td className="p-3 text-sm text-slate-500 dark:text-slate-400">{`${driver.position.lat.toFixed(4)}, ${driver.position.lng.toFixed(4)}`}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-slate-500 dark:text-slate-400">Nenhum motorista online no momento.</td>
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