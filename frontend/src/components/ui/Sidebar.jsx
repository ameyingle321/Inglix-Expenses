import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, Trophy, LogOut, Receipt } from 'lucide-react';
import clsx from 'clsx';

export const Sidebar = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Receipt className="w-5 h-5" />, label: 'Expenses', path: '/expenses' },
    { icon: <Users className="w-5 h-5" />, label: 'Contacts', path: '/contacts' },
    { icon: <Trophy className="w-5 h-5" />, label: 'Leaderboard', path: '/leaderboard' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-lg text-brand-dark">
          <div className="w-8 h-8 bg-brand-dark rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm" />
          </div>
          Inglix Expenses
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                isActive 
                  ? "bg-brand-accent/10 text-brand-accent" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-brand-dark"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-600 font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
};
