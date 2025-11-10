import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import Fares from './components/Fares';
import Promotions from './components/Promotions';
import SupportChat from './components/SupportChat';
import Header from './components/Header';
import { View, User } from './types';
import RouteOptimization from './components/RouteOptimization';
import Login from './components/Login';
import { connectWebSocket } from './services/apiService';
import ProfileModal from './components/ProfileModal';
import RegisterUserModal from './components/RegisterUserModal';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeModal, setActiveModal] = useState<'profile' | 'register' | null>(null);

  useEffect(() => {
    connectWebSocket();
  }, []);

  const handleLoginSuccess = () => {
    // Mock de dados de usuário para demonstração
    const initialUsers: User[] = [
      { id: 1, name: 'Admin Goly', email: 'admin@goly.com', role: 'admin', avatarUrl: `https://i.pravatar.cc/150?u=admin@goly.com` },
      { id: 2, name: 'Operador Fulano', email: 'operador@goly.com', role: 'operator', avatarUrl: `https://i.pravatar.cc/150?u=operador@goly.com` },
    ];
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]); // Define o primeiro usuário como o admin logado
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };
  
  const handleUpdateUser = (updatedUser: User) => {
      // Simula a atualização do usuário
      setCurrentUser(updatedUser);
      setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
      alert('Perfil atualizado com sucesso!');
      handleCloseModal();
  };

  const handleRegisterUser = (newUser: Omit<User, 'id' | 'avatarUrl'>) => {
      // Simula o registro de um novo usuário
      const userWithId: User = { 
          ...newUser, 
          id: Date.now(), 
          avatarUrl: `https://i.pravatar.cc/150?u=${newUser.email}` 
      };
      setUsers(prevUsers => [...prevUsers, userWithId]);
      alert(`Usuário ${newUser.name} registrado com sucesso!`);
      handleCloseModal();
  };


  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderAdminView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        return <MapView />;
      case 'routeOptimization':
        return <RouteOptimization />;
      case 'fares':
        return <Fares />;
      case 'promotions':
        return <Promotions />;
      case 'support':
        return <SupportChat />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentUser && (
          <Header 
            currentView={currentView} 
            currentUser={currentUser}
            onLogout={handleLogout}
            onOpenModal={setActiveModal}
          />
        )}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderAdminView()}
        </div>
      </main>

      {activeModal === 'profile' && currentUser && (
        <ProfileModal 
          user={currentUser}
          onClose={handleCloseModal}
          onSave={handleUpdateUser}
        />
      )}
      {activeModal === 'register' && (
        <RegisterUserModal
          onClose={handleCloseModal}
          onSave={handleRegisterUser}
        />
      )}
    </div>
  );
};

export default App;