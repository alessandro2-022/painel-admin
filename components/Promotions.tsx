import React, { useState, useEffect, useRef } from 'react';
import { Promotion } from '../types';
import EditIcon from './icons/EditIcon';
import HistoryIcon from './icons/HistoryIcon';
import { MOCK_PROMOTIONS } from '../constants';

type FormData = Omit<Promotion, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'history'>;

const Promotions: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
    const [historyModalPromo, setHistoryModalPromo] = useState<Promotion | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState('');
    const [dateFilter, setDateFilter] = useState({ startDate: '', endDate: '' });
    const formRef = useRef<HTMLFormElement>(null);

    const emptyForm: FormData = { code: '', discount: 0, target: 'user' };
    const [formData, setFormData] = useState<FormData>(emptyForm);
    
    const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

    // Simula o carregamento de dados de uma API
    useEffect(() => {
        setTimeout(() => {
            setPromotions(MOCK_PROMOTIONS);
            setFilteredPromotions(MOCK_PROMOTIONS);
            setIsLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        if (editingPromo) {
            setFormData({
                code: editingPromo.code,
                discount: editingPromo.discount,
                target: editingPromo.target,
            });
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        } else {
            setFormData(emptyForm);
        }
    }, [editingPromo]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'discount' ? parseInt(value, 10) || 0 : value.toUpperCase() }));
    };

    const handleTargetChange = (target: 'user' | 'driver') => {
        setFormData(prev => ({...prev, target}));
    };
    
    const createHistoryEntry = (oldPromo: Promotion, newPromoData: Partial<Promotion>): string | null => {
        const changes: string[] = [];
        if (oldPromo.discount !== newPromoData.discount) {
            changes.push(`Desconto alterado de ${oldPromo.discount}% para ${newPromoData.discount}%.`);
        }
        if (oldPromo.target !== newPromoData.target) {
            changes.push(`Público alterado de '${oldPromo.target}' para '${newPromoData.target}'.`);
        }
         if (oldPromo.code !== newPromoData.code) {
            changes.push(`Código alterado de '${oldPromo.code}' para '${newPromoData.code}'.`);
        }
        return changes.length > 0 ? changes.join(' ') : null;
    };
    
    const applyCurrentFilter = (sourcePromotions: Promotion[], currentFilter: { startDate: string; endDate: string }) => {
        let filtered = [...sourcePromotions];
        const { startDate, endDate } = currentFilter;

        if (startDate) {
            const start = new Date(startDate);
            start.setUTCHours(0, 0, 0, 0);
            filtered = filtered.filter(p => new Date(p.createdAt) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999);
            filtered = filtered.filter(p => new Date(p.createdAt) <= end);
        }
        setFilteredPromotions(filtered);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.code || formData.discount <= 0) return;
        
        setIsSaving(true);
        setTimeout(() => {
            const now = new Date().toISOString();
            let updatedPromotions: Promotion[];

            if (editingPromo) {
                const changeDescription = createHistoryEntry(editingPromo, formData);
                const updatedHistory = [...editingPromo.history];
                if(changeDescription) {
                    updatedHistory.unshift({ date: now, change: changeDescription });
                }

                updatedPromotions = promotions.map(p => p.id === editingPromo.id ? { ...editingPromo, ...formData, updatedAt: now, history: updatedHistory } : p);
                setShowSuccess(`Promoção "${formData.code}" atualizada!`);
            } else {
                const newPromo: Promotion = {
                    id: `promo-${Date.now()}`,
                    ...formData,
                    isActive: true,
                    createdAt: now,
                    updatedAt: now,
                    history: [{ date: now, change: 'Promoção criada.' }]
                };
                updatedPromotions = [newPromo, ...promotions];
                setShowSuccess(`Promoção "${formData.code}" criada!`);
            }
            setPromotions(updatedPromotions);
            applyCurrentFilter(updatedPromotions, dateFilter);
            
            setIsSaving(false);
            setEditingPromo(null);
            setTimeout(() => setShowSuccess(''), 3000);
        }, 1000);
    };

    const handleToggleStatus = (id: string) => {
        const now = new Date().toISOString();
        const updatedPromotions = promotions.map(p => {
            if (p.id === id) {
                const newStatus = !p.isActive;
                const updatedHistory = [...p.history, { date: now, change: `Status alterado para ${newStatus ? 'Ativo' : 'Inativo'}.` }].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                return { ...p, isActive: newStatus, updatedAt: now, history: updatedHistory };
            }
            return p;
        });
        setPromotions(updatedPromotions);
        applyCurrentFilter(updatedPromotions, dateFilter);
    };

    const handleCancelEdit = () => {
        setEditingPromo(null);
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateFilter({ ...dateFilter, [e.target.name]: e.target.value });
    };

    const handleApplyFilter = () => {
        applyCurrentFilter(promotions, dateFilter);
    };

    const handleClearFilter = () => {
        setDateFilter({ startDate: '', endDate: '' });
        setFilteredPromotions([...promotions]);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Tabela de Promoções Existentes */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md dark:border dark:border-slate-700">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">Gerenciar Promoções</h2>
                
                {/* Filtro de Data */}
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="lg:col-span-2">
                            <label htmlFor="startDate" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Criadas a partir de</label>
                            <input type="date" name="startDate" id="startDate" value={dateFilter.startDate} onChange={handleFilterChange} className="mt-1 block w-full p-2 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200"/>
                        </div>
                        <div className="lg:col-span-2">
                            <label htmlFor="endDate" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Até</label>
                            <input type="date" name="endDate" id="endDate" value={dateFilter.endDate} onChange={handleFilterChange} className="mt-1 block w-full p-2 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200"/>
                        </div>
                        <div className="flex gap-2 lg:col-span-1">
                            <button onClick={handleApplyFilter} className="w-full px-4 py-2 bg-[#0057b8] text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition-colors">Filtrar</button>
                            <button onClick={handleClearFilter} className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Limpar</button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-slate-700">
                                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Código</th>
                                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Desconto</th>
                                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Público</th>
                                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                <th className="p-3 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-4 text-slate-500 dark:text-slate-400">Carregando promoções...</td>
                                </tr>
                            ) : filteredPromotions.length > 0 ? (
                                filteredPromotions.map(promo => (
                                    <tr key={promo.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="p-3 font-mono text-slate-700 dark:text-slate-200">{promo.code}</td>
                                        <td className="p-3 font-medium text-slate-700 dark:text-slate-200">{promo.discount}%</td>
                                        <td className="p-3 capitalize text-slate-500 dark:text-slate-400">{promo.target === 'user' ? 'Usuários' : 'Motoristas'}</td>
                                        <td className="p-3">
                                            <label htmlFor={`toggle-${promo.id}`} className="flex items-center cursor-pointer">
                                                <div className="relative">
                                                    <input type="checkbox" id={`toggle-${promo.id}`} className="sr-only" checked={promo.isActive} onChange={() => handleToggleStatus(promo.id)} />
                                                    <div className={`block w-14 h-8 rounded-full transition ${promo.isActive ? 'bg-[#0057b8]' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${promo.isActive ? 'translate-x-6' : ''}`}></div>
                                                </div>
                                            </label>
                                        </td>
                                        <td className="p-3 text-right space-x-2">
                                            <button onClick={() => setHistoryModalPromo(promo)} className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Ver histórico">
                                                <HistoryIcon className="h-5 w-5"/>
                                            </button>
                                            <button onClick={() => setEditingPromo(promo)} className="p-2 text-slate-500 hover:text-[#0057b8] dark:hover:text-blue-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Editar">
                                                <EditIcon />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-4 text-slate-500 dark:text-slate-400">Nenhuma promoção encontrada para os filtros selecionados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Formulário de Criação/Edição */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md dark:border dark:border-slate-700">
                <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
                    {editingPromo ? `Editando Promoção: ${editingPromo.code}` : 'Criar Nova Promoção'}
                </h2>
                <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Código Promocional</label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-3 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400 font-mono"
                            placeholder="ex: GOLYVERAO24"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="discount" className="block text-sm font-medium text-slate-600 dark:text-slate-300">Valor do Desconto</label>
                         <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                                type="number"
                                id="discount"
                                name="discount"
                                value={formData.discount === 0 ? '' : formData.discount}
                                onChange={handleInputChange}
                                className="block w-full p-3 border-slate-300 dark:border-slate-600 rounded-md focus:ring-[#0057b8] focus:border-[#0057b8] dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-400"
                                placeholder="ex: 10"
                                required
                                min="1"
                                max="100"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">%</div>
                        </div>
                    </div>
                    <div>
                        <span className="block text-sm font-medium text-slate-600 dark:text-slate-300">Público-Alvo</span>
                        <div className="mt-2 flex space-x-4">
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" name="target" value="user" checked={formData.target === 'user'} onChange={() => handleTargetChange('user')} className="focus:ring-[#0057b8] h-4 w-4 text-[#0057b8] border-slate-300" />
                                <span className="ml-2">Usuários</span>
                            </label>
                             <label className="flex items-center cursor-pointer">
                                <input type="radio" name="target" value="driver" checked={formData.target === 'driver'} onChange={() => handleTargetChange('driver')} className="focus:ring-[#0057b8] h-4 w-4 text-[#0057b8] border-slate-300" />
                                <span className="ml-2">Motoristas</span>
                            </label>
                        </div>
                    </div>
                     <div className="pt-4 flex justify-end items-center gap-4">
                         {showSuccess && <p className="text-green-600 dark:text-green-400 transition-opacity duration-300">{showSuccess}</p>}
                         {editingPromo && (
                             <button type="button" onClick={handleCancelEdit} className="px-6 py-3 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                                 Cancelar
                             </button>
                         )}
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-3 bg-[#0057b8] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSaving ? 'Salvando...' : (editingPromo ? 'Salvar Alterações' : 'Criar Promoção')}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Modal de Histórico da Promoção */}
            {historyModalPromo && (
                <div 
                  className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in" 
                  onClick={() => setHistoryModalPromo(null)} 
                  role="dialog" 
                  aria-modal="true"
                  aria-labelledby="promo-history-title"
                >
                    <div 
                      className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-up" 
                      onClick={e => e.stopPropagation()}
                    >
                        <header className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 id="promo-history-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                Histórico de Alterações
                            </h2>
                             <p className="text-sm text-slate-500 dark:text-slate-400">
                                Promoção: <span className="font-mono text-[#0057b8]">{historyModalPromo.code}</span>
                            </p>
                        </header>
                        <main className="p-6 flex-1 overflow-y-auto">
                            <div className="text-sm space-y-2 mb-6 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-lg">
                                <p><span className="font-semibold text-slate-600 dark:text-slate-300">Criada em:</span> {formatDate(historyModalPromo.createdAt)}</p>
                                <p><span className="font-semibold text-slate-600 dark:text-slate-300">Última Atualização:</span> {formatDate(historyModalPromo.updatedAt)}</p>
                            </div>

                            <ul className="border-l-2 border-slate-200 dark:border-slate-600 ml-2 space-y-6">
                                {historyModalPromo.history.map((entry, index) => (
                                    <li key={index} className="relative pl-8">
                                        <div className="absolute -left-[11px] top-1 w-5 h-5 bg-[#0057b8] rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center">
                                          <HistoryIcon className="w-3 h-3 text-white" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatDate(entry.date)}</p>
                                        <p className="text-slate-600 dark:text-slate-400">{entry.change}</p>
                                    </li>
                                ))}
                            </ul>
                        </main>
                        <footer className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                            <button onClick={() => setHistoryModalPromo(null)} className="px-5 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                                Fechar
                            </button>
                        </footer>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-scale-up { animation: scale-up 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Promotions;