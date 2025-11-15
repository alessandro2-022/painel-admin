import React, { useState, useEffect } from 'react';
import { Driver, DriverStatus } from '../types.ts';
import Modal from './Modal.tsx';
import { createDriver, updateDriver } from '../services/apiService.ts';

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void; // Callback to refresh driver list
  editingDriver?: Driver | null; // Optional prop for editing existing driver
}

// Type for form data, excluding fields managed automatically or not directly editable via form
type DriverFormData = Omit<Driver, 'id' | 'avatarUrl' | 'position' | 'registeredAt'>;

const DriverFormModal: React.FC<DriverFormModalProps> = ({ isOpen, onClose, onSaveSuccess, editingDriver }) => {
  const initialState: DriverFormData = {
    name: '',
    email: '',
    phone: '',
    vehicleModel: '',
    licensePlate: '',
    status: 'offline', // New drivers start offline, existing can change
  };

  const [formData, setFormData] = useState<DriverFormData>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string | null}>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (editingDriver) {
      setFormData({
        name: editingDriver.name,
        email: editingDriver.email || '',
        phone: editingDriver.phone || '',
        vehicleModel: editingDriver.vehicleModel || '',
        licensePlate: editingDriver.licensePlate || '',
        status: editingDriver.status,
      });
    } else {
      setFormData(initialState);
    }
    setErrors({}); // Clear errors when modal opens or editingDriver changes
    setGlobalError(null);
  }, [editingDriver, isOpen]);

  if (!isOpen) return null;

  const validateField = (name: keyof DriverFormData, value: string): string | null => {
    switch (name) {
      case 'name':
        return value.trim() ? null : 'O nome é obrigatório.';
      case 'email':
        if (!value.trim()) return 'O e-mail é obrigatório.';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Formato de e-mail inválido.';
        return null;
      case 'phone':
        // Optional phone validation (simple regex, can be more complex)
        if (value && !/^\d{10,11}$/.test(value.replace(/\D/g, ''))) return 'Número de telefone inválido (10 ou 11 dígitos).';
        return null;
      case 'licensePlate':
        // Optional license plate validation (example format: AAA-1234 or ABC1D23)
        if (value && !/^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(value.toUpperCase())) return 'Formato de placa inválido (ex: ABC1234 ou ABC1D23).';
        return null;
      default:
        return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Validate on change to provide immediate feedback, but store it in errors state.
    setErrors(prev => ({ ...prev, [name]: validateField(name as keyof DriverFormData, value) }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    // Run all validations again for final check
    const newErrors: {[key: string]: string | null} = {};
    (Object.keys(formData) as Array<keyof DriverFormData>).forEach(key => {
        newErrors[key] = validateField(key, formData[key] as string);
    });
    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== null);
    if (hasErrors) {
      setGlobalError('Por favor, corrija os erros no formulário.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, formData);
      } else {
        await createDriver(formData);
      }
      onSaveSuccess();
      onClose(); // Close modal on success
    } catch (err) {
      console.error("Failed to save driver:", err);
      setGlobalError(`Falha ao salvar motorista: ${err instanceof Error ? err.message : 'Erro desconhecido.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = !Object.values(errors).some(error => error !== null) && 
                      formData.name.trim() !== '' && 
                      formData.email.trim() !== '' &&
                      !isSaving;

  const title = editingDriver ? `Editar Motorista: ${editingDriver.name}` : 'Cadastrar Novo Motorista';

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSave} className="space-y-4">
        {globalError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm" role="alert">{globalError}</div>}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-600">Nome Completo</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={(e) => setErrors(prev => ({ ...prev, name: validateField('name', e.target.value) }))}
            required
            className={`mt-1 block w-full p-3 border-slate-300 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] text-slate-900 ${errors.name ? 'border-red-500' : ''}`}
            aria-invalid={!!errors.name}
            aria-describedby="name-error"
          />
          {errors.name && <p id="name-error" className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-600">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={(e) => setErrors(prev => ({ ...prev, email: validateField('email', e.target.value) }))}
            required
            className={`mt-1 block w-full p-3 border-slate-300 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] text-slate-900 ${errors.email ? 'border-red-500' : ''}`}
            aria-invalid={!!errors.email}
            aria-describedby="email-error"
          />
          {errors.email && <p id="email-error" className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-600">Telefone (opcional)</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            onBlur={(e) => setErrors(prev => ({ ...prev, phone: validateField('phone', e.target.value) }))}
            className={`mt-1 block w-full p-3 border-slate-300 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] text-slate-900 ${errors.phone ? 'border-red-500' : ''}`}
            placeholder="Ex: 11987654321"
            aria-invalid={!!errors.phone}
            aria-describedby="phone-error"
          />
          {errors.phone && <p id="phone-error" className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="vehicleModel" className="block text-sm font-medium text-slate-600">Modelo do Veículo (opcional)</label>
          <input
            type="text"
            id="vehicleModel"
            name="vehicleModel"
            value={formData.vehicleModel}
            onChange={handleInputChange}
            className="mt-1 block w-full p-3 border-slate-300 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] text-slate-900"
            placeholder="Ex: Fiat Uno"
          />
        </div>
        <div>
          <label htmlFor="licensePlate" className="block text-sm font-medium text-slate-600">Placa do Veículo (opcional)</label>
          <input
            type="text"
            id="licensePlate"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleInputChange}
            onBlur={(e) => setErrors(prev => ({ ...prev, licensePlate: validateField('licensePlate', e.target.value) }))}
            className={`mt-1 block w-full p-3 border-slate-300 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] text-slate-900 ${errors.licensePlate ? 'border-red-500' : ''}`}
            placeholder="Ex: ABC1234 ou ABC1D23"
            maxLength={7}
            aria-invalid={!!errors.licensePlate}
            aria-describedby="licensePlate-error"
          />
          {errors.licensePlate && <p id="licensePlate-error" className="text-red-500 text-sm mt-1">{errors.licensePlate}</p>}
        </div>
        {editingDriver && ( // Only show status for existing drivers
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-600">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 block w-full p-3 border-slate-300 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] text-slate-900"
            >
              <option value="online">Online</option>
              <option value="on_trip">Em Viagem</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        )}
        {editingDriver && (
            <div>
                <label className="block text-sm font-medium text-slate-600">Registrado em</label>
                <p className="mt-1 block w-full p-3 bg-slate-50 rounded-md text-slate-700">{new Date(editingDriver.registeredAt).toLocaleDateString('pt-BR')}</p>
            </div>
        )}
        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isSaving}
            className="px-4 py-2 bg-[#0057b8] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DriverFormModal;