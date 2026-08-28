import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  Landmark,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  HandCoins,
  Receipt,
  Wallet,
  Users,
  CheckCircle,
  CreditCard,
  User,
  X,
  Search,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import {
  formatCurrency,
  formatDate,
  CATEGORY_META,
  calculateFinancialSummary,
  extractPaymentMethods,
  extractCounterparties,
  exportTransactionsToCSV,
} from '../utils/formatters';
import {
  executePrintStatement,
  downloadStatementHtmlFile,
  generatePrintableStatementHtml,
} from '../utils/printStatement';
import { Transaction } from '../types';
import { CategoryIcon } from './CategoryIcon';

export const ReportsView: React.FC = () => {
  const { t } = useLanguage();
  const { activeWorkspace, transactions } = useFinance();
  const curr = activeWorkspace?.currency || '₹';

  // Date Filter Modes
  const [dateFilterMode, setDateFilterMode] = useState<
    'current_month' | 'previous_month' | 'current_year' | 'all' | 'custom'
  >('current_month');

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const currentYearStr = String(now.getFullYear());

  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  );
  const [customEndDate, setCustomEndDate] = useState<string>(now.toISOString().split('T')[0]);

  // Advanced Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [selectedPerson, setSelectedPerson] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Print Feedback & Modal States
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Extract distinct payment methods and individuals from transactions
  const availablePaymentMethods = useMemo(() => {
    return extractPaymentMethods(transactions);
  }, [transactions]);

  const availableCounterparties = useMemo(() => {
    return extractCounterparties(transactions);
  }, [transactions]);

  // Lent & Borrowed specific people list
  const lentBorrowedPeople = useMemo(() => {
    return availableCounterparties.filter(
      (c) => c.types.includes('lent') || c.types.includes('borrowed')
    );
  }, [availableCounterparties]);

  // Filter transactions based on active filters
  const filteredReportTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // 1. Date filter
      if (dateFilterMode === 'current_month' && !t.date?.startsWith(currentMonthStr)) return false;
      if (dateFilterMode === 'previous_month' && !t.date?.startsWith(prevMonthStr)) return false;
      if (dateFilterMode === 'current_year' && !t.date?.startsWith(currentYearStr)) return false;
      if (dateFilterMode === 'custom') {
        if (customStartDate && t.date < customStartDate) return false;
        if (customEndDate && t.date > customEndDate) return false;
      }

      // 2. Type filter
      if (selectedType !== 'all' && t.type !== selectedType) return false;

      // 3. Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

      // 4. Payment Method filter (e.g. Cash, Card, UPI, etc.)
      if (selectedPaymentMethod !== 'all') {
        const method = (t.paymentMethod || '').toLowerCase().trim();
        if (method !== selectedPaymentMethod.toLowerCase().trim()) return false;
      }

      // 5. Person Involved filter (for Lent, Borrowed, or any counterparty)
      if (selectedPerson !== 'all') {
        const person = (t.sourceOrPerson || '').toLowerCase().trim();
        if (person !== selectedPerson.toLowerCase().trim()) return false;
      }

      // 6. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesDesc = t.description?.toLowerCase().includes(query);
        const matchesPerson = t.sourceOrPerson?.toLowerCase().includes(query);
        const matchesCat = t.category?.toLowerCase().includes(query);
        const matchesPlatform = t.platformOrInstitution?.toLowerCase().includes(query);
        const matchesMethod = t.paymentMethod?.toLowerCase().includes(query);
        if (!matchesDesc && !matchesPerson && !matchesCat && !matchesPlatform && !matchesMethod) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [
    transactions,
    dateFilterMode,
    currentMonthStr,
    prevMonthStr,
    currentYearStr,
    customStartDate,
    customEndDate,
    selectedType,
    selectedCategory,
    selectedPaymentMethod,
    selectedPerson,
    searchQuery,
  ]);

  // Report Summary
  const reportSummary = useMemo(() => {
    const initFund = Number(activeWorkspace?.initialFund) || 0;
    return calculateFinancialSummary(filteredReportTransactions, initFund);
  }, [filteredReportTransactions, activeWorkspace?.initialFund]);

  // Specific Payment Method breakdown in filtered report
  const paymentMethodBreakdown = useMemo(() => {
    const map: Record<string, { count: number; totalAmount: number }> = {};
    filteredReportTransactions.forEach((t) => {
      const method = t.paymentMethod?.trim() || 'Unspecified';
      if (!map[method]) map[method] = { count: 0, totalAmount: 0 };
      map[method].count += 1;
      map[method].totalAmount += Number(t.amount) || 0;
    });
    return Object.entries(map).map(([method, val]) => ({
      method,
      count: val.count,
      totalAmount: val.totalAmount,
    })).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredReportTransactions]);

  // Reset all filters
  const handleResetFilters = () => {
    setDateFilterMode('current_month');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedPaymentMethod('all');
    setSelectedPerson('all');
    setSearchQuery('');
  };

  const hasActiveCustomFilters =
    dateFilterMode !== 'current_month' ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedPaymentMethod !== 'all' ||
    selectedPerson !== 'all' ||
    searchQuery.trim() !== '';

  const dateScopeLabel = useMemo(() => {
    return dateFilterMode === 'current_month'
      ? `${t('Current Month')} (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`
      : dateFilterMode === 'previous_month'
      ? `${t('Previous Month')} (${prevMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })})`
      : dateFilterMode === 'current_year'
      ? `${t('Current Year')} ${currentYearStr}`
      : dateFilterMode === 'custom'
      ? `${formatDate(customStartDate)} to ${formatDate(customEndDate)}`
      : t('All Time');
  }, [dateFilterMode, now, prevMonthDate, currentYearStr, customStartDate, customEndDate, t]);

  const statementData = useMemo(() => {
    return {
      workspace: activeWorkspace,
      dateScopeLabel,
      filterMethodLabel: selectedPaymentMethod !== 'all' ? selectedPaymentMethod : undefined,
      filterPersonLabel: selectedPerson !== 'all' ? selectedPerson : undefined,
      totalIncome: reportSummary.totalIncome,
      totalExpenses: reportSummary.totalExpenses,
      totalInvestments: reportSummary.totalInvestments,
      totalLent: reportSummary.totalLent,
      totalBorrowed: reportSummary.totalBorrowed,
      repaidLentReceived: reportSummary.repaidLentReceived,
      repaidBorrowedPaid: reportSummary.repaidBorrowedPaid,
      netSavings: reportSummary.netSavings,
      paymentBreakdown: paymentMethodBreakdown,
      transactions: filteredReportTransactions,
      currency: curr,
    };
  }, [
    activeWorkspace,
    dateScopeLabel,
    selectedPaymentMethod,
    selectedPerson,
    reportSummary,
    paymentMethodBreakdown,
    filteredReportTransactions,
    curr,
  ]);

  // Export to CSV / Excel
  const handleExportCSV = () => {
    const filename = `${activeWorkspace?.name.replace(/\s+/g, '_')}_Report_${dateFilterMode}_Method_${selectedPaymentMethod}_Person_${selectedPerson || 'All'}.csv`;
    exportTransactionsToCSV(filteredReportTransactions, filename, curr);
  };

  // Robust Print Statement Handler
  const handlePrintStatement = () => {
    setIsPrinting(true);
    setPrintNotice(t('Loading...'));

    const success = executePrintStatement(
      statementData,
      () => {
        setIsPrinting(false);
        setPrintNotice(t('Saved successfully!'));
        setTimeout(() => setPrintNotice(null), 3500);
      },
      (err) => {
        setIsPrinting(false);
        setPrintNotice(t('Preview'));
        setShowPrintModal(true);
      }
    );

    if (success) {
      setTimeout(() => {
        setIsPrinting(false);
      }, 800);
    }
  };

  // Download standalone HTML statement
  const handleDownloadHTML = () => {
    downloadStatementHtmlFile(statementData);
    setPrintNotice(t('Saved successfully!'));
    setTimeout(() => setPrintNotice(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="reports-view">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {t('Reports')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('Financial Summary')} &amp; {t('Detailed Ledger')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            id="download-csv-btn"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            {t('Export CSV')}
          </button>

          <button
            type="button"
            onClick={handleDownloadHTML}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            id="download-html-btn"
          >
            <FileCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {t('Save')} HTML
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            id="preview-statement-btn"
          >
            <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {t('Preview')}
          </button>
        </div>
      </div>

      {/* Floating status notice */}
      {printNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{printNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setPrintNotice(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Advanced Filter Panel */}
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4 print:hidden" id="report-filter-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {t('Filter')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {t('Records')}:{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {filteredReportTransactions.length}
              </strong>{' '}
              / {transactions.length}
            </span>

            {hasActiveCustomFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                id="reset-report-filters-btn"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('Reset Filters')}
              </button>
            )}
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {t('Date Range')}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDateFilterMode('current_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateFilterMode === 'current_month'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('Current Month')}
            </button>

            <button
              type="button"
              onClick={() => setDateFilterMode('previous_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateFilterMode === 'previous_month'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('Previous Month')}
            </button>

            <button
              type="button"
              onClick={() => setDateFilterMode('current_year')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateFilterMode === 'current_year'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('Current Year')}
            </button>

            <button
              type="button"
              onClick={() => setDateFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateFilterMode === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('All Time')}
            </button>

            <button
              type="button"
              onClick={() => setDateFilterMode('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateFilterMode === 'custom'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('Custom Date Range')}
            </button>
          </div>

          {dateFilterMode === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">{t('Start Date')}:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">{t('End Date')}:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dropdown Filters: Payment Method, Person Involved, Type, Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          {/* Payment Method Filter */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              {t('Payment Method')}
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              id="report-payment-method-filter"
            >
              <option value="all">{t('All Payment Methods')}</option>
              {availablePaymentMethods.map((m) => (
                <option key={m} value={m}>
                  {t(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Individual / Counterparty Involved Filter */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              {t('Person / Contact')}
            </label>
            <select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              id="report-person-filter"
            >
              <option value="all">{t('All Individuals')}</option>
              {lentBorrowedPeople.length > 0 && (
                <optgroup label={t('Lending & Borrowing')}>
                  {lentBorrowedPeople.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.count})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label={t('All Counterparties')}>
                {availableCounterparties.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Transaction Type */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-purple-600" />
              {t('Transaction Type')}
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              id="report-type-filter"
            >
              <option value="all">{t('All Types')}</option>
              <option value="income">{t('Income')}</option>
              <option value="expense">{t('Expense')}</option>
              <option value="investment">{t('Investments')}</option>
              <option value="lent">{t('Money Lent')}</option>
              <option value="borrowed">{t('Money Borrowed')}</option>
            </select>
          </div>

          {/* Search keyword */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              {t('Search')}
            </label>
            <input
              type="text"
              placeholder={t('Search') + '...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              id="report-search-filter"
            />
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveCustomFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-400">{t('Filter')}:</span>
            {selectedPaymentMethod !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                {t('Payment Method')}: {t(selectedPaymentMethod)}
                <button type="button" onClick={() => setSelectedPaymentMethod('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedPerson !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                {t('Person / Contact')}: {selectedPerson}
                <button type="button" onClick={() => setSelectedPerson('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                {t('Type')}: {t(selectedType)}
                <button type="button" onClick={() => setSelectedType('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {t('Search')}: "{searchQuery}"
                <button type="button" onClick={() => setSearchQuery('')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Printable Report Document Container */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-8" id="printable-financial-statement">
        {/* Printable Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {activeWorkspace?.name}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                {t('Reports')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('Workspace')}: {activeWorkspace?.code} • {t('Date')}: {formatDate(new Date().toISOString())}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {t('Date Range')}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              {dateScopeLabel}
            </span>
          </div>
        </div>

        {/* Section 1: Executive Balance Sheet Summary Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-600" />
            1. {t('Financial Summary')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Inflow / Sources */}
            <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                {t('Income')} &amp; {t('Recovered')}
              </span>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">{t('Salary')}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(reportSummary.totalSalary, curr)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">{t('Other Income')}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(reportSummary.totalOtherIncome, curr)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">{t('To Collect (Lent)')} {t('Recovered')}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(reportSummary.repaidLentReceived, curr)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">{t('Money Borrowed')}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  +{formatCurrency(reportSummary.totalBorrowed, curr)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold pt-1 text-emerald-700 dark:text-emerald-300">
                <span>{t('Total Income')}</span>
                <span>
                  {formatCurrency(
                    reportSummary.totalIncome +
                      reportSummary.repaidLentReceived +
                      reportSummary.totalBorrowed,
                    curr
                  )}
                </span>
              </div>
            </div>

            {/* Outflow / Allocations */}
            <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider block">
                {t('Expenses')} &amp; {t('Investments')}
              </span>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">{t('Total Expenses')}</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  -{formatCurrency(reportSummary.totalExpenses, curr)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">{t('Investments')}</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  -{formatCurrency(reportSummary.totalInvestments, curr)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">{t('Money Lent')}</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  -{formatCurrency(reportSummary.totalLent, curr)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">{t('Money Borrowed')} {t('Repaid')}</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  -{formatCurrency(reportSummary.repaidBorrowedPaid, curr)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold pt-1 text-rose-700 dark:text-rose-300">
                <span>{t('Total Expenses')}</span>
                <span>
                  {formatCurrency(
                    reportSummary.totalExpenses +
                      reportSummary.totalInvestments +
                      reportSummary.totalLent +
                      reportSummary.repaidBorrowedPaid,
                    curr
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Payment Method Breakdown */}
        {paymentMethodBreakdown.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              2. {t('Payment Method')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {paymentMethodBreakdown.map((pm) => (
                <div
                  key={pm.method}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700"
                >
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block truncate">
                    {t(pm.method)}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">
                    {formatCurrency(pm.totalAmount, curr)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {pm.count} {t('Transactions')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Detailed Transaction Ledger Report */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center justify-between">
            <span>3. {t('Detailed Ledger')} ({filteredReportTransactions.length} {t('Records')})</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">{t('Date')}</th>
                  <th className="p-3">{t('Type')}</th>
                  <th className="p-3">{t('Category')}</th>
                  <th className="p-3">{t('Description')}</th>
                  <th className="p-3">{t('Payment Method')}</th>
                  <th className="p-3">{t('Person / Contact')}</th>
                  <th className="p-3">{t('Amount')}</th>
                  <th className="p-3">{t('Added By')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredReportTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      {t('No data available')}
                    </td>
                  </tr>
                ) : (
                  filteredReportTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                      <td className="p-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="p-3 uppercase font-bold text-[10px] text-slate-500 whitespace-nowrap">
                        {t(tx.type)}
                      </td>
                      <td className="p-3 font-medium text-slate-900 dark:text-white">
                        {t(tx.category, CATEGORY_META[tx.category]?.label || tx.category)}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs">
                        {t(tx.description, tx.description)}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px]">
                          {t(tx.paymentMethod || '—')}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">
                        {tx.sourceOrPerson || tx.platformOrInstitution || '—'}
                      </td>
                      <td className={`p-3 font-extrabold whitespace-nowrap ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : tx.type === 'expense'
                          ? 'text-rose-600 dark:text-rose-400'
                          : tx.type === 'investment'
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : tx.type === 'lent'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, curr)}
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {tx.createdBy?.name || t('User')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer note */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-center text-[11px] text-slate-400">
          FinTrack Pro • {t('Financial Summary')}
        </div>
      </div>

      {/* Statement Preview & Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs no-print animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('Preview')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {statementData.dateScopeLabel} • {filteredReportTransactions.length} {t('Records')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadHTML}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t('Save')} HTML
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handlePrintStatement();
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {t('Print Statement')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Preview Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/80">
              <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
                {/* Paper header */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-emerald-600">FinTrack Pro</h2>
                    <h3 className="text-base font-bold text-slate-900">{activeWorkspace?.name}</h3>
                    <p className="text-xs text-slate-500">
                      {t('Workspace')}: {activeWorkspace?.code} • {t('Financial Statement')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('Date Range')}</span>
                    <span className="text-xs font-extrabold text-slate-900">{statementData.dateScopeLabel}</span>
                  </div>
                </div>

                {/* Summary boxes */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="font-bold text-emerald-600 text-[11px] uppercase">{t('Total Income')}</div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('Income')}</span>
                      <span className="font-bold text-emerald-600">+{formatCurrency(reportSummary.totalIncome, curr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('To Collect (Lent)')} {t('Recovered')}</span>
                      <span className="font-bold text-emerald-600">+{formatCurrency(reportSummary.repaidLentReceived, curr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('Money Borrowed')}</span>
                      <span className="font-bold">+{formatCurrency(reportSummary.totalBorrowed, curr)}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="font-bold text-rose-600 text-[11px] uppercase">{t('Total Expenses')}</div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('Expenses')}</span>
                      <span className="font-bold text-rose-600">-{formatCurrency(reportSummary.totalExpenses, curr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('Investments')}</span>
                      <span className="font-bold text-indigo-600">-{formatCurrency(reportSummary.totalInvestments, curr)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('Money Lent')}</span>
                      <span className="font-bold text-amber-600">-{formatCurrency(reportSummary.totalLent, curr)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between font-bold text-xs">
                  <span>{t('Net Balance')}</span>
                  <span className={reportSummary.netSavings >= 0 ? 'text-emerald-400 font-extrabold' : 'text-rose-400 font-extrabold'}>
                    {reportSummary.netSavings >= 0 ? '+' : ''}{formatCurrency(reportSummary.netSavings, curr)}
                  </span>
                </div>

                {/* Ledger table preview */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-2.5">{t('Date')}</th>
                        <th className="p-2.5">{t('Type')}</th>
                        <th className="p-2.5">{t('Category')}</th>
                        <th className="p-2.5">{t('Description')}</th>
                        <th className="p-2.5">{t('Payment Method')}</th>
                        <th className="p-2.5 text-right">{t('Amount')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredReportTransactions.slice(0, 15).map((tx) => (
                        <tr key={tx.id}>
                          <td className="p-2 text-slate-500 whitespace-nowrap">{formatDate(tx.date)}</td>
                          <td className="p-2 uppercase font-bold text-[9px]">{t(tx.type)}</td>
                          <td className="p-2 font-medium">{t(tx.category, CATEGORY_META[tx.category]?.label || tx.category)}</td>
                          <td className="p-2 text-slate-700 truncate max-w-[150px]">{t(tx.description, tx.description)}</td>
                          <td className="p-2 text-slate-500">{t(tx.paymentMethod || '—')}</td>
                          <td className={`p-2 text-right font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, curr)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredReportTransactions.length > 15 && (
                    <div className="p-2 bg-slate-50 text-center text-slate-500 text-[11px]">
                      + {filteredReportTransactions.length - 15} {t('Records')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
