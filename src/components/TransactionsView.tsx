import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  HandCoins,
  CheckCircle2,
  Clock,
  Users,
  X,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDate, formatDateTime, CATEGORY_META } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { Transaction, TransactionType } from '../types';

interface TransactionsViewProps {
  onOpenAddModal: (defaultType?: string) => void;
  onSelectTransactionForEdit: (tx: Transaction) => void;
  onOpenRepaymentModal: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddModal,
  onSelectTransactionForEdit,
  onOpenRepaymentModal,
}) => {
  const { t } = useLanguage();
  const {
    activeWorkspace,
    filteredTransactions,
    transactions,
    filter,
    setFilter,
    resetFilter,
    deleteTransaction,
  } = useFinance();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const curr = activeWorkspace?.currency || '₹';

  const typeTabs: { id: TransactionType | 'all'; label: string }[] = [
    { id: 'all', label: t('All Transactions') },
    { id: 'income', label: t('Income & Funds') },
    { id: 'expense', label: t('Expenses') },
    { id: 'investment', label: t('SIP & Investments') },
    { id: 'lent', label: t('Money Lent') },
    { id: 'borrowed', label: t('Money Borrowed') },
  ];

  const handleDelete = async (tx: Transaction) => {
    if (window.confirm(`${t('Delete')} "${tx.description}"?`)) {
      setDeletingId(tx.id);
      await deleteTransaction(tx.id);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="transactions-view">
      {/* Header & Main Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('Transactions')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredTransactions.length} / {transactions.length} {t('All')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAddModal(filter.type !== 'all' ? filter.type : 'expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            id="add-tx-btn-ledger"
          >
            <Plus className="w-4 h-4" />
            {t('Add Transaction')}
          </button>
        </div>
      </div>

      {/* Filter Tabs by Type */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {typeTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter((prev) => ({ ...prev, type: tab.id }))}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filter.type === tab.id
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60'
            }`}
            id={`filter-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Quick Filters Bar */}
      <div className="rounded-2xl p-4 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filter.search || ''}
              onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
              placeholder={`${t('Search')}...`}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              id="search-transactions-input"
            />
            {filter.search && (
              <button
                type="button"
                onClick={() => setFilter((prev) => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={filter.sortBy || 'date_desc'}
              onChange={(e) => setFilter((prev) => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              id="sort-by-select"
            >
              <option value="date_desc">{t('Date')}: Newest</option>
              <option value="date_asc">{t('Date')}: Oldest</option>
              <option value="amount_desc">{t('Amount')}: High to Low</option>
              <option value="amount_asc">{t('Amount')}: Low to High</option>
              <option value="category">{t('Category')}: A-Z</option>
            </select>

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                showAdvancedFilters
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              id="toggle-advanced-filters"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{t('Filter')}</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Row */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-150">
            {/* Category selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('Category')}
              </label>
              <select
                value={filter.category || 'all'}
                onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                id="filter-category-select"
              >
                <option value="all">{t('All')}</option>
                <optgroup label={t('Income & Funds')}>
                  <option value="initial_fund">{t('Initial Fund')}</option>
                  <option value="salary">{t('Salary')}</option>
                  <option value="other_income">{t('Other Income')}</option>
                </optgroup>
                <optgroup label={t('Expenses')}>
                  <option value="groceries">{t('Groceries Expense')}</option>
                  <option value="rental">{t('Rental')}</option>
                  <option value="dharma">{t('Dharma')}</option>
                  <option value="travel">{t('Travel Expense')}</option>
                  <option value="education">{t('Education Expense')}</option>
                  <option value="health">{t('Health Expense')}</option>
                  <option value="hobby">{t('Hobby Expense')}</option>
                  <option value="miscellaneous">{t('Miscellaneous Expense')}</option>
                </optgroup>
                <optgroup label={t('SIP & Investments')}>
                  <option value="sip">{t('SIP Investment')}</option>
                  <option value="mutual_funds">{t('Mutual Funds')}</option>
                  <option value="stocks">{t('Stocks / Equity')}</option>
                  <option value="fixed_deposits">{t('Fixed Deposits')}</option>
                  <option value="other_investments">{t('Other Investments')}</option>
                </optgroup>
              </select>
            </div>

            {/* Payment Method filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('Payment Method')}
              </label>
              <select
                value={filter.paymentMethod || 'all'}
                onChange={(e) => setFilter((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                id="filter-payment-method-select"
              >
                <option value="all">{t('All')}</option>
                <option value="UPI">UPI</option>
                <option value="Cash">{t('Cash')}</option>
                <option value="Credit Card">{t('Credit Card')}</option>
                <option value="Debit Card">{t('Debit Card')}</option>
                <option value="Net Banking">{t('Net Banking')}</option>
                <option value="Bank Transfer">{t('Bank Transfer / NEFT / IMPS')}</option>
                <option value="Cheque">{t('Cheque')}</option>
              </select>
            </div>

            {/* Person Involved filter */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('Source or Person')}
              </label>
              <input
                type="text"
                value={filter.personName || ''}
                onChange={(e) => setFilter((prev) => ({ ...prev, personName: e.target.value }))}
                placeholder={`${t('Source or Person')}...`}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                id="filter-person-name-input"
              />
            </div>

            {/* Repayment Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('Status')}
              </label>
              <select
                value={filter.repaymentStatus || 'all'}
                onChange={(e) => setFilter((prev) => ({ ...prev, repaymentStatus: e.target.value as any }))}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value="all">{t('All')}</option>
                <option value="pending">{t('Pending')}</option>
                <option value="partially_repaid">{t('Partially Repaid')}</option>
                <option value="settled">{t('Fully Settled')}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Transactions List Table / Cards */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm overflow-hidden" id="transactions-table-container">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {t('No transactions found')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {t('No data available')}
            </p>
            <button
              type="button"
              onClick={resetFilter}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              {t('Reset Filters')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isExpense = tx.type === 'expense';
              const isInvestment = tx.type === 'investment';
              const isLent = tx.type === 'lent';
              const isBorrowed = tx.type === 'borrowed';

              const repaidAmt = Number(tx.repaidAmount) || 0;
              const remainingAmt = Math.max(0, tx.amount - repaidAmt);
              const progressPct = tx.amount > 0 ? (repaidAmt / tx.amount) * 100 : 0;

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-700/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  id={`tx-row-${tx.id}`}
                >
                  {/* Left: Icon, Category, Description, Source, Audit Trail */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <CategoryIcon category={tx.category} type={tx.type} size={22} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {t(CATEGORY_META[tx.category]?.label || tx.category.replace(/_/g, ' '))}
                        </span>

                        {tx.sourceOrPerson && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {tx.sourceOrPerson}
                          </span>
                        )}

                        {tx.platformOrInstitution && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                            {tx.platformOrInstitution}
                          </span>
                        )}

                        {tx.paymentMethod && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                            {t(tx.paymentMethod)}
                          </span>
                        )}

                        {/* Status badge for Lent / Borrowed */}
                        {isLent && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.repaymentStatus === 'settled'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : tx.repaymentStatus === 'partially_repaid'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                            {t('Lent')} • {tx.repaymentStatus === 'settled' ? t('Fully Settled') : tx.repaymentStatus === 'partially_repaid' ? t('Partially Repaid') : t('Pending Repayment')}
                          </span>
                        )}

                        {isBorrowed && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.repaymentStatus === 'settled'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                            {t('Borrowed')} • {tx.repaymentStatus === 'settled' ? t('Settled') : t('To Repay')}
                          </span>
                        )}
                      </div>

                      {/* Detailed Comment / Description */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {tx.description}
                      </p>

                      {/* Repayment Progress for Lent/Borrowed */}
                      {(isLent || isBorrowed) && (
                        <div className="mt-2 max-w-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                            <span>{t('Repaid')}: {formatCurrency(repaidAmt, curr)}</span>
                            <span>{t('Remaining')}: {formatCurrency(remainingAmt, curr)}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                tx.repaymentStatus === 'settled' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(100, progressPct)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Audit Trail info */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(tx.date)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {t('By', 'By')} <strong className="text-slate-600 dark:text-slate-300">{tx.createdBy?.name || 'User'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:text-right pl-11 sm:pl-0">
                    <div>
                      <span
                        className={`text-base sm:text-lg font-extrabold ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isExpense
                            ? 'text-rose-600 dark:text-rose-400'
                            : isInvestment
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : isLent
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, curr)}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      {(isLent || isBorrowed) && tx.repaymentStatus !== 'settled' && (
                        <button
                          type="button"
                          onClick={() => onOpenRepaymentModal(tx)}
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                          title={t('Log Repayment')}
                          id={`repay-btn-${tx.id}`}
                        >
                          <HandCoins className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectTransactionForEdit(tx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title={t('Edit')}
                        id={`edit-btn-${tx.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(tx)}
                        disabled={deletingId === tx.id}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title={t('Delete')}
                        id={`delete-btn-${tx.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
