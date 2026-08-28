export type TransactionType = 'income' | 'expense' | 'investment' | 'lent' | 'borrowed';

export type IncomeCategory = 'initial_fund' | 'salary' | 'other_income';

export type ExpenseCategory =
  | 'groceries'
  | 'travel'
  | 'education'
  | 'dharma'
  | 'rental'
  | 'sip'
  | 'other_investments'
  | 'health'
  | 'hobby'
  | 'miscellaneous';

export type InvestmentType =
  | 'sip'
  | 'mutual_funds'
  | 'stocks'
  | 'fixed_deposits'
  | 'other_investments';

export type RepaymentStatus = 'pending' | 'partially_repaid' | 'settled';

export type WorkspaceRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  avatar?: string;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  currency: string;
  code: string;
  ownerId: string;
  members: WorkspaceMember[];
  initialFund: number;
  initialFundComment?: string;
  initialFundDate?: string;
  initialFundSource?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviterEmail: string;
  inviterName: string;
  invitedEmail: string;
  role: WorkspaceRole;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface RepaymentRecord {
  id: string;
  amount: number;
  date: string;
  comment?: string;
  addedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface Transaction {
  id: string;
  workspaceId: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description: string;
  sourceOrPerson?: string;
  paymentMethod?: string;
  platformOrInstitution?: string;
  investmentType?: InvestmentType;
  expectedRepaymentDate?: string;
  repaymentStatus?: RepaymentStatus;
  repaidAmount?: number;
  repayments?: RepaymentRecord[];
  tags?: string[];
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  updatedBy?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  availableBalance: number;
  initialFund: number;
  totalSalary: number;
  totalOtherIncome: number;
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  totalLent: number;
  outstandingLent: number;
  repaidLentReceived: number;
  totalBorrowed: number;
  outstandingBorrowed: number;
  repaidBorrowedPaid: number;
  netBalance: number;
  categoryBreakdown: {
    category: string;
    label: string;
    amount: number;
    percentage: number;
    count: number;
    color: string;
  }[];
  monthlySummary: {
    month: string;
    year: number;
    monthNum: number;
    income: number;
    expenses: number;
    investments: number;
    lent: number;
    borrowed: number;
    net: number;
  }[];
  investmentBreakdown: {
    type: string;
    label: string;
    amount: number;
    count: number;
    percentage: number;
    color: string;
  }[];
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringRule {
  id: string;
  workspaceId: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  frequency: RecurringFrequency;
  interval?: number; // e.g. 1
  startDate: string;
  nextDueDate: string;
  endDate?: string;
  paymentMethod?: string;
  sourceOrPerson?: string;
  platformOrInstitution?: string;
  investmentType?: InvestmentType;
  isActive: boolean;
  autoProcess: boolean;
  lastGeneratedDate?: string;
  generatedCount: number;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudget {
  id: string;
  workspaceId: string;
  month: string; // "YYYY-MM"
  categoryBudgets: Record<string, number>;
  totalLimit?: number;
  alertsEnabled: boolean;
  thresholdPercentage: number; // default 80
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategoryProgress {
  category: string;
  label: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded' | 'unbudgeted';
  color: string;
  transactionCount: number;
}

export interface BudgetSummary {
  month: string;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  overallPercentage: number;
  status: 'safe' | 'warning' | 'exceeded';
  alertCount: number;
  categories: BudgetCategoryProgress[];
  exceededCategories: BudgetCategoryProgress[];
  warningCategories: BudgetCategoryProgress[];
}

export interface TransactionFilter {
  search?: string;
  type?: TransactionType | 'all';
  category?: string;
  startDate?: string;
  endDate?: string;
  month?: string; // e.g. "2026-08"
  year?: string; // e.g. "2026"
  repaymentStatus?: RepaymentStatus | 'all';
  paymentMethod?: string;
  personName?: string;
  sortBy?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'category';
}

