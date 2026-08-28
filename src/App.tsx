import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar, NavTabType } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { RecurringTransactionsView } from './components/RecurringTransactionsView';
import { InvestmentsView } from './components/InvestmentsView';
import { LendingBorrowingView } from './components/LendingBorrowingView';
import { ReportsView } from './components/ReportsView';
import { TransactionModal } from './components/TransactionModal';
import { RepaymentModal } from './components/RepaymentModal';
import { WorkspaceModal } from './components/WorkspaceModal';
import { InviteModal } from './components/InviteModal';
import { AuthModal } from './components/AuthModal';
import { LanguageModal } from './components/LanguageModal';
import { Transaction } from './types';
import { ShieldAlert, HardDrive } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const { error, seedDemoData } = useFinance();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<NavTabType>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('fintrack_theme') === 'dark';
  });

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [txModalInitialType, setTxModalInitialType] = useState<string>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState<boolean>(false);
  const [repaymentTransaction, setRepaymentTransaction] = useState<Transaction | null>(null);

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fintrack_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fintrack_theme', 'light');
    }
  }, [darkMode]);

  const handleOpenAddModal = (defaultType: string = 'expense') => {
    setEditingTransaction(null);
    setTxModalInitialType(defaultType);
    setIsTxModalOpen(true);
  };

  const handleSelectTransactionForEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  const handleOpenRepaymentModal = (tx: Transaction) => {
    setRepaymentTransaction(tx);
    setIsRepaymentModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
        <div className="w-14 h-14 rounded-2xl overflow-hidden mb-4 shadow-lg shadow-emerald-600/30 border border-emerald-400/40 animate-pulse">
          <img src="/icon.png" alt="App Icon" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        </div>
        <p className="text-sm font-semibold">Initializing FinTrack Pro Offline Workspace...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error Banner if any */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={seedDemoData}
              className="underline hover:text-rose-900 dark:hover:text-rose-100"
            >
              Reset Data
            </button>
          </div>
        )}

        {/* Dynamic View Rendering */}
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenAddModal={handleOpenAddModal}
            onSelectTransactionForEdit={handleSelectTransactionForEdit}
            onOpenRepaymentModal={handleOpenRepaymentModal}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            onOpenAddModal={handleOpenAddModal}
            onSelectTransactionForEdit={handleSelectTransactionForEdit}
            onOpenRepaymentModal={handleOpenRepaymentModal}
          />
        )}

        {activeTab === 'budgets' && <BudgetsView />}

        {activeTab === 'recurring' && <RecurringTransactionsView />}

        {activeTab === 'investments' && (
          <InvestmentsView
            onOpenAddModal={handleOpenAddModal}
            onSelectTransactionForEdit={handleSelectTransactionForEdit}
          />
        )}

        {activeTab === 'lending_borrowing' && (
          <LendingBorrowingView
            onOpenAddModal={handleOpenAddModal}
            onSelectTransactionForEdit={handleSelectTransactionForEdit}
            onOpenRepaymentModal={handleOpenRepaymentModal}
          />
        )}

        {activeTab === 'reports' && <ReportsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 font-medium">
            <div className="w-6 h-6 rounded-lg overflow-hidden flex items-center justify-center border border-emerald-400/30">
              <img src="/icon.png" alt="FinTrack Pro Icon" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            </div>
            <span>{t('common.appName', 'FinTrack Pro')} — {t('common.tagline', '100% Offline Personal & Shared Finance Management')}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <HardDrive className="w-3.5 h-3.5" />
            <span>{t('common.offlineBadge', '100% Local Device Storage')}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        initialType={txModalInitialType}
        transactionToEdit={editingTransaction}
      />

      <RepaymentModal
        isOpen={isRepaymentModalOpen}
        onClose={() => setIsRepaymentModalOpen(false)}
        transaction={repaymentTransaction}
      />

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FinanceProvider>
          <MainAppContent />
        </FinanceProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
