import React, { useState, useRef } from 'react';
import {
  Plus,
  Users,
  ChevronDown,
  LogOut,
  UserCheck,
  Moon,
  Sun,
  FileSpreadsheet,
  TrendingUp,
  HandCoins,
  Receipt,
  LayoutDashboard,
  Check,
  UserPlus,
  Sparkles,
  PieChart as PieChartIcon,
  Repeat,
  Download,
  Upload,
  HardDrive,
  Globe,
  Languages,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';

export type NavTabType =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'recurring'
  | 'investments'
  | 'lending_borrowing'
  | 'reports';

interface NavbarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  onOpenAddModal: (defaultType?: string) => void;
  onOpenWorkspaceModal: () => void;
  onOpenInviteModal: () => void;
  onOpenAuthModal: () => void;
  onOpenLanguageModal: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenWorkspaceModal,
  onOpenInviteModal,
  onOpenAuthModal,
  onOpenLanguageModal,
  darkMode,
  setDarkMode,
}) => {
  const { user, demoUsers, switchDemoUser, logout } = useAuth();
  const { language, currentLanguage, t } = useLanguage();
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    seedDemoData,
    updateWorkspace,
    exportBackup,
    importBackup,
  } = useFinance();

  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currencies = [
    { symbol: '₹', name: 'INR (₹)' },
    { symbol: '$', name: 'USD ($)' },
    { symbol: '€', name: 'EUR (€)' },
    { symbol: '£', name: 'GBP (£)' },
  ];

  const handleCurrencyChange = async (curr: string) => {
    if (activeWorkspace) {
      await updateWorkspace(activeWorkspace.id, { currency: curr });
    }
    setIsCurrencyMenuOpen(false);
  };

  const handleExportBackup = () => {
    try {
      const json = exportBackup();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FinTrack_Pro_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupNotice(t('Offline backup downloaded successfully!'));
      setTimeout(() => setBackupNotice(null), 3000);
      setIsUserMenuOpen(false);
    } catch {
      setBackupNotice(t('Failed to export backup.'));
      setTimeout(() => setBackupNotice(null), 3000);
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const res = importBackup(text);
        if (res.success) {
          setBackupNotice(res.message || t('Backup restored successfully!'));
        } else {
          setBackupNotice(res.error || t('Failed to restore backup'));
        }
        setTimeout(() => setBackupNotice(null), 4000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsUserMenuOpen(false);
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors" id="main-navbar">
      {/* Hidden file input for restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFileChange}
        accept=".json"
        className="hidden"
      />

      {backupNotice && (
        <div className="bg-emerald-600 text-white text-xs text-center py-1.5 font-medium px-4 animate-in fade-in">
          {backupNotice}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Workspace Switcher */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')} id="brand-logo">
              {/* App Icon */}
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm shadow-emerald-500/20 border border-emerald-400/30 bg-emerald-700 flex items-center justify-center">
                <img src="/icon.png" alt="FinTrack Pro Icon" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  FinTrack<span className="text-emerald-500 text-sm font-semibold">Pro</span>
                </span>
                <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {t('Local & Offline Finance')}
                </span>
              </div>
            </div>

            {/* Workspace selector dropdown */}
            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[200px]"
                  id="workspace-switcher-btn"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{activeWorkspace?.name || t('Workspaces')}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
                </button>

                {isWorkspaceDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsWorkspaceDropdownOpen(false)} />
                    <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-100" id="workspace-dropdown-menu">
                      <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {t('Workspaces')}
                      </div>
                      <div className="max-h-56 overflow-y-auto">
                        {workspaces.map((ws) => (
                          <div
                            key={ws.id}
                            onClick={() => {
                              setActiveWorkspace(ws);
                              setIsWorkspaceDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 ${
                              ws.id === activeWorkspace?.id
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                            id={`ws-item-${ws.id}`}
                          >
                            <div className="truncate pr-2">
                              <p className="truncate font-medium">{ws.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {ws.members.length} {t('Members')} • Code: {ws.code}
                              </p>
                            </div>
                            {ws.id === activeWorkspace?.id && (
                              <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-1.5 px-2 flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsWorkspaceDropdownOpen(false);
                            onOpenWorkspaceModal();
                          }}
                          className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left transition-colors"
                          id="create-workspace-btn"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {t('Create Workspace')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsWorkspaceDropdownOpen(false);
                            onOpenInviteModal();
                          }}
                          className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-colors"
                          id="manage-members-btn"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          {t('Add Member')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Offline Local Status indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium" title="100% Private Offline Storage on your device">
              <HardDrive className="w-3 h-3 text-emerald-500" />
              <span>{t('Offline Ready')}</span>
            </div>
          </div>

          {/* Center: Navigation Links for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              id="nav-tab-dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              {t('Dashboard')}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              id="nav-tab-transactions"
            >
              <Receipt className="w-3.5 h-3.5" />
              {t('Transactions')}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('budgets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'budgets'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              id="nav-tab-budgets"
            >
              <PieChartIcon className="w-3.5 h-3.5" />
              {t('Budgets')}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('recurring')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'recurring'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              id="nav-tab-recurring"
            >
              <Repeat className="w-3.5 h-3.5" />
              {t('Recurring')}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('investments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'investments'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              id="nav-tab-investments"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {t('SIP & Investments')}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lending_borrowing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'lending_borrowing'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              id="nav-tab-lending"
            >
              <HandCoins className="w-3.5 h-3.5" />
              {t('Lending & Borrowing')}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'reports'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              id="nav-tab-reports"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {t('Reports')}
            </button>
          </nav>

          {/* Right: Actions, Language, Currency, Theme & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Selector Button */}
            <button
              type="button"
              onClick={onOpenLanguageModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors shadow-sm"
              title={`Change Language (${currentLanguage.name} - ${currentLanguage.nativeName})`}
              id="language-switcher-btn"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="max-w-[75px] sm:max-w-[100px] truncate">{currentLanguage.nativeName}</span>
            </button>

            {/* Quick Add CTA */}
            <button
              type="button"
              onClick={() => onOpenAddModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm shadow-emerald-600/30 transition-colors"
              id="quick-add-tx-btn"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Add Entry')}</span>
            </button>

            {/* Currency Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                title="Change Currency"
                id="currency-selector-btn"
              >
                {activeWorkspace?.currency || '₹'}
              </button>

              {isCurrencyMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsCurrencyMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-30" id="currency-dropdown">
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase text-slate-400">
                      {t('Currency')}
                    </div>
                    {currencies.map((c) => (
                      <button
                        key={c.symbol}
                        type="button"
                        onClick={() => handleCurrencyChange(c.symbol)}
                        className={`flex items-center justify-between w-full px-3 py-1.5 text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-700 ${
                          activeWorkspace?.currency === c.symbol
                            ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{c.name}</span>
                        {activeWorkspace?.currency === c.symbol && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Dark Mode toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              id="theme-toggle-btn"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile / Offline Data Menu */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  id="user-profile-menu-btn"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center border border-emerald-500/40">
                    {getUserInitials(user.name)}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-100" id="user-profile-dropdown">
                      {/* Active user header */}
                      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                          {t('Offline Ready')}
                        </span>
                      </div>

                      {/* Language Selection Option */}
                      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                          {t('Language')}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenLanguageModal();
                          }}
                          className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-left transition-colors font-medium"
                          id="user-menu-language-btn"
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-emerald-500" />
                            <span>{t('Change Language')}</span>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            {currentLanguage.nativeName}
                          </span>
                        </button>
                      </div>

                      {/* Offline Data Management */}
                      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                          {t('Offline Backup & Restore')}
                        </p>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={handleExportBackup}
                            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-left transition-colors font-medium"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-500" />
                            {t('Export Local Backup (.json)')}
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-left transition-colors font-medium"
                          >
                            <Upload className="w-3.5 h-3.5 text-blue-500" />
                            {t('Restore from Backup (.json)')}
                          </button>
                        </div>
                      </div>

                      {/* Demo User Switcher */}
                      <div className="px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1">
                          <UserCheck className="w-3 h-3 text-emerald-500" />
                          {t('Switch Profile')}
                        </p>
                        <div className="flex flex-col gap-1">
                          {demoUsers.map((du) => (
                            <button
                              key={du.id}
                              type="button"
                              onClick={() => {
                                switchDemoUser(du);
                                setIsUserMenuOpen(false);
                              }}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                du.id === user.id
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                              id={`switch-to-${du.id}`}
                            >
                              <div className="w-5 h-5 rounded-full bg-slate-600 text-white text-[10px] font-bold flex items-center justify-center">
                                {getUserInitials(du.name)}
                              </div>
                              <span className="truncate flex-1 text-left">{du.name}</span>
                              {du.id === user.id && <span className="text-[10px] text-emerald-500 font-bold">{t('Active')}</span>}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700 px-2 pt-2 flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            seedDemoData();
                          }}
                          className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg text-left transition-colors"
                          id="seed-demo-btn"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {t('Reset to Clean Default Data')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenAuthModal();
                          }}
                          className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-left transition-colors"
                          id="create-account-btn"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          {t('Create Profile')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-left transition-colors"
                          id="logout-btn"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          {t('Log Out')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                id="sign-in-btn"
              >
                {t('Sign In')}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden items-center justify-start py-2 border-t border-slate-200 dark:border-slate-800 overflow-x-auto gap-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('Dashboard')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('Transactions')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('budgets')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'budgets'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('Budgets')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recurring')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'recurring'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('Recurring')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('investments')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'investments'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('SIP & Investments')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lending_borrowing')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'lending_borrowing'
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('Lending & Borrowing')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t('Reports')}
          </button>
        </div>
      </div>
    </header>
  );
};
