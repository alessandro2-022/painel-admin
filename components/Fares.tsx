import React, { useState } from 'react';

const InputField: React.FC<{ label: string, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, unit?: string }> = 
  ({ label, id, value, onChange, type = 'number', unit }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
    <div className="mt-1 relative rounded-md shadow-sm">
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className="block w-full p-3 border-slate-300 dark:border-slate-600 rounded-md focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400"
        placeholder="0.00"
      />
      {unit && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">{unit}</div>}
    </div>
  </div>
);


const Fares: React.FC = () => {
    const [userFares, setUserFares] = useState({ base: '5.00', perKm: '1.50', perMin: '0.30' });
    const [driverFares, setDriverFares] = useState({ commission: '25' });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1000);
    };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <form onSubmit={handleSave}>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md space-y-6 dark:border dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Tarifas para Usuários</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Defina a estrutura de preços para os clientes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="Tarifa Base" id="userBase" value={userFares.base} onChange={e => setUserFares({...userFares, base: e.target.value})} unit="BRL" />
            <InputField label="Por Quilômetro" id="userPerKm" value={userFares.perKm} onChange={e => setUserFares({...userFares, perKm: e.target.value})} unit="BRL" />
            <InputField label="Por Minuto" id="userPerMin" value={userFares.perMin} onChange={e => setUserFares({...userFares, perMin: e.target.value})} unit="BRL" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md space-y-6 mt-8 dark:border dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Tarifas para Motoristas</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Defina a taxa de comissão para os motoristas.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <InputField label="Comissão da Plataforma" id="driverCommission" value={driverFares.commission} onChange={e => setDriverFares({...driverFares, commission: e.target.value})} unit="%" />
          </div>
        </div>
        
        <div className="mt-8 flex justify-end items-center">
            {showSuccess && <p className="text-green-600 dark:text-green-400 mr-4 transition-opacity duration-300">Configurações salvas com sucesso!</p>}
            <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-[#0057b8] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default Fares;