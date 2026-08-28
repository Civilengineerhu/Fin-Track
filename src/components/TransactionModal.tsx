import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit2,
  ArrowDownRight,
  ArrowUpRight,
  Repeat,
  HandCoins,
  Receipt,
  Calendar,
  Building2,
  Users,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: string;
  transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  transactionToEdit = null,
}) => {
  const { user } = useAuth();
  const { activeWorkspace, addTransaction, updateTransaction } = useFinance();
  const { t } = useLanguage();
  const curr = activeWorkspace?.currency || '₹';

  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>('groceries');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [sourceOrPerson, setSourceOrPerson] = useState<string>('');
  const [platformOrInstitution, setPlatformOrInstitution] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [expectedRepaymentDate, setExpectedRepaymentDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setAmount(String(transactionToEdit.amount));
      setDate(transactionToEdit.date);
      setDescription(transactionToEdit.description || '');
      setSourceOrPerson(transactionToEdit.sourceOrPerson || '');
      setPlatformOrInstitution(transactionToEdit.platformOrInstitution || '');
      setPaymentMethod(transactionToEdit.paymentMethod || 'UPI');
      setExpectedRepaymentDate(transactionToEdit.expectedRepaymentDate || '');
    } else {
      const defaultT = (initialType as TransactionType) || 'expense';
      setType(defaultT);
      setAmount('');
      setDescription('');
      setSourceOrPerson('');
      setPlatformOrInstitution('');
      setPaymentMethod('UPI');
      setExpectedRepaymentDate('');
      setDate(new Date().toISOString().split('T')[0]);

      if (defaultT === 'income') setCategory('salary');
      else if (defaultT === 'investment') setCategory('sip');
      else if (defaultT === 'lent') setCategory('money_lent');
      else if (defaultT === 'borrowed') setCategory('money_borrowed');
      else setCategory('groceries');
    }
    setError('');
  }, [transactionToEdit, initialType, isOpen]);

  // When type changes in create mode, set a sensible default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') setCategory('salary');
    else if (newType === 'investment') setCategory('sip');
    else if (newType === 'lent') setCategory('money_lent');
    else if (newType === 'borrowed') setCategory('money_borrowed');
    else setCategory('groceries');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t('Amount must be greater than 0'));
      return;
    }

    if (!description.trim()) {
      setError(t('Description is required'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (transactionToEdit) {
        await updateTransaction(transactionToEdit.id, {
          type,
          category,
          amount: parsedAmount,
          date,
          description: description.trim(),
          sourceOrPerson: sourceOrPerson.trim() || undefined,
          platformOrInstitution: platformOrInstitution.trim() || undefined,
          paymentMethod,
          expectedRepaymentDate: expectedRepaymentDate || undefined,
        });
      } else {
        await addTransaction({
          type,
          category,
          amount: parsedAmount,
          date,
          description: description.trim(),
          sourceOrPerson: sourceOrPerson.trim() || undefined,
          platformOrInstitution: platformOrInstitution.trim() || undefined,
          paymentMethod,
          expectedRepaymentDate: expectedRepaymentDate || undefined,
          repaymentStatus: type === 'lent' || type === 'borrowed' ? 'pending' : undefined,
          repaidAmount: 0,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || t('Failed to save transaction.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150"
        id="transaction-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {transactionToEdit ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {transactionToEdit ? t('Edit Transaction') : t('Add Transaction')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('Workspace')}: {activeWorkspace?.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            id="close-tx-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Type Selector Pills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('Type')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                id="btn-type-expense"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                {t('Expense')}
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                id="btn-type-income"
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                {t('Income')}
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('investment')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                  type === 'investment'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                id="btn-type-investment"
              >
                <Repeat className="w-3.5 h-3.5" />
                {t('Investments')}
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('lent')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                  type === 'lent'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                id="btn-type-lent"
              >
                <HandCoins className="w-3.5 h-3.5" />
                {t('Money Lent')}
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('borrowed')}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                  type === 'borrowed'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                id="btn-type-borrowed"
              >
                <Receipt className="w-3.5 h-3.5" />
                {t('Money Borrowed')}
              </button>
            </div>
          </div>

          {/* Amount & Date in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Amount')} ({curr}) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  {curr}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-sm font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  id="tx-amount-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Date')} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  id="tx-date-input"
                />
              </div>
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('Category')} <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              id="tx-category-select"
            >
              {type === 'income' && (
                <>
                  <option value="salary">{t('Salary')}</option>
                  <option value="initial_fund">{t('Initial Fund')}</option>
                  <option value="other_income">{t('Other Income')}</option>
                </>
              )}

              {type === 'expense' && (
                <>
                  <option value="groceries">{t('Groceries')}</option>
                  <option value="rental">{t('Rental')}</option>
                  <option value="dharma">{t('Dharma')}</option>
                  <option value="travel">{t('Travel')}</option>
                  <option value="education">{t('Education')}</option>
                  <option value="health">{t('Health')}</option>
                  <option value="hobby">{t('Hobby & Leisure')}</option>
                  <option value="miscellaneous">{t('Miscellaneous')}</option>
                </>
              )}

              {type === 'investment' && (
                <>
                  <option value="sip">{t('SIP')}</option>
                  <option value="mutual_funds">{t('Mutual Funds')}</option>
                  <option value="stocks">{t('Stocks')}</option>
                  <option value="fixed_deposits">{t('Fixed Deposits')}</option>
                  <option value="other_investments">{t('Other Investments')}</option>
                </>
              )}

              {type === 'lent' && (
                <option value="money_lent">{t('Money Lent')}</option>
              )}

              {type === 'borrowed' && (
                <option value="money_borrowed">{t('Money Borrowed')}</option>
              )}
            </select>
          </div>

          {/* Source / Person / Entity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {type === 'lent'
                  ? t("Borrower's Name")
                  : type === 'borrowed'
                  ? t("Lender's Name")
                  : type === 'income'
                  ? t('Source / Employer')
                  : t('Person / Contact')}
              </label>
              <input
                type="text"
                placeholder={
                  type === 'lent'
                    ? 'e.g. Rahul Sharma'
                    : type === 'borrowed'
                    ? 'e.g. Amit Kumar'
                    : type === 'income'
                    ? 'e.g. Company'
                    : 'e.g. Store, Vendor'
                }
                value={sourceOrPerson}
                onChange={(e) => setSourceOrPerson(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="tx-source-person-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Payment Method')}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="tx-payment-method-select"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">{t('Credit Card')}</option>
                <option value="Debit Card">{t('Debit Card')}</option>
                <option value="Net Banking">{t('Net Banking')}</option>
                <option value="Cash">{t('Cash')}</option>
              </select>
            </div>
          </div>

          {/* Investment Specific: Platform or Institution */}
          {type === 'investment' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Platform / Broker')}
              </label>
              <input
                type="text"
                placeholder="e.g. Zerodha, Groww, Vanguard, HDFC Bank, SBI"
                value={platformOrInstitution}
                onChange={(e) => setPlatformOrInstitution(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="tx-platform-input"
              />
            </div>
          )}

          {/* Lending/Borrowing Specific: Expected Repayment Date */}
          {(type === 'lent' || type === 'borrowed') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Due Date')} ({t('Optional')})
              </label>
              <input
                type="date"
                value={expectedRepaymentDate}
                onChange={(e) => setExpectedRepaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="tx-expected-repay-date"
              />
            </div>
          )}

          {/* Detailed Comment / Description (Mandatory for accountability) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('Description')} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder={t('Description') + '...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              id="tx-description-input"
            />
          </div>

          {/* Audit Notification */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>
              {t('Added By')}: <strong>{user?.name || t('User')}</strong>
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-colors flex items-center gap-1.5"
              id="save-tx-btn"
            >
              {isSubmitting ? t('Loading...') : transactionToEdit ? t('Save Changes') : t('Add Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
