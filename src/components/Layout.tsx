import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, LogOut, Menu, X, Calendar, HelpCircle, Info, BarChart3, FileText, Euro, Settings, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top navigation bar */}
      <header className="bg-teal-600 text-white shadow-md">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-teal-700 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-semibold">KinéTrack</h1>
          </div>
          {currentUser && (
            <div className="flex items-center space-x-2">
              <span className="hidden md:inline text-sm">
                {currentUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md hover:bg-teal-700 transition-colors"
                aria-label="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar navigation */}
        <aside 
          className={`${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:relative z-10 w-64 h-[calc(100vh-56px)] bg-white shadow-lg transition-transform duration-300 ease-in-out`}
        >
          <nav className="flex flex-col h-full p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    navigate('/');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    isActive('/') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Home size={20} />
                  <span>Tableau de bord</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate('/patients');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    isActive('/patients') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Users size={20} />
                  <span>Patients</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate('/calendar');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    isActive('/calendar') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Calendar size={20} />
                  <span>Agenda</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate('/statistics');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    isActive('/statistics') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 size={20} />
                  <span>Statistiques</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate('/reports');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    isActive('/reports') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <FileText size={20} />
                  <span>Rapports</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate('/financial');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    isActive('/financial') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Euro size={20} />
                  <span>Finances</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate('/help');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    isActive('/help') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <HelpCircle size={20} />
                  <span>Aide</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    isActive('/settings') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Settings size={20} />
                  <span>Paramètres</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                    isActive('/profile') 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <User size={20} />
                  <span>Profil</span>
                </button>
              </li>
            </ul>
            
            <div className="mt-auto pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  navigate('/about');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                  isActive('/about') 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Info size={20} />
                <span>À propos</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Overlay when menu is open on mobile */}
        {isMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/30 z-[5]"
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;