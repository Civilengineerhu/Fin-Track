import React from 'react';
import {
  Wallet,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  Briefcase,
  PieChart as PieChartIcon,
  HandCoins,
  Receipt,
  Plus,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Users,
  Repeat,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Play,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDate, CATEGORY_META } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { Transaction } from '../types';
import { NavTabType } from './Navbar';

interface DashboardViewProps {
  onOpenAddModal: (defaultType?: string) => void;
  onSelectTransactionForEdit: (tx: Transaction) => void;
  onOpenRepaymentModal: (tx: Transaction) => void;
  onNavigateToTab: (tab: NavTabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddModal,
  onSelectTransactionForEdit,
  onOpenRepaymentModal,
  onNavigateToTab,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const {
    activeWorkspace,
    financialSummary,
    transactions,
    budgetSummary,
    recurringRules,
    triggerRecurringRule,
  } = useFinance();

  const curr = activeWorkspace?.currency || '₹';
  const recentTransactions = transactions.slice(0, 6);
  const activeRecurring = recurringRules.filter((r) => r.isActive).slice(0, 3);

  // Prepare chart data for Income vs Expenses vs Investments
  const monthlyChartData = financialSummary.monthlySummary.map((m) => ({
    name: m.month,
    Income: m.income,
    Expenses: m.expenses,
    Investments: m.investments,
    NetCashFlow: m.income - m.expenses - m.investments,
  }));

  const categoryChartData = financialSummary.categoryBreakdown.map((c) => ({
    name: t(c.label),
    value: c.amount,
    color: c.color,
    percentage: c.percentage.toFixed(1),
  }));

  const investmentChartData = financialSummary.investmentBreakdown.map((i) => ({
    name: t(i.label),
    value: i.amount,
    color: i.color,
    percentage: i.percentage.toFixed(1),
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="dashboard-container">
      {/* Workspace Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-slate-900/10 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-slate-900/40 border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              {activeWorkspace?.members.length === 1 ? t('Personal Workspace') : t('Shared Workspace')}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t('Invite Code')}: <strong className="font-mono text-slate-700 dark:text-slate-300">{activeWorkspace?.code}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {activeWorkspace?.name || t('Dashboard')}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl mt-0.5">
            {activeWorkspace?.description || t('100% Offline Local Storage')}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAddModal('expense')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
            id="quick-add-expense-btn"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            {t('Add Expense')}
          </button>
          <button
            type="button"
            onClick={() => onOpenAddModal('income')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
            id="quick-add-income-btn"
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            {t('Add Income')}
          </button>
          <button
            type="button"
            onClick={() => onOpenAddModal('investment')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            id="quick-add-investment-btn"
          >
            <Repeat className="w-3.5 h-3.5" />
            {t('SIP / Investment')}
          </button>
          <button
            type="button"
            onClick={() => onOpenAddModal('lent')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors"
            id="quick-add-lent-btn"
          >
            <HandCoins className="w-3.5 h-3.5" />
            {t('Lend Money')}
          </button>
          <button
            type="button"
            onClick={() => onOpenAddModal('borrowed')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-colors"
            id="quick-add-borrowed-btn"
          >
            <Receipt className="w-3.5 h-3.5" />
            {t('Borrow Money')}
          </button>
        </div>
      </div>

      {/* Primary KPI Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-grid">
        {/* 1. Total Available Balance */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/20" id="card-available-balance">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              {t('Total Available Balance')}
            </span>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {formatCurrency(financialSummary.availableBalance, curr)}
            </h2>
            <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-100 border-t border-white/20 pt-2">
              <span>{t('Opening Fund')}: {formatCurrency(financialSummary.initialFund, curr)}</span>
              <span>{t('Net Inflow')}: {formatCurrency(financialSummary.totalIncome - financialSummary.totalExpenses, curr)}</span>
            </div>
          </div>
        </div>

        {/* 2. Total Income (Salary + Other) */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm" id="card-total-income">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('Total Income Received')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(financialSummary.totalIncome, curr)}
            </h2>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-2">
              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <Briefcase className="w-3 h-3" /> {t('Salary')}: {formatCurrency(financialSummary.totalSalary, curr)}
              </span>
              <span className="flex items-center gap-1">
                {t('Other Income')}: {formatCurrency(financialSummary.totalOtherIncome, curr)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Total Expenses */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm" id="card-total-expenses">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('Total Expenses')}
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(financialSummary.totalExpenses, curr)}
            </h2>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-2">
              <span>{financialSummary.categoryBreakdown.length} {t('Categories')}</span>
              <span className="text-xs font-medium text-rose-500">
                {financialSummary.totalIncome > 0
                  ? `${((financialSummary.totalExpenses / financialSummary.totalIncome) * 100).toFixed(0)}%`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Total Investments (SIP & Portfolio) */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm" id="card-total-investments">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('Total Investments')}
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(financialSummary.totalInvestments, curr)}
            </h2>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-2">
              <span>{t('SIP & Investments')}</span>
              <button
                type="button"
                onClick={() => onNavigateToTab('investments')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
              >
                {t('Portfolio')} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Initial Fund, Money Lent, Money Borrowed, Net Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="secondary-kpis-grid">
        {/* Initial Fund Card */}
        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Landmark className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('Initial Opening Fund')}</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(financialSummary.initialFund, curr)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
            {activeWorkspace?.initialFundSource ? `${t('Source')}: ${activeWorkspace.initialFundSource}` : t('Opening Fund')}
          </p>
        </div>

        {/* Money Lent Card */}
        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <HandCoins className="w-3.5 h-3.5" /> {t('Money Lent')}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">
              {t('To Collect')}
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(financialSummary.outstandingLent, curr)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {t('Lent')}: {formatCurrency(financialSummary.totalLent, curr)} • {t('Repaid')}: {formatCurrency(financialSummary.repaidLentReceived, curr)}
          </p>
        </div>

        {/* Money Borrowed Card */}
        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <Receipt className="w-3.5 h-3.5" /> {t('Money Borrowed')}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600">
              {t('To Repay')}
            </span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(financialSummary.outstandingBorrowed, curr)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {t('Borrowed')}: {formatCurrency(financialSummary.totalBorrowed, curr)} • {t('Repaid')}: {formatCurrency(financialSummary.repaidBorrowedPaid, curr)}
          </p>
        </div>

        {/* Net Balance / Net Worth */}
        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('Net Financial Balance')}</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(financialSummary.netBalance, curr)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {t('Total Available Balance')} + {t('Total Investments')}
          </p>
        </div>
      </div>

      {/* Visual Summaries: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="visual-charts-section">
        {/* Left: Monthly Cash Flow (Income vs Expenses vs Investments) */}
        <div className="lg:col-span-2 rounded-2xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm" id="cashflow-chart-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('Income vs Expenses vs Investments')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('Monthly Cashflow Trend')}
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${curr}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val), curr)}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Income" name={t('Income')} fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="Expenses" name={t('Expenses')} fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="Investments" name={t('Investments')} fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                {t('No data available')}
              </div>
            )}
          </div>
        </div>

        {/* Right: Expense Category Breakdown */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between" id="expense-breakdown-card">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('Expense Category Breakdown')}
              </h3>
              <PieChartIcon className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {t('Category Distribution')}
            </p>

            <div className="h-52 w-full">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val), curr)}
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  {t('No data available')}
                </div>
              )}
            </div>
          </div>

          {/* Category Pill List */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pt-2 border-t border-slate-100 dark:border-slate-700/60">
            {financialSummary.categoryBreakdown.slice(0, 4).map((c) => (
              <div key={c.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-700 dark:text-slate-300 truncate">{t(c.label)}</span>
                </div>
                <div className="flex items-center gap-2 font-medium flex-shrink-0">
                  <span className="text-slate-900 dark:text-white">{formatCurrency(c.amount, curr)}</span>
                  <span className="text-slate-400 text-[10px]">({c.percentage.toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Widgets Row: Monthly Budget Tracker & Scheduled Recurring Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="budget-recurring-widgets-row">
        {/* Budget Status Widget */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between" id="dashboard-budget-widget">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('Monthly Budget Progress')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {budgetSummary.status === 'exceeded'
                      ? `⚠️ ${t('Over Budget')}`
                      : budgetSummary.status === 'warning'
                      ? `⚡ ${t('Approaching monthly budget threshold', 'Approaching budget limit')}`
                      : `✅ ${t('Safe Limit')}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab('budgets')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                {t('Manage')} <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Overall Monthly Bar */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">{t('Total Spent / Budget')}</span>
                <span className={budgetSummary.status === 'exceeded' ? 'text-rose-600' : 'text-emerald-600'}>
                  {formatCurrency(budgetSummary.totalSpent, curr)} / {formatCurrency(budgetSummary.totalBudget, curr)}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetSummary.status === 'exceeded'
                      ? 'bg-rose-500'
                      : budgetSummary.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, budgetSummary.overallPercentage)}%` }}
                />
              </div>
            </div>

            {/* Warning / Exceeded Category Badges if any */}
            {budgetSummary.exceededCategories.length > 0 || budgetSummary.warningCategories.length > 0 ? (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {t('Status')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {budgetSummary.exceededCategories.map((c) => (
                    <span
                      key={c.category}
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" /> {t(c.label)}: {c.percentage.toFixed(0)}%
                    </span>
                  ))}
                  {budgetSummary.warningCategories.map((c) => (
                    <span
                      key={c.category}
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3" /> {t(c.label)}: {c.percentage.toFixed(0)}%
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 pt-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> {t('Safe Limit')}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-3 text-right">
            <button
              type="button"
              onClick={() => onNavigateToTab('budgets')}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              {t('Budgets')} →
            </button>
          </div>
        </div>

        {/* Scheduled Recurring Transactions Widget */}
        <div className="rounded-2xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between" id="dashboard-recurring-widget">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('Scheduled & Recurring Rules')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {recurringRules.filter((r) => r.isActive).length} {t('Active Budgets', 'Active')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab('recurring')}
                className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                {t('Manage')} <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {activeRecurring.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                {t('No data available')}
                <button
                  type="button"
                  onClick={() => onNavigateToTab('recurring')}
                  className="block mx-auto mt-2 text-emerald-600 font-semibold underline"
                >
                  {t('Add Recurring Schedule')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {activeRecurring.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <div className="truncate pr-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                        {rule.description}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {t('Next Due')}: {formatDate(rule.nextDueDate)} • {t(rule.frequency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-extrabold ${rule.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {rule.type === 'income' ? '+' : '-'}{formatCurrency(rule.amount, curr)}
                      </span>
                      <button
                        type="button"
                        onClick={() => triggerRecurringRule(rule.id)}
                        className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100"
                        title={t('Run Now')}
                      >
                        <Play className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 mt-3 text-right">
            <button
              type="button"
              onClick={() => onNavigateToTab('recurring')}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
            >
              {t('View All')} →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Audit Log Section */}
      <div className="rounded-2xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm" id="recent-transactions-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {t('Recent Transactions')}
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {transactions.length} {t('All')}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('100% Offline Local Storage')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('transactions')}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            {t('View All')} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t('No transactions found')}</p>
            <button
              type="button"
              onClick={() => onOpenAddModal('expense')}
              className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
            >
              {t('Add Entry')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isExpense = tx.type === 'expense';
              const isInvestment = tx.type === 'investment';
              const isLent = tx.type === 'lent';
              const isBorrowed = tx.type === 'borrowed';

              return (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-700/20 px-2 rounded-xl transition-colors cursor-pointer"
                  onClick={() => onSelectTransactionForEdit(tx)}
                  id={`recent-tx-${tx.id}`}
                >
                  <div className="flex items-start gap-3">
                    <CategoryIcon category={tx.category} type={tx.type} />
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {t(CATEGORY_META[tx.category]?.label || tx.category.replace(/_/g, ' '))}
                        </span>
                        {tx.sourceOrPerson && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {tx.sourceOrPerson}
                          </span>
                        )}
                        {tx.paymentMethod && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {t(tx.paymentMethod)}
                          </span>
                        )}
                        {isLent && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.repaymentStatus === 'settled'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : tx.repaymentStatus === 'partially_repaid'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {t('Lent')} • {tx.repaymentStatus === 'settled' ? t('Fully Settled') : tx.repaymentStatus === 'partially_repaid' ? t('Partially Repaid') : t('Pending Repayment')}
                          </span>
                        )}
                        {isBorrowed && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.repaymentStatus === 'settled'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {t('Borrowed')} • {tx.repaymentStatus === 'settled' ? t('Settled') : t('To Repay')}
                          </span>
                        )}
                      </div>

                      {/* Detailed Description / Comment */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                        {tx.description}
                      </p>

                      {/* Audit Trail Badge */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {t('By', 'By')} <strong className="text-slate-600 dark:text-slate-300">{tx.createdBy?.name || 'User'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount and quick repayment CTA if applicable */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:text-right pl-11 sm:pl-0">
                    <div>
                      <span
                        className={`text-sm sm:text-base font-bold ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isExpense
                            ? 'text-rose-600 dark:text-rose-400'
                            : isInvestment
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : isLent
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, curr)}
                      </span>
                      {(isLent || isBorrowed) && Number(tx.repaidAmount) > 0 && (
                        <p className="text-[10px] text-slate-400">
                          {t('Repaid')}: {formatCurrency(Number(tx.repaidAmount), curr)}
                        </p>
                      )}
                    </div>

                    {(isLent || isBorrowed) && tx.repaymentStatus !== 'settled' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenRepaymentModal(tx);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                      >
                        {t('Log Repayment')}
                      </button>
                    )}
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
