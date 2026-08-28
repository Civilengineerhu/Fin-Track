import { FinancialSummary, Transaction, ExpenseCategory, InvestmentType } from '../types';

export const CATEGORY_META: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  // Income categories
  initial_fund: { label: 'Initial Fund', color: '#10B981', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: 'Landmark' },
  salary: { label: 'Salary Added', color: '#059669', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', icon: 'Briefcase' },
  other_income: { label: 'Other Income', color: '#0D9488', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', icon: 'TrendingUp' },

  // Expense categories
  groceries: { label: 'Groceries Expense', color: '#F59E0B', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: 'ShoppingCart' },
  travel: { label: 'Travel Expense', color: '#3B82F6', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: 'Plane' },
  education: { label: 'Education Expense', color: '#8B5CF6', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', icon: 'GraduationCap' },
  dharma: { label: 'Dharma', color: '#EA580C', bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', icon: 'Flame' },
  rental: { label: 'Rental', color: '#0284C7', bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', icon: 'Building2' },
  dharma_expenses: { label: 'Dharma', color: '#EA580C', bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', icon: 'Flame' },
  rental_expenses: { label: 'Rental', color: '#0284C7', bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', icon: 'Building2' },
  sip: { label: 'SIP Investment', color: '#6366F1', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', icon: 'Repeat' },
  mutual_funds: { label: 'Mutual Funds', color: '#4F46E5', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', icon: 'PieChart' },
  stocks: { label: 'Stocks / Equity', color: '#0284C7', bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', icon: 'CandlestickChart' },
  fixed_deposits: { label: 'Fixed Deposits', color: '#0D9488', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', icon: 'ShieldCheck' },
  other_investments: { label: 'Other Investments', color: '#EC4899', bg: 'bg-pink-500/10 text-pink-600 dark:text-pink-400', icon: 'Gem' },
  health: { label: 'Health Expense', color: '#EF4444', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400', icon: 'HeartPulse' },
  hobby: { label: 'Hobby Expense', color: '#F97316', bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', icon: 'Palette' },
  miscellaneous: { label: 'Miscellaneous Expense', color: '#64748B', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400', icon: 'Layers' },

  // Lent and Borrowed
  money_lent: { label: 'Money Lent', color: '#D97706', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: 'HandCoins' },
  money_borrowed: { label: 'Money Borrowed', color: '#DC2626', bg: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: 'Receipt' },
};

export function formatCurrency(amount: number, currency: string = '₹'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted = '';
  if (currency === '₹') {
    // Indian numbering format (e.g., ₹1,25,000)
    formatted = absAmount.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  } else {
    formatted = absAmount.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  }

  return `${isNegative ? '-' : ''}${currency}${formatted}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return `${d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return dateString;
  }
}

export function calculateFinancialSummary(
  transactions: Transaction[],
  initialFund: number = 0
): FinancialSummary {
  let totalSalary = 0;
  let totalOtherIncome = 0;
  let totalExpenses = 0;
  let totalInvestments = 0;
  let totalLent = 0;
  let repaidLentReceived = 0;
  let totalBorrowed = 0;
  let repaidBorrowedPaid = 0;

  const categoryMap: Record<string, { amount: number; count: number }> = {};
  const investmentMap: Record<string, { amount: number; count: number }> = {};
  const monthlyMap: Record<
    string,
    { month: string; year: number; monthNum: number; income: number; expenses: number; investments: number; lent: number; borrowed: number; net: number }
  > = {};

  transactions.forEach((tx) => {
    const amount = Number(tx.amount) || 0;
    const txDate = tx.date ? new Date(tx.date) : new Date();
    const monthKey = !isNaN(txDate.getTime())
      ? `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`
      : 'Unknown';
    const monthLabel = !isNaN(txDate.getTime())
      ? txDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : 'Unknown';

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = {
        month: monthLabel,
        year: !isNaN(txDate.getTime()) ? txDate.getFullYear() : 0,
        monthNum: !isNaN(txDate.getTime()) ? txDate.getMonth() + 1 : 0,
        income: 0,
        expenses: 0,
        investments: 0,
        lent: 0,
        borrowed: 0,
        net: 0,
      };
    }

    if (tx.type === 'income') {
      if (tx.category === 'salary') {
        totalSalary += amount;
      } else {
        totalOtherIncome += amount;
      }
      monthlyMap[monthKey].income += amount;
      monthlyMap[monthKey].net += amount;
    } else if (tx.type === 'expense') {
      totalExpenses += amount;
      monthlyMap[monthKey].expenses += amount;
      monthlyMap[monthKey].net -= amount;

      const catKey = tx.category || 'miscellaneous';
      if (!categoryMap[catKey]) {
        categoryMap[catKey] = { amount: 0, count: 0 };
      }
      categoryMap[catKey].amount += amount;
      categoryMap[catKey].count += 1;
    } else if (tx.type === 'investment') {
      totalInvestments += amount;
      monthlyMap[monthKey].investments += amount;
      monthlyMap[monthKey].net -= amount;

      const invType = tx.investmentType || tx.category || 'other_investments';
      if (!investmentMap[invType]) {
        investmentMap[invType] = { amount: 0, count: 0 };
      }
      investmentMap[invType].amount += amount;
      investmentMap[invType].count += 1;
    } else if (tx.type === 'lent') {
      totalLent += amount;
      const repaid = Number(tx.repaidAmount) || 0;
      repaidLentReceived += repaid;
      monthlyMap[monthKey].lent += amount;
      monthlyMap[monthKey].net -= (amount - repaid);
    } else if (tx.type === 'borrowed') {
      totalBorrowed += amount;
      const repaid = Number(tx.repaidAmount) || 0;
      repaidBorrowedPaid += repaid;
      monthlyMap[monthKey].borrowed += amount;
      monthlyMap[monthKey].net += (amount - repaid);
    }
  });

  const totalIncome = totalSalary + totalOtherIncome;
  const outstandingLent = Math.max(0, totalLent - repaidLentReceived);
  const outstandingBorrowed = Math.max(0, totalBorrowed - repaidBorrowedPaid);

  // Financial Balance Formula:
  // Available Balance = Initial Fund + Salary + Other Income + Money Repaid to You (from Lent) + Borrowed Money Received - Expenses - Investments - Money Lent - Money Repaid by You (towards Borrowed)
  const availableBalance =
    initialFund +
    totalSalary +
    totalOtherIncome +
    repaidLentReceived +
    totalBorrowed -
    totalExpenses -
    totalInvestments -
    totalLent -
    repaidBorrowedPaid;

  // Net Balance / Net Worth = Available Balance + Total Investments + Outstanding Lent - Outstanding Borrowed
  const netBalance = availableBalance + totalInvestments + outstandingLent - outstandingBorrowed;

  // Category breakdown for expenses
  const categoryBreakdown = Object.entries(categoryMap).map(([key, value]) => {
    const meta = CATEGORY_META[key] || {
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      color: '#94A3B8',
    };
    return {
      category: key,
      label: meta.label,
      amount: value.amount,
      percentage: totalExpenses > 0 ? (value.amount / totalExpenses) * 100 : 0,
      count: value.count,
      color: meta.color,
    };
  }).sort((a, b) => b.amount - a.amount);

  // Investment breakdown
  const investmentBreakdown = Object.entries(investmentMap).map(([key, value]) => {
    const meta = CATEGORY_META[key] || {
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      color: '#6366F1',
    };
    return {
      type: key,
      label: meta.label,
      amount: value.amount,
      count: value.count,
      percentage: totalInvestments > 0 ? (value.amount / totalInvestments) * 100 : 0,
      color: meta.color,
    };
  }).sort((a, b) => b.amount - a.amount);

  // Monthly summary sorted chronologically
  const monthlySummary = Object.keys(monthlyMap)
    .sort()
    .map((k) => monthlyMap[k]);

  return {
    availableBalance,
    initialFund,
    totalSalary,
    totalOtherIncome,
    totalIncome,
    totalExpenses,
    totalInvestments,
    totalLent,
    outstandingLent,
    repaidLentReceived,
    totalBorrowed,
    outstandingBorrowed,
    repaidBorrowedPaid,
    netBalance,
    categoryBreakdown,
    monthlySummary,
    investmentBreakdown,
  };
}

export const ALL_EXPENSE_CATEGORIES = [
  { key: 'groceries', label: 'Groceries', color: '#F59E0B' },
  { key: 'rental', label: 'Rental', color: '#0284C7' },
  { key: 'dharma', label: 'Dharma', color: '#EA580C' },
  { key: 'travel', label: 'Travel & Commute', color: '#3B82F6' },
  { key: 'education', label: 'Education & Learning', color: '#8B5CF6' },
  { key: 'health', label: 'Health & Medical', color: '#EF4444' },
  { key: 'hobby', label: 'Hobby & Leisure', color: '#F97316' },
  { key: 'miscellaneous', label: 'Utilities & Misc', color: '#64748B' },
];

export const STANDARD_PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Net Banking',
  'Cheque',
  'Digital Wallet',
];

export function extractPaymentMethods(transactions: Transaction[]): string[] {
  const methods = new Set<string>(STANDARD_PAYMENT_METHODS);
  transactions.forEach((tx) => {
    if (tx.paymentMethod && tx.paymentMethod.trim()) {
      methods.add(tx.paymentMethod.trim());
    }
  });
  return Array.from(methods).sort();
}

export function extractCounterparties(transactions: Transaction[]): { name: string; types: string[]; count: number }[] {
  const map: Record<string, { types: Set<string>; count: number }> = {};
  transactions.forEach((tx) => {
    const person = tx.sourceOrPerson?.trim();
    if (person) {
      if (!map[person]) {
        map[person] = { types: new Set(), count: 0 };
      }
      map[person].types.add(tx.type);
      map[person].count += 1;
    }
  });

  return Object.entries(map)
    .map(([name, val]) => ({
      name,
      types: Array.from(val.types),
      count: val.count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateBudgetSummary(
  transactions: Transaction[],
  budget: import('../types').MonthlyBudget | null,
  monthStr: string
): import('../types').BudgetSummary {
  // Filter expenses for specified month (e.g., "2026-08")
  const monthExpenses = transactions.filter(
    (tx) => tx.type === 'expense' && (!monthStr || tx.date.startsWith(monthStr))
  );

  const categorySpentMap: Record<string, { spent: number; count: number }> = {};
  monthExpenses.forEach((tx) => {
    const cat = tx.category || 'miscellaneous';
    if (!categorySpentMap[cat]) {
      categorySpentMap[cat] = { spent: 0, count: 0 };
    }
    categorySpentMap[cat].spent += Number(tx.amount) || 0;
    categorySpentMap[cat].count += 1;
  });

  const categoryBudgets = budget?.categoryBudgets || {};
  const threshold = budget?.thresholdPercentage || 80;

  // Union of defined budget categories and standard expense categories
  const allCatKeys = Array.from(
    new Set([
      ...ALL_EXPENSE_CATEGORIES.map((c) => c.key),
      ...Object.keys(categoryBudgets),
      ...Object.keys(categorySpentMap),
    ])
  );

  const categories: import('../types').BudgetCategoryProgress[] = allCatKeys.map((catKey) => {
    const meta = CATEGORY_META[catKey] || {
      label: catKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      color: '#94A3B8',
    };
    const budgetAmount = Number(categoryBudgets[catKey]) || 0;
    const spentAmount = categorySpentMap[catKey]?.spent || 0;
    const count = categorySpentMap[catKey]?.count || 0;
    const remainingAmount = budgetAmount - spentAmount;
    const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : spentAmount > 0 ? 100 : 0;

    let status: 'safe' | 'warning' | 'exceeded' | 'unbudgeted' = 'safe';
    if (budgetAmount === 0) {
      status = spentAmount > 0 ? 'unbudgeted' : 'safe';
    } else if (percentage >= 100) {
      status = 'exceeded';
    } else if (percentage >= threshold) {
      status = 'warning';
    } else {
      status = 'safe';
    }

    return {
      category: catKey,
      label: meta.label,
      budgetAmount,
      spentAmount,
      remainingAmount,
      percentage,
      status,
      color: meta.color,
      transactionCount: count,
    };
  }).sort((a, b) => {
    // Sort exceeded first, then warning, then highest spent
    if (a.status === 'exceeded' && b.status !== 'exceeded') return -1;
    if (b.status === 'exceeded' && a.status !== 'exceeded') return 1;
    if (a.status === 'warning' && b.status === 'safe') return -1;
    if (b.status === 'warning' && a.status === 'safe') return 1;
    return b.spentAmount - a.spentAmount;
  });

  const totalBudget = budget?.totalLimit !== undefined && budget.totalLimit > 0
    ? budget.totalLimit
    : Object.values(categoryBudgets).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const totalSpent = monthExpenses.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const remainingBudget = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  let overallStatus: 'safe' | 'warning' | 'exceeded' = 'safe';
  if (totalBudget > 0 && overallPercentage >= 100) {
    overallStatus = 'exceeded';
  } else if (totalBudget > 0 && overallPercentage >= threshold) {
    overallStatus = 'warning';
  }

  const exceededCategories = categories.filter((c) => c.status === 'exceeded');
  const warningCategories = categories.filter((c) => c.status === 'warning');

  return {
    month: monthStr,
    totalBudget,
    totalSpent,
    remainingBudget,
    overallPercentage,
    status: overallStatus,
    alertCount: exceededCategories.length + warningCategories.length,
    categories,
    exceededCategories,
    warningCategories,
  };
}

export function exportTransactionsToCSV(
  transactions: Transaction[],
  filename: string = 'financial_transactions_report.csv',
  currency: string = '₹'
) {
  const headers = [
    'ID',
    'Date',
    'Type',
    'Category',
    'Description',
    `Amount (${currency})`,
    'Payment Method',
    'Source / Person Involved',
    'Platform / Institution',
    'Repayment Status',
    `Repaid Amount (${currency})`,
    'Created By',
  ];

  const rows = transactions.map((tx) => [
    tx.id,
    tx.date,
    tx.type.toUpperCase(),
    CATEGORY_META[tx.category]?.label || tx.category,
    `"${(tx.description || '').replace(/"/g, '""')}"`,
    tx.amount,
    `"${(tx.paymentMethod || '—').replace(/"/g, '""')}"`,
    `"${(tx.sourceOrPerson || '—').replace(/"/g, '""')}"`,
    `"${(tx.platformOrInstitution || '—').replace(/"/g, '""')}"`,
    tx.repaymentStatus || 'N/A',
    tx.repaidAmount || 0,
    `"${(tx.createdBy?.name || '—').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

