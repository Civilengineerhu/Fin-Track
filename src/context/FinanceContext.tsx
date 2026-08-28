import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Workspace, Transaction, FinancialSummary, TransactionFilter, RecurringRule, MonthlyBudget, BudgetSummary } from '../types';
import { calculateFinancialSummary, calculateBudgetSummary } from '../utils/formatters';
import { useAuth } from './AuthContext';
import {
  getOfflineWorkspaces,
  createOfflineWorkspace,
  updateOfflineWorkspace,
  getOfflineTransactions,
  addOfflineTransaction,
  updateOfflineTransaction,
  deleteOfflineTransaction,
  repayOfflineTransaction,
  getOfflineRecurringRules,
  addOfflineRecurringRule,
  deleteOfflineRecurringRule,
  getOfflineBudgets,
  saveOfflineBudget,
  deleteOfflineBudget,
  exportOfflineBackupJSON,
  importOfflineBackupJSON,
  getOfflineDb,
  saveOfflineDb,
} from '../utils/offlineStorage';

interface FinanceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  financialSummary: FinancialSummary;
  recurringRules: RecurringRule[];
  budgets: MonthlyBudget[];
  activeMonth: string;
  setActiveMonth: (month: string) => void;
  activeBudget: MonthlyBudget | null;
  budgetSummary: BudgetSummary;
  isLoading: boolean;
  isSyncing: boolean;
  isOfflineMode: boolean;
  lastSyncTime: Date | null;
  filter: TransactionFilter;
  setFilter: React.Dispatch<React.SetStateAction<TransactionFilter>>;
  resetFilter: () => void;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (data: {
    name: string;
    description?: string;
    currency?: string;
    initialFund?: number;
    initialFundComment?: string;
    initialFundSource?: string;
    initialFundDate?: string;
  }) => Promise<{ success: boolean; workspace?: Workspace; error?: string }>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<{ success: boolean; error?: string }>;
  inviteMember: (email: string, role?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  joinWorkspaceByCode: (code: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  addTransaction: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateTransaction: (txId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  deleteTransaction: (txId: string) => Promise<{ success: boolean; error?: string }>;
  repayTransaction: (txId: string, amount: number, date: string, comment?: string) => Promise<{ success: boolean; error?: string }>;
  fetchRecurringRules: () => Promise<void>;
  addRecurringRule: (data: any) => Promise<{ success: boolean; error?: string; rule?: RecurringRule }>;
  updateRecurringRule: (ruleId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
  deleteRecurringRule: (ruleId: string) => Promise<{ success: boolean; error?: string }>;
  triggerRecurringRule: (ruleId: string) => Promise<{ success: boolean; error?: string }>;
  processDueRecurringRules: () => Promise<{ success: boolean; generatedCount: number; error?: string }>;
  fetchBudgets: () => Promise<void>;
  saveMonthlyBudget: (
    month: string,
    categoryBudgets: Record<string, number>,
    totalLimit?: number,
    thresholdPercentage?: number,
    alertsEnabled?: boolean
  ) => Promise<{ success: boolean; budget?: MonthlyBudget; error?: string }>;
  deleteBudget: (budgetId: string) => Promise<{ success: boolean; error?: string }>;
  seedDemoData: () => Promise<void>;
  exportBackup: () => string;
  importBackup: (jsonStr: string) => { success: boolean; message?: string; error?: string };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const initialFilterState: TransactionFilter = {
  search: '',
  type: 'all',
  category: 'all',
  month: 'all',
  year: 'all',
  repaymentStatus: 'all',
  paymentMethod: 'all',
  personName: 'all',
  sortBy: 'date_desc',
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);

  // Default to current month "YYYY-MM"
  const defaultCurrentMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);
  const [activeMonth, setActiveMonth] = useState<string>(defaultCurrentMonth);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [filter, setFilter] = useState<TransactionFilter>(initialFilterState);

  // Fetch workspaces for current user with offline-first fallback
  const fetchWorkspaces = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/workspaces?userId=${encodeURIComponent(user.id)}&userEmail=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        const list: Workspace[] = data.workspaces || [];
        if (list.length > 0) {
          setWorkspaces(list);
          setIsOfflineMode(false);
          setActiveWorkspace((prev) => {
            if (prev && list.some((w) => w.id === prev.id)) {
              return list.find((w) => w.id === prev.id) || prev;
            }
            return list[0] || null;
          });
          return;
        }
      }
    } catch {
      // Backend not running / offline mode
      setIsOfflineMode(true);
    }

    // Load from local offline storage
    const offlineList = getOfflineWorkspaces(user.id);
    setWorkspaces(offlineList);
    setActiveWorkspace((prev) => {
      if (prev && offlineList.some((w) => w.id === prev.id)) {
        return offlineList.find((w) => w.id === prev.id) || prev;
      }
      return offlineList[0] || null;
    });
  }, [user]);

  // Fetch transactions for active workspace with offline fallback
  const fetchTransactions = useCallback(async (workspaceId: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/transactions`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setLastSyncTime(new Date());
        setIsSyncing(false);
        setIsLoading(false);
        return;
      }
    } catch {
      // Offline mode
    }

    // Fallback to local offline storage
    const localTxs = getOfflineTransactions(workspaceId);
    setTransactions(localTxs);
    setLastSyncTime(new Date());
    setIsSyncing(false);
    setIsLoading(false);
  }, []);

  // Fetch recurring rules
  const fetchRecurringRules = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/recurring`);
      if (res.ok) {
        const data = await res.json();
        setRecurringRules(data.recurringRules || []);
        if (data.autoGeneratedCount > 0) {
          fetchTransactions(activeWorkspace.id);
        }
        return;
      }
    } catch {
      // Offline fallback
    }

    const localRules = getOfflineRecurringRules(activeWorkspace.id);
    setRecurringRules(localRules);
  }, [activeWorkspace, fetchTransactions]);

  // Fetch budgets
  const fetchBudgets = useCallback(async () => {
    if (!activeWorkspace) return;
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/budgets`);
      if (res.ok) {
        const data = await res.json();
        setBudgets(data.budgets || []);
        return;
      }
    } catch {
      // Offline fallback
    }

    const localBudgets = getOfflineBudgets(activeWorkspace.id);
    setBudgets(localBudgets);
  }, [activeWorkspace]);

  // Initial load
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      fetchWorkspaces();
    } else {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setTransactions([]);
      setRecurringRules([]);
      setBudgets([]);
      setIsLoading(false);
    }
  }, [user, fetchWorkspaces]);

  // Load transactions, recurring, budgets when workspace changes
  useEffect(() => {
    if (activeWorkspace) {
      fetchTransactions(activeWorkspace.id);
      fetchRecurringRules();
      fetchBudgets();
    } else {
      setTransactions([]);
      setRecurringRules([]);
      setBudgets([]);
    }
  }, [activeWorkspace?.id, fetchTransactions, fetchRecurringRules, fetchBudgets]);

  // Optional real-time SSE when server is active
  useEffect(() => {
    if (!activeWorkspace) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/workspaces/${activeWorkspace.id}/events`);

      eventSource.addEventListener('connected', () => {
        setIsOfflineMode(false);
        setLastSyncTime(new Date());
      });

      eventSource.addEventListener('transaction_created', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.transaction) {
            setTransactions((prev) => {
              if (prev.some((t) => t.id === payload.transaction.id)) return prev;
              return [payload.transaction, ...prev];
            });
            setLastSyncTime(new Date());
          }
        } catch {}
      });

      eventSource.addEventListener('transaction_updated', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.transaction) {
            setTransactions((prev) =>
              prev.map((t) => (t.id === payload.transaction.id ? payload.transaction : t))
            );
            setLastSyncTime(new Date());
          }
        } catch {}
      });

      eventSource.addEventListener('transaction_deleted', (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.transactionId) {
            setTransactions((prev) => prev.filter((t) => t.id !== payload.transactionId));
            setLastSyncTime(new Date());
          }
        } catch {}
      });

      eventSource.onerror = () => {
        // Quietly handle connection close in offline mode
        eventSource?.close();
      };
    } catch {
      // EventSource failed -> offline
    }

    return () => {
      eventSource?.close();
    };
  }, [activeWorkspace?.id]);

  const createWorkspace = async (data: {
    name: string;
    description?: string;
    currency?: string;
    initialFund?: number;
    initialFundComment?: string;
    initialFundSource?: string;
    initialFundDate?: string;
  }) => {
    if (!user) return { success: false, error: 'User not logged in' };
    
    // Save to local offline database first
    const localWs = createOfflineWorkspace(data, user);
    setWorkspaces((prev) => [...prev, localWs]);
    setActiveWorkspace(localWs);
    fetchTransactions(localWs.id);

    // Try background server sync if online
    try {
      fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user }),
      }).catch(() => {});
    } catch {}

    return { success: true, workspace: localWs };
  };

  const updateWorkspace = async (id: string, updates: Partial<Workspace>) => {
    const updated = updateOfflineWorkspace(id, updates);
    if (updated) {
      setActiveWorkspace(updated);
      setWorkspaces((prev) => prev.map((w) => (w.id === id ? updated : w)));
    }

    // Try background server update
    try {
      fetch(`/api/workspaces/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).catch(() => {});
    } catch {}

    return { success: true };
  };

  const inviteMember = async (email: string, role = 'member') => {
    if (!activeWorkspace || !user) return { success: false, error: 'Active workspace required' };

    const newMember = {
      userId: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: email.split('@')[0],
      email: email.toLowerCase(),
      role: role as any,
      joinedAt: new Date().toISOString(),
    };

    const updatedMembers = [...activeWorkspace.members, newMember];
    await updateWorkspace(activeWorkspace.id, { members: updatedMembers });
    return { success: true, message: `Member ${email} added locally to workspace!` };
  };

  const joinWorkspaceByCode = async (code: string) => {
    if (!user) return { success: false, error: 'User must be signed in' };
    const db = getOfflineDb();
    const targetWs = db.workspaces.find((w) => w.code.toUpperCase() === code.trim().toUpperCase());

    if (targetWs) {
      if (!targetWs.members.some((m) => m.userId === user.id)) {
        targetWs.members.push({
          userId: user.id,
          name: user.name,
          email: user.email,
          role: 'member',
          avatar: user.avatar,
          joinedAt: new Date().toISOString(),
        });
        saveOfflineDb(db);
      }
      setWorkspaces((prev) => {
        if (prev.some((w) => w.id === targetWs.id)) return prev;
        return [...prev, targetWs];
      });
      setActiveWorkspace(targetWs);
      return { success: true, message: `Joined ${targetWs.name} successfully!` };
    }

    return { success: false, error: 'Workspace with this code not found in offline ledger.' };
  };

  const addTransaction = async (data: any) => {
    if (!activeWorkspace || !user) return { success: false, error: 'Active workspace and user required' };

    // Offline-first immediate save
    const newTx = addOfflineTransaction({ ...data, workspaceId: activeWorkspace.id }, user);
    setTransactions((prev) => [newTx, ...prev]);
    setLastSyncTime(new Date());

    // Try background server sync
    try {
      fetch(`/api/workspaces/${activeWorkspace.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user }),
      }).catch(() => {});
    } catch {}

    return { success: true };
  };

  const updateTransaction = async (txId: string, updates: any) => {
    if (!activeWorkspace) return { success: false, error: 'Active workspace required' };

    const updated = updateOfflineTransaction(txId, updates);
    if (updated) {
      setTransactions((prev) => prev.map((t) => (t.id === txId ? updated : t)));
      setLastSyncTime(new Date());
    }

    try {
      fetch(`/api/workspaces/${activeWorkspace.id}/transactions/${txId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, user }),
      }).catch(() => {});
    } catch {}

    return { success: true };
  };

  const deleteTransaction = async (txId: string) => {
    if (!activeWorkspace) return { success: false, error: 'Active workspace required' };

    deleteOfflineTransaction(txId);
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    setLastSyncTime(new Date());

    try {
      fetch(`/api/workspaces/${activeWorkspace.id}/transactions/${txId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user }),
      }).catch(() => {});
    } catch {}

    return { success: true };
  };

  const repayTransaction = async (txId: string, amount: number, date: string, comment?: string) => {
    if (!activeWorkspace || !user) return { success: false, error: 'Active workspace required' };

    const updated = repayOfflineTransaction(txId, amount, date, comment, user);
    if (updated) {
      setTransactions((prev) => prev.map((t) => (t.id === txId ? updated : t)));
      setLastSyncTime(new Date());
    }

    try {
      fetch(`/api/workspaces/${activeWorkspace.id}/transactions/${txId}/repay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, date, comment, user }),
      }).catch(() => {});
    } catch {}

    return { success: true };
  };

  const addRecurringRule = async (data: any) => {
    if (!activeWorkspace || !user) return { success: false, error: 'Active workspace required' };

    const newRule = addOfflineRecurringRule({ ...data, workspaceId: activeWorkspace.id }, user);
    setRecurringRules((prev) => [newRule, ...prev]);

    try {
      fetch(`/api/workspaces/${activeWorkspace.id}/recurring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user }),
      }).catch(() => {});
    } catch {}

    return { success: true, rule: newRule };
  };

  const updateRecurringRule = async (ruleId: string, updates: any) => {
    const db = getOfflineDb();
    const idx = (db.recurringRules || []).findIndex((r) => r.id === ruleId);
    if (idx >= 0) {
      db.recurringRules[idx] = { ...db.recurringRules[idx], ...updates, updatedAt: new Date().toISOString() };
      saveOfflineDb(db);
      setRecurringRules([...db.recurringRules]);
    }

    try {
      if (activeWorkspace) {
        fetch(`/api/workspaces/${activeWorkspace.id}/recurring/${ruleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...updates, user }),
        }).catch(() => {});
      }
    } catch {}

    return { success: true };
  };

  const deleteRecurringRule = async (ruleId: string) => {
    deleteOfflineRecurringRule(ruleId);
    setRecurringRules((prev) => prev.filter((r) => r.id !== ruleId));

    try {
      if (activeWorkspace) {
        fetch(`/api/workspaces/${activeWorkspace.id}/recurring/${ruleId}`, {
          method: 'DELETE',
        }).catch(() => {});
      }
    } catch {}

    return { success: true };
  };

  const triggerRecurringRule = async (ruleId: string) => {
    if (!activeWorkspace || !user) return { success: false, error: 'Active workspace required' };
    const rule = recurringRules.find((r) => r.id === ruleId);
    if (!rule) return { success: false, error: 'Rule not found' };

    // Create immediate transaction from recurring rule
    const today = new Date().toISOString().split('T')[0];
    await addTransaction({
      type: rule.type,
      category: rule.category,
      amount: rule.amount,
      date: today,
      description: `[Recurring - ${rule.frequency}] ${rule.description}`,
      sourceOrPerson: rule.sourceOrPerson,
      paymentMethod: rule.paymentMethod,
      platformOrInstitution: rule.platformOrInstitution,
      investmentType: rule.investmentType,
      tags: ['recurring', rule.frequency],
    });

    return { success: true };
  };

  const processDueRecurringRules = async () => {
    return { success: true, generatedCount: 0 };
  };

  const saveMonthlyBudget = async (
    month: string,
    categoryBudgets: Record<string, number>,
    totalLimit?: number,
    thresholdPercentage = 80,
    alertsEnabled = true
  ) => {
    if (!activeWorkspace) return { success: false, error: 'Active workspace required' };

    const newBudget = saveOfflineBudget(
      activeWorkspace.id,
      month,
      categoryBudgets,
      totalLimit,
      thresholdPercentage,
      alertsEnabled
    );

    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.id === newBudget.id || b.month === newBudget.month);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newBudget;
        return copy;
      }
      return [...prev, newBudget];
    });

    try {
      fetch(`/api/workspaces/${activeWorkspace.id}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          categoryBudgets,
          totalLimit,
          thresholdPercentage,
          alertsEnabled,
          user,
        }),
      }).catch(() => {});
    } catch {}

    return { success: true, budget: newBudget };
  };

  const deleteBudget = async (budgetId: string) => {
    if (!activeWorkspace) return { success: false, error: 'Active workspace required' };

    deleteOfflineBudget(budgetId, activeWorkspace.id);
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId && b.month !== budgetId));

    try {
      fetch(`/api/workspaces/${activeWorkspace.id}/budgets/${budgetId}`, {
        method: 'DELETE',
      }).catch(() => {});
    } catch {}

    return { success: true };
  };

  const seedDemoData = async () => {
    // Reset local offline storage to fresh default state
    localStorage.removeItem('fintrack_pro_offline_database_v2');
    const freshDb = getOfflineDb();
    setWorkspaces(freshDb.workspaces);
    setActiveWorkspace(freshDb.workspaces[0] || null);
    if (freshDb.workspaces[0]) {
      fetchTransactions(freshDb.workspaces[0].id);
      fetchRecurringRules();
      fetchBudgets();
    }
  };

  const exportBackup = () => {
    return exportOfflineBackupJSON();
  };

  const importBackup = (jsonStr: string) => {
    const res = importOfflineBackupJSON(jsonStr);
    if (res.success && user) {
      fetchWorkspaces();
    }
    return res;
  };

  const resetFilter = () => {
    setFilter(initialFilterState);
  };

  // Filtered transactions computation
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const matchesDesc = tx.description?.toLowerCase().includes(q);
        const matchesCat = tx.category?.toLowerCase().includes(q);
        const matchesSource = tx.sourceOrPerson?.toLowerCase().includes(q);
        const matchesPlatform = tx.platformOrInstitution?.toLowerCase().includes(q);
        const matchesTags = tx.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesDesc && !matchesCat && !matchesSource && !matchesPlatform && !matchesTags) {
          return false;
        }
      }

      if (filter.type !== 'all' && tx.type !== filter.type) return false;
      if (filter.category !== 'all' && tx.category !== filter.category) return false;

      if (filter.month !== 'all') {
        const txMonth = tx.date ? tx.date.substring(5, 7) : '';
        if (txMonth !== filter.month) return false;
      }

      if (filter.year !== 'all') {
        const txYear = tx.date ? tx.date.substring(0, 4) : '';
        if (txYear !== filter.year) return false;
      }

      if (filter.repaymentStatus !== 'all') {
        if (tx.type === 'lent' || tx.type === 'borrowed') {
          if ((tx.repaymentStatus || 'pending') !== filter.repaymentStatus) return false;
        } else {
          return false;
        }
      }

      if (filter.paymentMethod !== 'all' && tx.paymentMethod !== filter.paymentMethod) {
        return false;
      }

      if (filter.personName !== 'all') {
        if (tx.sourceOrPerson?.toLowerCase() !== filter.personName.toLowerCase()) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filter.sortBy === 'date_asc') return a.date.localeCompare(b.date);
      if (filter.sortBy === 'date_desc') return b.date.localeCompare(a.date);
      if (filter.sortBy === 'amount_asc') return a.amount - b.amount;
      if (filter.sortBy === 'amount_desc') return b.amount - a.amount;
      return 0;
    });
  }, [transactions, filter]);

  // Financial summary computation
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(transactions, activeWorkspace?.initialFund || 0);
  }, [transactions, activeWorkspace?.initialFund]);

  // Active monthly budget & summary computation
  const activeBudget = useMemo(() => {
    return budgets.find((b) => b.month === activeMonth) || null;
  }, [budgets, activeMonth]);

  const budgetSummary = useMemo(() => {
    return calculateBudgetSummary(transactions, activeMonth, activeBudget);
  }, [transactions, activeMonth, activeBudget]);

  return (
    <FinanceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        transactions,
        filteredTransactions,
        financialSummary,
        recurringRules,
        budgets,
        activeMonth,
        setActiveMonth,
        activeBudget,
        budgetSummary,
        isLoading,
        isSyncing,
        isOfflineMode,
        lastSyncTime,
        filter,
        setFilter,
        resetFilter,
        fetchWorkspaces,
        createWorkspace,
        updateWorkspace,
        inviteMember,
        joinWorkspaceByCode,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        repayTransaction,
        fetchRecurringRules,
        addRecurringRule,
        updateRecurringRule,
        deleteRecurringRule,
        triggerRecurringRule,
        processDueRecurringRules,
        fetchBudgets,
        saveMonthlyBudget,
        deleteBudget,
        seedDemoData,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
