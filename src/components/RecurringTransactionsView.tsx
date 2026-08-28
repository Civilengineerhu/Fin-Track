import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Play,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  Power,
  RefreshCw,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDate, CATEGORY_META, STANDARD_PAYMENT_METHODS } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { RecurringRule, RecurringFrequency } from '../types';

export const RecurringTransactionsView: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const {
    activeWorkspace,
    recurringRules,
    addRecurringRule,
    updateRecurringRule,
    deleteRecurringRule,
    triggerRecurringRule,
    processDueRecurringRules,
  } = useFinance();

  const curr = activeWorkspace?.currency || '₹';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('groceries');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [sourceOrPerson, setSourceOrPerson] = useState('');
  const [platformOrInstitution, setPlatformOrInstitution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Triggering State feedback
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [processingAll, setProcessingAll] = useState(false);
  const [processSuccessMsg, setProcessSuccessMsg] = useState<string | null>(null);

  // Open Add Modal
  const handleOpenAddModal = (defaultType: 'income' | 'expense' = 'expense') => {
    setEditingRule(null);
    setDescription('');
    setAmount('');
    setType(defaultType);
    setCategory(defaultType === 'income' ? 'salary' : 'groceries');
    setFrequency('monthly');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setPaymentMethod('UPI');
    setSourceOrPerson('');
    setPlatformOrInstitution('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (rule: RecurringRule) => {
    setEditingRule(rule);
    setDescription(rule.description || '');
    setAmount(String(rule.amount || ''));
    setType(rule.type);
    setCategory(rule.category);
    setFrequency(rule.frequency);
    setStartDate(rule.startDate);
    setEndDate(rule.endDate || '');
    setPaymentMethod(rule.paymentMethod || 'UPI');
    setSourceOrPerson(rule.sourceOrPerson || '');
    setPlatformOrInstitution(rule.platformOrInstitution || '');
    setIsModalOpen(true);
  };

  // Save Recurring Rule (Create / Update)
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) {
      alert(t('Please fill all required fields'));
      return;
    }

    setIsSubmitting(true);
    const payload = {
      description: description.trim(),
      amount: Number(amount),
      type,
      category,
      frequency,
      startDate,
      endDate: endDate.trim() || undefined,
      paymentMethod,
      sourceOrPerson: sourceOrPerson.trim() || undefined,
      platformOrInstitution: platformOrInstitution.trim() || undefined,
    };

    if (editingRule) {
      await updateRecurringRule(editingRule.id, payload);
    } else {
      await addRecurringRule(payload);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  // Toggle active/paused status
  const handleToggleActive = async (rule: RecurringRule) => {
    await updateRecurringRule(rule.id, { isActive: !rule.isActive });
  };

  // Delete rule
  const handleDeleteRule = async (id: string) => {
    if (confirm(t('Delete') + '?')) {
      await deleteRecurringRule(id);
    }
  };

  // Trigger Now (Generate immediately)
  const handleTriggerNow = async (id: string) => {
    setTriggeringId(id);
    const res = await triggerRecurringRule(id);
    setTriggeringId(null);
    if (res.success) {
      setProcessSuccessMsg(t('Saved successfully!'));
      setTimeout(() => setProcessSuccessMsg(null), 3000);
    }
  };

  // Process all due rules
  const handleProcessDueRules = async () => {
    setProcessingAll(true);
    const res = await processDueRecurringRules();
    setProcessingAll(false);
    if (res.success) {
      setProcessSuccessMsg(
        res.generatedCount > 0
          ? `${t('Generated')}: ${res.generatedCount}`
          : t('All up to date')
      );
      setTimeout(() => setProcessSuccessMsg(null), 3500);
    }
  };

  // Calculations for summary cards
  const activeRules = recurringRules.filter((r) => r.isActive);
  const monthlyRecurringExpense = recurringRules
    .filter((r) => r.isActive && r.type === 'expense')
    .reduce((sum, r) => {
      let multiplier = 1;
      if (r.frequency === 'daily') multiplier = 30;
      else if (r.frequency === 'weekly') multiplier = 4.33;
      else if (r.frequency === 'yearly') multiplier = 1 / 12;
      return sum + r.amount * multiplier;
    }, 0);

  const monthlyRecurringIncome = recurringRules
    .filter((r) => r.isActive && r.type === 'income')
    .reduce((sum, r) => {
      let multiplier = 1;
      if (r.frequency === 'daily') multiplier = 30;
      else if (r.frequency === 'weekly') multiplier = 4.33;
      else if (r.frequency === 'yearly') multiplier = 1 / 12;
      return sum + r.amount * multiplier;
    }, 0);

  const totalGeneratedCount = recurringRules.reduce((sum, r) => sum + (r.generatedCount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="recurring-transactions-view">
      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Repeat className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            {t('Recurring Transactions')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('Auto-Repeat Rules')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleProcessDueRules}
            disabled={processingAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            id="process-recurring-due-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${processingAll ? 'animate-spin' : ''}`} />
            {processingAll ? t('Loading...') : t('Check Due Transactions')}
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddModal('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-colors"
            id="add-recurring-rule-btn"
          >
            <Plus className="w-4 h-4" />
            {t('Add Recurring Rule')}
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {processSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{processSuccessMsg}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Schedules */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('Active')} {t('Recurring Rules')}</span>
            <Repeat className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {activeRules.length}{' '}
            <span className="text-xs font-medium text-slate-400">/ {recurringRules.length} {t('Total')}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {t('Automated Schedules')}
          </div>
        </div>

        {/* Card 2: Estimated Monthly Inflow */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('Monthly Recurring Income')}</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(monthlyRecurringIncome, curr)}
          </div>
          <div className="text-[11px] text-slate-500">
            {t('Income')}
          </div>
        </div>

        {/* Card 3: Estimated Monthly Outflow */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('Monthly Recurring Expenses')}</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            -{formatCurrency(monthlyRecurringExpense, curr)}
          </div>
          <div className="text-[11px] text-slate-500">
            {t('Expenses')}
          </div>
        </div>

        {/* Card 4: Total Generated */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">{t('Generated')}</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalGeneratedCount}
          </div>
          <div className="text-[11px] text-slate-500">
            {t('Total')} {t('Transactions')}
          </div>
        </div>
      </div>

      {/* Main Recurring List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-4" id="recurring-rules-table-container">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('Configured Schedules')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('Recurring Rules')}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {recurringRules.length} {t('Rules')}
          </span>
        </div>

        {recurringRules.length === 0 ? (
          <div className="p-12 text-center space-y-4 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Repeat className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('No data available')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('Recurring Transactions')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAddModal('expense')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
            >
              {t('Add Recurring Rule')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden" id="recurring-rules-table">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">{t('Description')}</th>
                  <th className="p-3.5">{t('Category')}</th>
                  <th className="p-3.5">{t('Frequency')}</th>
                  <th className="p-3.5">{t('Amount')}</th>
                  <th className="p-3.5">{t('Due Date')}</th>
                  <th className="p-3.5">{t('Status')}</th>
                  <th className="p-3.5">{t('Generated')}</th>
                  <th className="p-3.5 text-right">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {recurringRules.map((rule) => {
                  const meta = CATEGORY_META[rule.category] || {
                    label: rule.category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                    color: '#10B981',
                  };

                  return (
                    <tr
                      key={rule.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors ${
                        !rule.isActive ? 'opacity-60 bg-slate-50/40 dark:bg-slate-900/20' : ''
                      }`}
                      id={`recurring-row-${rule.id}`}
                    >
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: meta.color }}
                          >
                            <CategoryIcon category={rule.category} className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {t(rule.description, rule.description)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {t(rule.paymentMethod || 'Default')} {rule.sourceOrPerson ? `• ${rule.sourceOrPerson}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {t(rule.category, meta.label)}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="capitalize font-bold px-2 py-1 rounded-full text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {t(rule.frequency)}
                        </span>
                      </td>

                      <td className="p-3.5 font-extrabold whitespace-nowrap">
                        <span className={rule.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {rule.type === 'income' ? '+' : '-'}{formatCurrency(rule.amount, curr)}
                        </span>
                      </td>

                      <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(rule.nextDueDate)}</span>
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(rule)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            rule.isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}
                          id={`toggle-active-${rule.id}`}
                        >
                          <Power className="w-3 h-3" />
                          {rule.isActive ? t('Active') : t('Disabled')}
                        </button>
                      </td>

                      <td className="p-3.5 text-slate-500 font-medium whitespace-nowrap">
                        {rule.generatedCount || 0}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Trigger Now button */}
                          <button
                            type="button"
                            onClick={() => handleTriggerNow(rule.id)}
                            disabled={triggeringId === rule.id}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                            title={t('Run Scheduled Check')}
                            id={`trigger-now-${rule.id}`}
                          >
                            <Play className={`w-3.5 h-3.5 ${triggeringId === rule.id ? 'animate-spin' : ''}`} />
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(rule)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                            title={t('Edit')}
                            id={`edit-rule-${rule.id}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-colors"
                            title={t('Delete')}
                            id={`delete-rule-${rule.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Recurring Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150" id="recurring-modal">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-emerald-600" />
                  {editingRule ? t('Edit Recurring Rule') : t('Add Recurring Rule')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Recurring Transactions')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              {/* Type Switcher (Income vs Expense) */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    if (category === 'salary') setCategory('groceries');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === 'expense'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('Expense')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategory('salary');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === 'income'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t('Income')}
                </button>
              </div>

              {/* Title / Description */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('Description')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Rent, Netflix, Salary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Amount & Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('Amount')} ({curr}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('Frequency')} *
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                    className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="daily">{t('Daily')}</option>
                    <option value="weekly">{t('Weekly')}</option>
                    <option value="monthly">{t('Monthly')}</option>
                    <option value="yearly">{t('Yearly')}</option>
                  </select>
                </div>
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('Category')} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {type === 'income' ? (
                      <>
                        <option value="salary">{t('Salary')}</option>
                        <option value="other_income">{t('Other Income')}</option>
                        <option value="initial_fund">{t('Capital Infusion')}</option>
                      </>
                    ) : (
                      <>
                        <option value="groceries">{t('Groceries')}</option>
                        <option value="rental">{t('Rental')}</option>
                        <option value="dharma">{t('Dharma')}</option>
                        <option value="travel">{t('Travel')}</option>
                        <option value="education">{t('Education')}</option>
                        <option value="health">{t('Health')}</option>
                        <option value="hobby">{t('Hobby')}</option>
                        <option value="miscellaneous">{t('Miscellaneous')}</option>
                        <option value="sip">{t('SIP')}</option>
                        <option value="mutual_funds">{t('Mutual Funds')}</option>
                        <option value="stocks">{t('Stocks')}</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('Payment Method')}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {STANDARD_PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {t(m)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date and End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('Start Date')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('End Date')} ({t('Optional')})
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Entity / Counterparty / Platform */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('Person / Contact')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Landlord, Employer"
                    value={sourceOrPerson}
                    onChange={(e) => setSourceOrPerson(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('Bank / Platform')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, Google Pay"
                    value={platformOrInstitution}
                    onChange={(e) => setPlatformOrInstitution(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all"
                >
                  {isSubmitting ? t('Loading...') : editingRule ? t('Update Schedule') : t('Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
