import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './ui/Sidebar';
import { LogOut } from 'lucide-react';

const Layout = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-brand-light flex">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden">
           <div className="flex items-center gap-2 font-bold text-lg text-brand-dark">
            <div className="w-8 h-8 bg-brand-dark rounded-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-sm" />
            </div>
            Inglix
          </div>
          <button onClick={signOut} className="p-2 text-slate-500 hover:text-red-600">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
