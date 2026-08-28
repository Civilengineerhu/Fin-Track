import { Workspace, Transaction, RecurringRule, MonthlyBudget, User, RepaymentRecord } from '../types';

export interface OfflineDatabase {
  users: User[];
  workspaces: Workspace[];
  transactions: Transaction[];
  recurringRules: RecurringRule[];
  budgets: MonthlyBudget[];
  lastBackupDate?: string;
}

const STORAGE_KEY = 'fintrack_pro_offline_database_v2';

export const DEFAULT_OFFLINE_USERS: User[] = [
  {
    id: 'usr_ashish',
    name: 'Ashish Chaturvedi',
    email: 'itsashishchaturvedi@gmail.com',
    avatar: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    avatar: '',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_alex',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    avatar: '',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_OFFLINE_WORKSPACES: Workspace[] = [
  {
    id: 'ws_personal',
    name: 'Personal Finances',
    description: 'Personal daily expenses, investments, salary, and savings tracker (Offline)',
    currency: '₹',
    code: 'MYFIN-101',
    ownerId: 'usr_ashish',
    members: [
      {
        userId: 'usr_ashish',
        name: 'Ashish Chaturvedi',
        email: 'itsashishchaturvedi@gmail.com',
        role: 'owner',
        joinedAt: new Date().toISOString(),
      },
    ],
    initialFund: 150000,
    initialFundComment: 'Opening savings balance',
    initialFundDate: new Date().toISOString().split('T')[0],
    initialFundSource: 'Savings Account',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ws_shared_flat',
    name: 'Shared Budget',
    description: 'Shared household expenses, groceries, and utilities (Offline)',
    currency: '₹',
    code: 'FLAT-402',
    ownerId: 'usr_ashish',
    members: [
      {
        userId: 'usr_ashish',
        name: 'Ashish Chaturvedi',
        email: 'itsashishchaturvedi@gmail.com',
        role: 'owner',
        joinedAt: new Date().toISOString(),
      },
      {
        userId: 'usr_sarah',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@example.com',
        role: 'member',
        joinedAt: new Date().toISOString(),
      },
    ],
    initialFund: 30000,
    initialFundComment: 'Joint reserve pool fund',
    initialFundDate: new Date().toISOString().split('T')[0],
    initialFundSource: 'Joint Cash Pool',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const now = new Date();
const todayStr = now.toISOString().split('T')[0];
const yesterday = new Date(now.getTime() - 86400000 * 2).toISOString().split('T')[0];
const threeDaysAgo = new Date(now.getTime() - 86400000 * 5).toISOString().split('T')[0];
const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

const DEFAULT_OFFLINE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_init_1',
    workspaceId: 'ws_personal',
    type: 'income',
    category: 'salary',
    amount: 125000,
    date: todayStr,
    description: 'Monthly salary credited',
    sourceOrPerson: 'Employer',
    paymentMethod: 'Bank Transfer / NEFT',
    tags: ['salary', 'income'],
    createdBy: {
      id: 'usr_ashish',
      name: 'Ashish Chaturvedi',
      email: 'itsashishchaturvedi@gmail.com',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx_init_2',
    workspaceId: 'ws_personal',
    type: 'expense',
    category: 'groceries',
    amount: 4500,
    date: todayStr,
    description: 'Weekly organic groceries and home supplies',
    paymentMethod: 'UPI (GPay / PhonePe / Paytm)',
    tags: ['groceries', 'food'],
    createdBy: {
      id: 'usr_ashish',
      name: 'Ashish Chaturvedi',
      email: 'itsashishchaturvedi@gmail.com',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx_init_rent',
    workspaceId: 'ws_personal',
    type: 'expense',
    category: 'rental',
    amount: 22000,
    date: yesterday,
    description: 'Monthly Apartment Rent for August',
    sourceOrPerson: 'Landlord Sharma Ji',
    paymentMethod: 'Bank Transfer / NEFT',
    tags: ['rent', 'housing', 'rental'],
    createdBy: {
      id: 'usr_ashish',
      name: 'Ashish Chaturvedi',
      email: 'itsashishchaturvedi@gmail.com',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx_init_dharma',
    workspaceId: 'ws_personal',
    type: 'expense',
    category: 'dharma',
    amount: 2500,
    date: todayStr,
    description: 'Monthly Dharma seva donation & temple trust charity',
    sourceOrPerson: 'Shri Ram Mandir Trust',
    paymentMethod: 'UPI (GPay / PhonePe / Paytm)',
    tags: ['dharma', 'charity', 'seva'],
    createdBy: {
      id: 'usr_ashish',
      name: 'Ashish Chaturvedi',
      email: 'itsashishchaturvedi@gmail.com',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx_init_3',
    workspaceId: 'ws_personal',
    type: 'investment',
    category: 'sip',
    amount: 15000,
    date: yesterday,
    description: 'Nifty 50 Index Mutual Fund Monthly SIP',
    investmentType: 'sip',
    platformOrInstitution: 'Zerodha Coin',
    paymentMethod: 'Auto-Debit (ACH/NACH)',
    tags: ['sip', 'investment', 'nifty50'],
    createdBy: {
      id: 'usr_ashish',
      name: 'Ashish Chaturvedi',
      email: 'itsashishchaturvedi@gmail.com',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx_init_4',
    workspaceId: 'ws_personal',
    type: 'lent',
    category: 'miscellaneous',
    amount: 5000,
    date: threeDaysAgo,
    description: 'Lent for urgent medical expenses to friend Rohit',
    sourceOrPerson: 'Rohit Sharma',
    paymentMethod: 'UPI (GPay / PhonePe / Paytm)',
    repaymentStatus: 'pending',
    repaidAmount: 0,
    repayments: [],
    tags: ['lent', 'friend'],
    createdBy: {
      id: 'usr_ashish',
      name: 'Ashish Chaturvedi',
      email: 'itsashishchaturvedi@gmail.com',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_OFFLINE_BUDGETS: MonthlyBudget[] = [
  {
    id: 'bgt_personal_cur',
    workspaceId: 'ws_personal',
    month: currentMonthStr,
    categoryBudgets: {
      groceries: 15000,
      rental: 25000,
      dharma: 5000,
      travel: 8000,
      education: 5000,
      health: 6000,
      hobby: 7000,
      miscellaneous: 10000,
    },
    totalLimit: 81000,
    alertsEnabled: true,
    thresholdPercentage: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getOfflineDb(): OfflineDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.workspaces) && parsed.workspaces.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read offline database from localStorage, initializing fresh:', err);
  }

  // Initialize fresh default database
  const initialDb: OfflineDatabase = {
    users: DEFAULT_OFFLINE_USERS,
    workspaces: DEFAULT_OFFLINE_WORKSPACES,
    transactions: DEFAULT_OFFLINE_TRANSACTIONS,
    recurringRules: [],
    budgets: DEFAULT_OFFLINE_BUDGETS,
    lastBackupDate: new Date().toISOString(),
  };

  saveOfflineDb(initialDb);
  return initialDb;
}

export function saveOfflineDb(db: OfflineDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save offline database to localStorage:', err);
  }
}

// Workspaces
export function getOfflineWorkspaces(userId?: string): Workspace[] {
  const db = getOfflineDb();
  if (!userId) return db.workspaces;
  return db.workspaces.filter(
    (w) => w.ownerId === userId || w.members.some((m) => m.userId === userId)
  );
}

export function createOfflineWorkspace(
  data: {
    name: string;
    description?: string;
    currency?: string;
    initialFund?: number;
    initialFundComment?: string;
    initialFundSource?: string;
    initialFundDate?: string;
  },
  user: User
): Workspace {
  const db = getOfflineDb();
  const id = 'ws_' + Math.random().toString(36).substring(2, 9);
  const code = (data.name.substring(0, 4).toUpperCase() || 'WS') + '-' + Math.floor(100 + Math.random() * 900);

  const newWs: Workspace = {
    id,
    name: data.name,
    description: data.description || '',
    currency: data.currency || '₹',
    code,
    ownerId: user.id,
    members: [
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: 'owner',
        avatar: user.avatar,
        joinedAt: new Date().toISOString(),
      },
    ],
    initialFund: Number(data.initialFund) || 0,
    initialFundComment: data.initialFundComment || '',
    initialFundDate: data.initialFundDate || new Date().toISOString().split('T')[0],
    initialFundSource: data.initialFundSource || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.workspaces.unshift(newWs);

  // If initial fund exists, create initial fund transaction
  if (newWs.initialFund > 0) {
    const initTx: Transaction = {
      id: 'tx_init_' + Math.random().toString(36).substring(2, 9),
      workspaceId: id,
      type: 'income',
      category: 'initial_fund',
      amount: newWs.initialFund,
      date: newWs.initialFundDate || new Date().toISOString().split('T')[0],
      description: newWs.initialFundComment || `Opening balance for ${newWs.name}`,
      sourceOrPerson: newWs.initialFundSource || 'Initial Fund Allocation',
      paymentMethod: 'Bank Transfer / NEFT',
      tags: ['initial_fund', 'opening_balance'],
      createdBy: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.transactions.unshift(initTx);
  }

  saveOfflineDb(db);
  return newWs;
}

export function updateOfflineWorkspace(id: string, updates: Partial<Workspace>): Workspace | null {
  const db = getOfflineDb();
  const idx = db.workspaces.findIndex((w) => w.id === id);
  if (idx === -1) return null;

  const updated: Workspace = {
    ...db.workspaces[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  db.workspaces[idx] = updated;
  saveOfflineDb(db);
  return updated;
}

// Transactions
export function getOfflineTransactions(workspaceId: string): Transaction[] {
  const db = getOfflineDb();
  return db.transactions.filter((t) => t.workspaceId === workspaceId);
}

export function addOfflineTransaction(data: any, user: User): Transaction {
  const db = getOfflineDb();
  const id = 'tx_' + Math.random().toString(36).substring(2, 9);
  const nowStr = new Date().toISOString();

  const newTx: Transaction = {
    id,
    workspaceId: data.workspaceId,
    type: data.type,
    category: data.category,
    amount: Number(data.amount),
    date: data.date,
    description: data.description,
    sourceOrPerson: data.sourceOrPerson || '',
    paymentMethod: data.paymentMethod || 'UPI (GPay / PhonePe / Paytm)',
    platformOrInstitution: data.platformOrInstitution || '',
    investmentType: data.investmentType,
    expectedRepaymentDate: data.expectedRepaymentDate,
    repaymentStatus: data.type === 'lent' || data.type === 'borrowed' ? (data.repaymentStatus || 'pending') : undefined,
    repaidAmount: data.type === 'lent' || data.type === 'borrowed' ? (Number(data.repaidAmount) || 0) : undefined,
    repayments: data.repayments || [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    createdBy: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
    createdAt: nowStr,
    updatedAt: nowStr,
  };

  db.transactions.unshift(newTx);
  saveOfflineDb(db);
  return newTx;
}

export function updateOfflineTransaction(txId: string, updates: any): Transaction | null {
  const db = getOfflineDb();
  const idx = db.transactions.findIndex((t) => t.id === txId);
  if (idx === -1) return null;

  const existing = db.transactions[idx];
  const updated: Transaction = {
    ...existing,
    ...updates,
    amount: updates.amount !== undefined ? Number(updates.amount) : existing.amount,
    updatedAt: new Date().toISOString(),
  };

  db.transactions[idx] = updated;
  saveOfflineDb(db);
  return updated;
}

export function deleteOfflineTransaction(txId: string): boolean {
  const db = getOfflineDb();
  const idx = db.transactions.findIndex((t) => t.id === txId);
  if (idx === -1) return false;

  db.transactions.splice(idx, 1);
  saveOfflineDb(db);
  return true;
}

export function repayOfflineTransaction(
  txId: string,
  amount: number,
  date: string,
  comment: string | undefined,
  user: User
): Transaction | null {
  const db = getOfflineDb();
  const idx = db.transactions.findIndex((t) => t.id === txId);
  if (idx === -1) return null;

  const tx = db.transactions[idx];
  const repayment: RepaymentRecord = {
    id: 'rep_' + Math.random().toString(36).substring(2, 9),
    amount: Number(amount),
    date: date || new Date().toISOString().split('T')[0],
    comment: comment || '',
    addedBy: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    createdAt: new Date().toISOString(),
  };

  if (!tx.repayments) tx.repayments = [];
  tx.repayments.unshift(repayment);

  const totalRepaid = tx.repayments.reduce((sum, r) => sum + Number(r.amount), 0);
  tx.repaidAmount = totalRepaid;

  if (totalRepaid >= tx.amount) {
    tx.repaymentStatus = 'settled';
  } else if (totalRepaid > 0) {
    tx.repaymentStatus = 'partially_repaid';
  } else {
    tx.repaymentStatus = 'pending';
  }

  tx.updatedAt = new Date().toISOString();
  db.transactions[idx] = tx;
  saveOfflineDb(db);
  return tx;
}

// Recurring Rules
export function getOfflineRecurringRules(workspaceId: string): RecurringRule[] {
  const db = getOfflineDb();
  return (db.recurringRules || []).filter((r) => r.workspaceId === workspaceId);
}

export function addOfflineRecurringRule(data: any, user: User): RecurringRule {
  const db = getOfflineDb();
  if (!db.recurringRules) db.recurringRules = [];

  const newRule: RecurringRule = {
    id: 'rec_' + Math.random().toString(36).substring(2, 9),
    workspaceId: data.workspaceId,
    type: data.type,
    category: data.category,
    amount: Number(data.amount),
    description: data.description,
    frequency: data.frequency,
    interval: Number(data.interval) || 1,
    startDate: data.startDate,
    nextDueDate: data.nextDueDate || data.startDate,
    endDate: data.endDate,
    paymentMethod: data.paymentMethod,
    sourceOrPerson: data.sourceOrPerson,
    platformOrInstitution: data.platformOrInstitution,
    investmentType: data.investmentType,
    isActive: true,
    autoProcess: data.autoProcess !== false,
    generatedCount: 0,
    createdBy: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.recurringRules.unshift(newRule);
  saveOfflineDb(db);
  return newRule;
}

export function deleteOfflineRecurringRule(ruleId: string): boolean {
  const db = getOfflineDb();
  if (!db.recurringRules) return false;
  const idx = db.recurringRules.findIndex((r) => r.id === ruleId);
  if (idx === -1) return false;

  db.recurringRules.splice(idx, 1);
  saveOfflineDb(db);
  return true;
}

// Budgets
export function getOfflineBudgets(workspaceId: string): MonthlyBudget[] {
  const db = getOfflineDb();
  return (db.budgets || []).filter((b) => b.workspaceId === workspaceId);
}

export function saveOfflineBudget(
  workspaceId: string,
  month: string,
  categoryBudgets: Record<string, number>,
  totalLimit?: number,
  thresholdPercentage = 80,
  alertsEnabled = true
): MonthlyBudget {
  const db = getOfflineDb();
  if (!db.budgets) db.budgets = [];

  const existingIdx = db.budgets.findIndex((b) => b.workspaceId === workspaceId && b.month === month);
  const calculatedTotal = totalLimit !== undefined && totalLimit !== null
    ? Number(totalLimit)
    : Object.values(categoryBudgets).reduce((sum, val) => sum + (Number(val) || 0), 0);

  if (existingIdx >= 0) {
    const updated: MonthlyBudget = {
      ...db.budgets[existingIdx],
      categoryBudgets,
      totalLimit: calculatedTotal,
      alertsEnabled,
      thresholdPercentage,
      updatedAt: new Date().toISOString(),
    };
    db.budgets[existingIdx] = updated;
    saveOfflineDb(db);
    return updated;
  }

  const newBudget: MonthlyBudget = {
    id: 'bgt_' + Math.random().toString(36).substring(2, 9),
    workspaceId,
    month,
    categoryBudgets,
    totalLimit: calculatedTotal,
    alertsEnabled,
    thresholdPercentage,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.budgets.push(newBudget);
  saveOfflineDb(db);
  return newBudget;
}

export function deleteOfflineBudget(budgetId: string, workspaceId: string): boolean {
  const db = getOfflineDb();
  if (!db.budgets) return false;
  const idx = db.budgets.findIndex((b) => (b.id === budgetId || b.month === budgetId) && b.workspaceId === workspaceId);
  if (idx === -1) return false;

  db.budgets.splice(idx, 1);
  saveOfflineDb(db);
  return true;
}

// Backup & Restore
export function exportOfflineBackupJSON(): string {
  const db = getOfflineDb();
  const backup = {
    version: '2.0-offline',
    exportedAt: new Date().toISOString(),
    app: 'FinTrack Pro',
    data: db,
  };
  return JSON.stringify(backup, null, 2);
}

export function importOfflineBackupJSON(jsonString: string): { success: boolean; message?: string; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const dbToRestore: OfflineDatabase = parsed.data || parsed;

    if (!Array.isArray(dbToRestore.workspaces) || !Array.isArray(dbToRestore.transactions)) {
      return { success: false, error: 'Invalid backup format. Missing workspaces or transactions.' };
    }

    saveOfflineDb(dbToRestore);
    return { success: true, message: `Successfully restored ${dbToRestore.workspaces.length} workspaces and ${dbToRestore.transactions.length} transactions!` };
  } catch (err: any) {
    return { success: false, error: 'Failed to parse backup JSON file: ' + (err?.message || 'Invalid JSON') };
  }
}
