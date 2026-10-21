import React from 'react';
import { BookOpen, ShieldCheck, ShoppingCart, User, ClipboardList, Code, FileText, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../data/bookstoreData';

interface NavbarProps {
  activeTab: 'store' | 'admin' | 'audit' | 'tests' | 'code' | 'viva';
  setActiveTab: (tab: 'store' | 'admin' | 'audit' | 'tests' | 'code' | 'viva') => void;
  currentUser: UserAccount | null;
  users: UserAccount[];
  switchUser: (userId: number | null) => void;
  cartCount: number;
  openCart: () => void;
  auditPassCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  users,
  switchUser,
  cartCount,
  openCart,
  auditPassCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-4 py-1.5 text-xs text-slate-300 flex flex-wrap justify-between items-center border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-amber-300">Alliance University</span>
          <span className="text-slate-400">|</span>
          <span>B.Tech CSE Capstone Micro-Project: Online Book Store (Jakarta EE + MySQL)</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> QA Audit Status: {auditPassCount}/20 Checks Verified
          </span>
          <span className="text-slate-400">Tomcat 10.1 • Java 17 • MySQL 8</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('store')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight tracking-tight flex items-center gap-2">
                <span>BookHaven</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-mono">v1.0-JEE</span>
              </div>
              <p className="text-[11px] text-slate-400">Online Book Store Management</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('store')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'store'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Storefront
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Admin Portal
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> QA Audit (20)
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'tests'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Test Runner
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code className="w-4 h-4" /> Code Explorer
            </button>

            <button
              onClick={() => setActiveTab('viva')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'viva'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" /> Viva Guide
            </button>
          </nav>

          {/* Right Action: Cart & Role Simulator Switcher */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="View Shopping Cart"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Session Switcher (Simulates Login/Logout/Role switching) */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700">
              <User className="w-4 h-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 leading-none">Active Session:</span>
                <select
                  value={currentUser ? currentUser.id : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    switchUser(val ? parseInt(val, 10) : null);
                  }}
                  className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
                  aria-label="Simulate User Session"
                >
                  <option value="" className="bg-slate-800 text-white">Guest (Logged Out)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-800 text-white">
                      {u.role === 'ADMIN' ? '🛡️ Admin: ' : '👤 Customer: '} {u.fullName.split(' ')[0]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex overflow-x-auto gap-1 px-4 py-2 bg-slate-950 border-t border-slate-800 text-xs">
        <button onClick={() => setActiveTab('store')} className={`px-2.5 py-1.5 rounded whitespace-nowrap ${activeTab === 'store' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Store</button>
        <button onClick={() => setActiveTab('admin')} className={`px-2.5 py-1.5 rounded whitespace-nowrap ${activeTab === 'admin' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Admin</button>
        <button onClick={() => setActiveTab('audit')} className={`px-2.5 py-1.5 rounded whitespace-nowrap ${activeTab === 'audit' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Audit (20)</button>
        <button onClick={() => setActiveTab('tests')} className={`px-2.5 py-1.5 rounded whitespace-nowrap ${activeTab === 'tests' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Tests</button>
        <button onClick={() => setActiveTab('code')} className={`px-2.5 py-1.5 rounded whitespace-nowrap ${activeTab === 'code' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Code</button>
        <button onClick={() => setActiveTab('viva')} className={`px-2.5 py-1.5 rounded whitespace-nowrap ${activeTab === 'viva' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}>Viva</button>
      </div>
    </header>
  );
};
