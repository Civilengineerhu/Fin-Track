import React from 'react';
import {
  TrendingUp,
  Plus,
  Repeat,
  PieChart as PieChartIcon,
  CandlestickChart,
  ShieldCheck,
  Gem,
  Calendar,
  Building2,
  Users,
  Edit2,
  Trash2,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDate, CATEGORY_META } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { Transaction } from '../types';

interface InvestmentsViewProps {
  onOpenAddModal: (defaultType?: string) => void;
  onSelectTransactionForEdit: (tx: Transaction) => void;
}

export const InvestmentsView: React.FC<InvestmentsViewProps> = ({
  onOpenAddModal,
  onSelectTransactionForEdit,
}) => {
  const { t } = useLanguage();
  const { activeWorkspace, transactions, financialSummary, deleteTransaction } = useFinance();
  const curr = activeWorkspace?.currency || '₹';

  const investmentTxs = transactions.filter((t) => t.type === 'investment');

  const investmentBreakdown = financialSummary.investmentBreakdown;

  // SIP summary calculation
  const sipTxs = investmentTxs.filter((t) => t.category === 'sip' || t.investmentType === 'sip');
  const totalSip = sipTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const mfTxs = investmentTxs.filter((t) => t.category === 'mutual_funds' || t.investmentType === 'mutual_funds');
  const totalMf = mfTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const stocksTxs = investmentTxs.filter((t) => t.category === 'stocks' || t.investmentType === 'stocks');
  const totalStocks = stocksTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const fdTxs = investmentTxs.filter((t) => t.category === 'fixed_deposits' || t.investmentType === 'fixed_deposits');
  const totalFd = fdTxs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const handleDelete = async (tx: Transaction) => {
    if (window.confirm(`${t('Delete')} "${tx.description}"?`)) {
      await deleteTransaction(tx.id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="investments-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            {t('Investments')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('SIP')} &amp; {t('Mutual Funds')} &amp; {t('Stocks')} &amp; {t('Fixed Deposits')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenAddModal('investment')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-colors"
          id="add-investment-cta"
        >
          <Plus className="w-4 h-4" />
          {t('Add Investment')}
        </button>
      </div>

      {/* Top Portfolio KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Portfolio */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-md shadow-indigo-600/20 col-span-1 sm:col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-100">
            {t('Total Investments')}
          </span>
          <p className="text-2xl font-extrabold mt-1">
            {formatCurrency(financialSummary.totalInvestments, curr)}
          </p>
          <p className="text-[10px] text-indigo-100 mt-2">
            {investmentTxs.length} {t('Transactions')}
          </p>
        </div>

        {/* SIP */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-indigo-600">
              <Repeat className="w-3.5 h-3.5" /> {t('SIP')}
            </span>
            <span className="text-[10px] text-slate-400">{sipTxs.length} {t('Transactions')}</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalSip, curr)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">{t('Recurring')}</p>
        </div>

        {/* Mutual Funds */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-blue-600">
              <PieChartIcon className="w-3.5 h-3.5" /> {t('Mutual Funds')}
            </span>
            <span className="text-[10px] text-slate-400">{mfTxs.length} {t('Transactions')}</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalMf, curr)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">{t('Investments')}</p>
        </div>

        {/* Stocks */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-sky-600">
              <CandlestickChart className="w-3.5 h-3.5" /> {t('Stocks')}
            </span>
            <span className="text-[10px] text-slate-400">{stocksTxs.length} {t('Transactions')}</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalStocks, curr)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">{t('Investments')}</p>
        </div>

        {/* Fixed Deposits & Others */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span className="flex items-center gap-1 text-teal-600">
              <ShieldCheck className="w-3.5 h-3.5" /> {t('Fixed Deposits')}
            </span>
            <span className="text-[10px] text-slate-400">{fdTxs.length} {t('Transactions')}</span>
          </div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalFd, curr)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">{t('Investments')}</p>
        </div>
      </div>

      {/* Visual Chart & Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {t('Investments')} {t('Breakdown')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {t('Category')} {t('Breakdown')}
            </p>

            <div className="h-56 w-full">
              {investmentBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={investmentBreakdown}
                      dataKey="amount"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {investmentBreakdown.map((entry, index) => (
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

          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-700">
            {investmentBreakdown.map((item) => (
              <div key={item.type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{t(item.label)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.amount, curr)}
                  </span>
                  <span className="text-slate-400 text-[10px]">({item.percentage.toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Transactions List */}
        <div className="lg:col-span-2 rounded-2xl p-5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('Investments')} {t('History')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('All Transactions')}
              </p>
            </div>
          </div>

          {investmentTxs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              {t('No data available')}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 flex-1 overflow-y-auto max-h-[420px]">
              {investmentTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-xl transition-colors flex items-center justify-between gap-3"
                  id={`investment-item-${tx.id}`}
                >
                  <div className="flex items-start gap-3">
                    <CategoryIcon category={tx.category || 'sip'} type="investment" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {t(CATEGORY_META[tx.category]?.label || tx.category.replace(/_/g, ' '))}
                        </span>
                        {tx.platformOrInstitution && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                            <Building2 className="w-2.5 h-2.5" />
                            {tx.platformOrInstitution}
                          </span>
                        )}
                        {tx.paymentMethod && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                            {t(tx.paymentMethod)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span>{tx.createdBy?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm sm:text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(tx.amount, curr)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectTransactionForEdit(tx)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      title={t('Edit')}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tx)}
                      className="p-1.5 text-rose-400 hover:text-rose-600"
                      title={t('Delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
