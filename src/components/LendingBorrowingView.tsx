import React, { useState } from 'react';
import {
  HandCoins,
  Receipt,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Transaction } from '../types';

interface LendingBorrowingViewProps {
  onOpenAddModal: (defaultType?: string) => void;
  onSelectTransactionForEdit: (tx: Transaction) => void;
  onOpenRepaymentModal: (tx: Transaction) => void;
}

export const LendingBorrowingView: React.FC<LendingBorrowingViewProps> = ({
  onOpenAddModal,
  onSelectTransactionForEdit,
  onOpenRepaymentModal,
}) => {
  const { t } = useLanguage();
  const { activeWorkspace, transactions, financialSummary, deleteTransaction } = useFinance();
  const curr = activeWorkspace?.currency || '₹';

  const [activeTab, setActiveTab] = useState<'lent' | 'borrowed'>('lent');
  const [expandedRepayments, setExpandedRepayments] = useState<Record<string, boolean>>({});

  const lentTxs = transactions.filter((t) => t.type === 'lent');
  const borrowedTxs = transactions.filter((t) => t.type === 'borrowed');

  const activeList = activeTab === 'lent' ? lentTxs : borrowedTxs;

  const toggleExpand = (id: string) => {
    setExpandedRepayments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (tx: Transaction) => {
    if (window.confirm(`${t('Delete')} "${tx.description}"?`)) {
      await deleteTransaction(tx.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="lending-borrowing-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HandCoins className="w-6 h-6 text-amber-600" />
            {t('Lending & Borrowing')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('Money Lent')} &amp; {t('Money Borrowed')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAddModal('lent')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors"
            id="add-lent-cta"
          >
            <Plus className="w-4 h-4" />
            {t('Lend Money')}
          </button>
          <button
            type="button"
            onClick={() => onOpenAddModal('borrowed')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
            id="add-borrowed-cta"
          >
            <Plus className="w-4 h-4" />
            {t('Borrow Money')}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding to Collect */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-100">
            {t('To Collect (Lent)')}
          </span>
          <p className="text-2xl font-extrabold mt-1">
            {formatCurrency(financialSummary.outstandingLent, curr)}
          </p>
          <p className="text-[10px] text-amber-100 mt-2">
            {t('Money Lent')}: {formatCurrency(financialSummary.totalLent, curr)}
          </p>
        </div>

        {/* Total Outstanding to Repay */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-100">
            {t('To Repay (Borrowed)')}
          </span>
          <p className="text-2xl font-extrabold mt-1">
            {formatCurrency(financialSummary.outstandingBorrowed, curr)}
          </p>
          <p className="text-[10px] text-rose-100 mt-2">
            {t('Money Borrowed')}: {formatCurrency(financialSummary.totalBorrowed, curr)}
          </p>
        </div>

        {/* Total Lent Count */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            {t('Money Lent')} {t('Records')}
          </span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {lentTxs.filter((t) => t.repaymentStatus !== 'settled').length} {t('Pending')} / {lentTxs.length} {t('Total')}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">{t('Loans Given')}</p>
        </div>

        {/* Total Borrowed Count */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            {t('Money Borrowed')} {t('Records')}
          </span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {borrowedTxs.filter((t) => t.repaymentStatus !== 'settled').length} {t('Pending')} / {borrowedTxs.length} {t('Total')}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">{t('Loans Received')}</p>
        </div>
      </div>

      {/* Tabs for Lent vs Borrowed */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('lent')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'lent'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
          id="tab-money-lent"
        >
          <HandCoins className="w-4 h-4" />
          {t('Money Lent')} ({lentTxs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('borrowed')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'borrowed'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
          id="tab-money-borrowed"
        >
          <Receipt className="w-4 h-4" />
          {t('Money Borrowed')} ({borrowedTxs.length})
        </button>
      </div>

      {/* Records List */}
      <div className="space-y-3" id="lending-records-list">
        {activeList.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              {t('No data available')}
            </p>
            <button
              type="button"
              onClick={() => onOpenAddModal(activeTab)}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
            >
              {t('Add Transaction')}
            </button>
          </div>
        ) : (
          activeList.map((tx) => {
            const repaid = Number(tx.repaidAmount) || 0;
            const remaining = Math.max(0, tx.amount - repaid);
            const progress = tx.amount > 0 ? (repaid / tx.amount) * 100 : 0;
            const isSettled = tx.repaymentStatus === 'settled';
            const isExpanded = !!expandedRepayments[tx.id];

            return (
              <div
                key={tx.id}
                className="rounded-2xl p-4 sm:p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all"
                id={`lb-card-${tx.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`p-3 rounded-2xl flex-shrink-0 ${
                        activeTab === 'lent'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {activeTab === 'lent' ? <HandCoins className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {tx.sourceOrPerson || (activeTab === 'lent' ? t('Borrower') : t('Lender'))}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isSettled
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : repaid > 0
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isSettled ? t('Settled') : repaid > 0 ? t('Partially Repaid') : t('Pending')}
                        </span>

                        {tx.expectedRepaymentDate && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <Clock className="w-3 h-3 text-amber-500" />
                            {t('Due Date')}: {formatDate(tx.expectedRepaymentDate)}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {tx.description}
                      </p>

                      {/* Repayment Progress Bar */}
                      <div className="mt-3 max-w-md space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                          <span>{t('Total')}: {formatCurrency(tx.amount, curr)}</span>
                          <span>{t('Repaid')}: {formatCurrency(repaid, curr)} ({progress.toFixed(0)}%)</span>
                          <span className="text-slate-900 dark:text-white font-bold">
                            {t('Remaining')}: {formatCurrency(remaining, curr)}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isSettled ? 'bg-emerald-500' : activeTab === 'lent' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>

                      {/* Audit metadata */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span>{t('Date')}: {formatDate(tx.date)}</span>
                        <span>•</span>
                        <span>{tx.createdBy?.name}</span>
                        {tx.repayments && tx.repayments.length > 0 && (
                          <>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => toggleExpand(tx.id)}
                              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
                            >
                              {tx.repayments.length} {t('Repayments')}
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 sm:self-center pl-12 sm:pl-0">
                    {!isSettled && (
                      <button
                        type="button"
                        onClick={() => onOpenRepaymentModal(tx)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                        id={`repay-action-${tx.id}`}
                      >
                        <HandCoins className="w-3.5 h-3.5" />
                        {t('Record Repayment')}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectTransactionForEdit(tx)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                      title={t('Edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(tx)}
                      className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title={t('Delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Repayment History Accordion */}
                {isExpanded && tx.repayments && tx.repayments.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('Repayments')}
                    </p>
                    <div className="space-y-1.5">
                      {tx.repayments.map((rep) => (
                        <div
                          key={rep.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(rep.amount, curr)}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">{rep.comment || t('Repaid')}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {formatDate(rep.date)} • {rep.addedBy?.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
