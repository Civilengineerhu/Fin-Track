import React, { useState } from 'react';
import { X, HandCoins, CheckCircle2, Calendar, MessageSquare } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Transaction } from '../types';

interface RepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const RepaymentModal: React.FC<RepaymentModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { user } = useAuth();
  const { activeWorkspace, recordRepayment } = useFinance();
  const { t } = useLanguage();
  const curr = activeWorkspace?.currency || '₹';

  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen || !transaction) return null;

  const currentRepaid = Number(transaction.repaidAmount) || 0;
  const remainingDue = Math.max(0, transaction.amount - currentRepaid);
  const isLent = transaction.type === 'lent';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t('Amount must be greater than 0'));
      return;
    }

    if (parsedAmount > remainingDue) {
      setError(`${t('Remaining Balance')}: ${formatCurrency(remainingDue, curr)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await recordRepayment(transaction.id, parsedAmount, date, comment.trim() || undefined);
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
        className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        id="repayment-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Record Repayment')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isLent ? t('Money Lent') : t('Money Borrowed')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current State Info */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700/60 text-xs">
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500">
              {isLent ? t("Borrower's Name") : t("Lender's Name")}:
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {transaction.sourceOrPerson || t('Person / Contact')}
            </span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500">{t('Total Amount')}:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatCurrency(transaction.amount, curr)}
            </span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-slate-500">{t('Already Repaid')}:</span>
            <span className="font-bold text-emerald-600">
              {formatCurrency(currentRepaid, curr)}
            </span>
          </div>
          <div className="flex justify-between py-0.5 border-t border-slate-200 dark:border-slate-700 mt-1 pt-1 font-semibold">
            <span className="text-slate-700 dark:text-slate-300">{t('Remaining Balance')}:</span>
            <span className="text-amber-600 dark:text-amber-400 font-extrabold">
              {formatCurrency(remainingDue, curr)}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('Repayment Amount')} ({curr}) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAmount(String(remainingDue))}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {t('Set Full Amount')} ({formatCurrency(remainingDue, curr)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                {curr}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remainingDue}
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl text-sm font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                id="repayment-amount-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('Repayment Date')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              id="repayment-date-input"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('Description')}
            </label>
            <input
              type="text"
              placeholder={t('Description')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              id="repayment-comment-input"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
              id="submit-repayment-btn"
            >
              {isSubmitting ? t('Loading...') : t('Record Repayment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
