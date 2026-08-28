import React, { useState, useMemo } from 'react';
import {
  PieChart as PieChartIcon,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Settings,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ArrowDownRight,
  ShieldCheck,
  Percent,
  Sparkles,
  Edit2,
  Trash2,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, ALL_EXPENSE_CATEGORIES, CATEGORY_META } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

export const BudgetsView: React.FC = () => {
  const { t } = useLanguage();
  const {
    activeWorkspace,
    activeMonth,
    setActiveMonth,
    activeBudget,
    budgetSummary,
    saveMonthlyBudget,
    deleteBudget,
  } = useFinance();

  const curr = activeWorkspace?.currency || '₹';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategoryBudgets, setEditingCategoryBudgets] = useState<Record<string, number>>({});
  const [editingTotalLimit, setEditingTotalLimit] = useState<string>('');
  const [editingThreshold, setEditingThreshold] = useState<number>(80);
  const [editingAlertsEnabled, setEditingAlertsEnabled] = useState<boolean>(true);
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  const [customCategoryLimit, setCustomCategoryLimit] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [yearStr, monthStr] = activeMonth.split('-');
    let y = parseInt(yearStr, 10);
    let m = parseInt(monthStr, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setActiveMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [yearStr, monthStr] = activeMonth.split('-');
    let y = parseInt(yearStr, 10);
    let m = parseInt(monthStr, 10) + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setActiveMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleSetCurrentMonth = () => {
    const d = new Date();
    setActiveMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const activeMonthDate = useMemo(() => {
    const [y, m] = activeMonth.split('-');
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
  }, [activeMonth]);

  const activeMonthLabel = useMemo(() => {
    return activeMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [activeMonthDate]);

  // Open Edit Modal with existing values or defaults
  const handleOpenEditModal = () => {
    const existing = activeBudget?.categoryBudgets || {};
    const initialValues: Record<string, number> = {};
    ALL_EXPENSE_CATEGORIES.forEach((c) => {
      initialValues[c.key] = existing[c.key] !== undefined ? existing[c.key] : 0;
    });
    // Add any custom categories from activeBudget
    Object.entries(existing).forEach(([k, v]) => {
      initialValues[k] = typeof v === 'number' ? v : Number(v) || 0;
    });

    setEditingCategoryBudgets(initialValues);
    setEditingTotalLimit(activeBudget?.totalLimit ? String(activeBudget.totalLimit) : '');
    setEditingThreshold(activeBudget?.thresholdPercentage !== undefined ? activeBudget.thresholdPercentage : 80);
    setEditingAlertsEnabled(activeBudget?.alertsEnabled !== undefined ? activeBudget.alertsEnabled : true);
    setIsEditModalOpen(true);
  };

  // Add custom category in edit modal
  const handleAddCustomCategory = () => {
    if (!customCategoryInput.trim()) return;
    const cleanKey = customCategoryInput.toLowerCase().trim().replace(/\s+/g, '_');
    const amount = Number(customCategoryLimit) || 0;
    setEditingCategoryBudgets((prev) => ({
      ...prev,
      [cleanKey]: amount,
    }));
    setCustomCategoryInput('');
    setCustomCategoryLimit('');
  };

  // Save budget to backend
  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const parsedTotal = editingTotalLimit ? Number(editingTotalLimit) : undefined;

    const res = await saveMonthlyBudget(
      activeMonth,
      editingCategoryBudgets,
      parsedTotal,
      editingThreshold,
      editingAlertsEnabled
    );

    setIsSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditModalOpen(false);
      }, 700);
    }
  };

  // Reset/Delete budget
  const handleDeleteCurrentBudget = async () => {
    if (activeBudget && confirm(`${t('Delete')} ${activeMonthLabel}?`)) {
      await deleteBudget(activeBudget.id);
    }
  };

  // Quick preset calculation
  const handleApplyPreset = () => {
    setEditingCategoryBudgets({
      groceries: 12000,
      travel: 5000,
      education: 4000,
      health: 3000,
      hobby: 2500,
      miscellaneous: 3500,
    });
    setEditingTotalLimit('30000');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="budgets-view">
      {/* Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PieChartIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {t('Monthly Budget')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('Budgets')} &amp; {t('Category')} {t('Limits')}
          </p>
        </div>

        {/* Month Picker Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Previous Month"
              id="budget-prev-month-btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs font-bold text-slate-900 dark:text-white min-w-[130px] text-center" id="active-budget-month-label">
              {activeMonthLabel}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Next Month"
              id="budget-next-month-btn"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSetCurrentMonth}
            className="px-2.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            id="budget-current-month-btn"
          >
            {t('Today', 'Today')}
          </button>

          <button
            type="button"
            onClick={handleOpenEditModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-colors"
            id="open-budget-settings-btn"
          >
            <Sliders className="w-4 h-4" />
            {activeBudget ? t('Edit') : t('Monthly Budget')}
          </button>
        </div>
      </div>

      {/* Critical Alert Banners if Approaching or Exceeded */}
      {budgetSummary.exceededCategories.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs font-medium flex items-start gap-3 shadow-sm" id="budget-exceeded-alert">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-rose-900 dark:text-rose-100">
              {t('Budget Exceeded')} ({budgetSummary.exceededCategories.length})
            </h4>
            <p className="mt-0.5 text-rose-700 dark:text-rose-300">
              {t('Exceeded')}:{' '}
              <strong>{budgetSummary.exceededCategories.map((c) => `${t(c.label)} (${c.percentage.toFixed(0)}%)`).join(', ')}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="text-xs font-semibold text-rose-700 dark:text-rose-300 underline hover:text-rose-900"
          >
            {t('Edit')}
          </button>
        </div>
      )}

      {budgetSummary.warningCategories.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-start gap-3 shadow-sm" id="budget-warning-alert">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-amber-900 dark:text-amber-100">
              {t('Warning')} ({budgetSummary.warningCategories.length})
            </h4>
            <p className="mt-0.5 text-amber-700 dark:text-amber-300">
              {t('Warning')}:{' '}
              <strong>{budgetSummary.warningCategories.map((c) => `${t(c.label)} (${c.percentage.toFixed(0)}%)`).join(', ')}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Overall Budget Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('Budget Target')}</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(budgetSummary.totalBudget, curr)}
          </div>
          <div className="text-[11px] text-slate-500">
            {activeBudget ? t('Monthly Budget') : t('No data available')}
          </div>
        </div>

        {/* Card 2: Total Spent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('Total Spent')}</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(budgetSummary.totalSpent, curr)}
          </div>
          <div className="text-[11px] text-slate-500">
            {budgetSummary.categories.reduce((s, c) => s + c.transactionCount, 0)} {t('Transactions')}
          </div>
        </div>

        {/* Card 3: Remaining Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('Remaining')}</span>
            <ShieldCheck className="w-4 h-4 text-teal-500" />
          </div>
          <div className={`text-2xl font-extrabold ${budgetSummary.remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {formatCurrency(budgetSummary.remainingBudget, curr)}
          </div>
          <div className="text-[11px] text-slate-500">
            {budgetSummary.remainingBudget < 0 ? t('Exceeded') : t('Safe')}
          </div>
        </div>

        {/* Card 4: Utilization Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('Utilization')}</span>
            <Percent className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${
              budgetSummary.overallPercentage >= 100
                ? 'text-rose-600 dark:text-rose-400'
                : budgetSummary.overallPercentage >= 80
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {budgetSummary.overallPercentage.toFixed(1)}%
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              budgetSummary.status === 'exceeded'
                ? 'bg-rose-500/10 text-rose-600'
                : budgetSummary.status === 'warning'
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-emerald-500/10 text-emerald-600'
            }`}>
              {t(budgetSummary.status.toUpperCase())}
            </span>
          </div>
          {/* Visual Mini Progress */}
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetSummary.overallPercentage >= 100
                  ? 'bg-rose-500'
                  : budgetSummary.overallPercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetSummary.overallPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Category Progress Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-6" id="category-budget-progress-list">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('Category')} {t('Budgets')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('Expenses')} vs {t('Limits')}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">&lt; 80% ({t('Safe')})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 dark:text-slate-400">80–99% ({t('Warning')})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-400">&ge; 100% ({t('Exceeded')})</span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-4">
          {budgetSummary.categories.map((cat) => {
            const hasBudget = cat.budgetAmount > 0;
            const isExceeded = cat.status === 'exceeded';
            const isWarning = cat.status === 'warning';

            return (
              <div
                key={cat.category}
                className={`p-4 rounded-2xl border transition-all ${
                  isExceeded
                    ? 'bg-rose-500/5 border-rose-500/30'
                    : isWarning
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-700/70'
                }`}
                id={`budget-category-card-${cat.category}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon category={cat.category} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {t(cat.label)}
                        </span>
                        {isExceeded && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {t('Exceeded')}
                          </span>
                        )}
                        {isWarning && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {t('Warning')}
                          </span>
                        )}
                        {!hasBudget && cat.spentAmount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {t('Unbudgeted', 'Unbudgeted')}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {cat.transactionCount} {t('Transactions')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline sm:items-end flex-col text-right">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(cat.spentAmount, curr)}
                      </span>
                      {hasBudget && (
                        <span className="text-xs text-slate-400">
                          / {formatCurrency(cat.budgetAmount, curr)}
                        </span>
                      )}
                    </div>
                    {hasBudget && (
                      <span className={`text-[11px] font-semibold ${
                        cat.remainingAmount < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {cat.remainingAmount < 0
                          ? `${formatCurrency(Math.abs(cat.remainingAmount), curr)} ${t('Exceeded')}`
                          : `${formatCurrency(cat.remainingAmount, curr)} ${t('Remaining')}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {hasBudget ? (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, cat.percentage)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-0.5">
                      <span>0%</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {cat.percentage.toFixed(1)}% {t('Spent')}
                      </span>
                      <span>100%</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>{t('No data available')}</span>
                    <button
                      type="button"
                      onClick={handleOpenEditModal}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs underline"
                    >
                      {t('Set Limit', 'Set Limit')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit / Set Budget Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150" id="budget-settings-modal">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-600" />
                  {t('Monthly Budget')}: {activeMonthLabel}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Category')} {t('Limits')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions & Preset */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                {t('Sample Preset', 'Sample Preset')}
              </span>
              <button
                type="button"
                onClick={handleApplyPreset}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
              >
                {t('Apply Sample Preset', 'Apply Sample Preset')}
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              {/* Category Inputs */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {t('Category')} {t('Limits')} ({curr})
                </label>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {Object.entries(editingCategoryBudgets).map(([catKey, amount]) => {
                    const meta = CATEGORY_META[catKey] || {
                      label: catKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                    };

                    return (
                      <div key={catKey} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 flex-1">
                          <CategoryIcon category={catKey} className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {t(meta.label)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">{curr}</span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={amount || ''}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setEditingCategoryBudgets((prev) => ({
                                ...prev,
                                [catKey]: val,
                              }));
                            }}
                            placeholder="0"
                            className="w-28 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Category Option */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
                  {t('Custom Category', 'Custom Category')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Entertainment"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder={`${t('Amount')} (${curr})`}
                    value={customCategoryLimit}
                    onChange={(e) => setCustomCategoryLimit(e.target.value)}
                    className="w-24 px-2.5 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-right"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomCategory}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white transition-colors"
                  >
                    {t('Add', 'Add')}
                  </button>
                </div>
              </div>

              {/* Threshold & Notification Settings */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      {t('Warning Threshold', 'Warning Threshold')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {t('Warning')} %
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="50"
                      max="95"
                      value={editingThreshold}
                      onChange={(e) => setEditingThreshold(Number(e.target.value) || 80)}
                      className="w-16 px-2 py-1 text-xs font-bold rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-right"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t('Alerts', 'Alerts')}
                  </span>
                  <input
                    type="checkbox"
                    checked={editingAlertsEnabled}
                    onChange={(e) => setEditingAlertsEnabled(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                {activeBudget ? (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentBudget}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {t('Delete')}
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                  >
                    {isSaving ? `${t('Saving')}...` : saveSuccess ? `${t('Save')}!` : t('Save')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
