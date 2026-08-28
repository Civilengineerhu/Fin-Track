import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface DbUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  createdAt: string;
}

interface DbRepayment {
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

interface DbTransaction {
  id: string;
  workspaceId: string;
  type: 'income' | 'expense' | 'investment' | 'lent' | 'borrowed';
  category: string;
  amount: number;
  date: string;
  description: string;
  sourceOrPerson?: string;
  paymentMethod?: string;
  platformOrInstitution?: string;
  investmentType?: string;
  expectedRepaymentDate?: string;
  repaymentStatus?: 'pending' | 'partially_repaid' | 'settled';
  repaidAmount?: number;
  repayments?: DbRepayment[];
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

interface DbWorkspaceMember {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
  joinedAt: string;
}

interface DbWorkspace {
  id: string;
  name: string;
  description?: string;
  currency: string;
  code: string;
  ownerId: string;
  members: DbWorkspaceMember[];
  initialFund: number;
  initialFundComment?: string;
  initialFundDate?: string;
  initialFundSource?: string;
  createdAt: string;
  updatedAt: string;
}

interface DbInvite {
  id: string;
  workspaceId: string;
  workspaceName: string;
  inviterEmail: string;
  inviterName: string;
  invitedEmail: string;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

interface DbRecurringRule {
  id: string;
  workspaceId: string;
  type: 'income' | 'expense' | 'investment' | 'lent' | 'borrowed';
  category: string;
  amount: number;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  startDate: string;
  nextDueDate: string;
  endDate?: string;
  paymentMethod?: string;
  sourceOrPerson?: string;
  platformOrInstitution?: string;
  investmentType?: string;
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

interface DbMonthlyBudget {
  id: string;
  workspaceId: string;
  month: string; // "YYYY-MM"
  categoryBudgets: Record<string, number>;
  totalLimit?: number;
  alertsEnabled: boolean;
  thresholdPercentage: number;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: DbUser[];
  workspaces: DbWorkspace[];
  invites: DbInvite[];
  transactions: DbTransaction[];
  recurringRules?: DbRecurringRule[];
  budgets?: DbMonthlyBudget[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function getInitialDb(): DatabaseSchema {
  const defaultUsers: DbUser[] = [
    {
      id: "usr_ashish",
      name: "Ashish Chaturvedi",
      email: "itsashishchaturvedi@gmail.com",
      password: "password123",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr_sarah",
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.com",
      password: "password123",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
    },
    {
      id: "usr_alex",
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      password: "password123",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
    }
  ];

  const defaultWorkspaces: DbWorkspace[] = [
    {
      id: "ws_personal",
      name: "Personal Finances",
      description: "My personal daily expenses, investments, salary, and savings tracker",
      currency: "₹",
      code: "MYFIN-101",
      ownerId: "usr_ashish",
      members: [
        {
          userId: "usr_ashish",
          name: "Ashish Chaturvedi",
          email: "itsashishchaturvedi@gmail.com",
          role: "owner",
          joinedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        },
      ],
      initialFund: 150000,
      initialFundComment: "Opening savings balance from HDFC Bank Account",
      initialFundDate: new Date(Date.now() - 25 * 86400000).toISOString().split('T')[0],
      initialFundSource: "HDFC Savings Account",
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "ws_shared_flat",
      name: "Apartment 4B Shared Budget",
      description: "Shared household expenses, groceries, utilities, and joint investments with roommates",
      currency: "₹",
      code: "FLAT-402",
      ownerId: "usr_ashish",
      members: [
        {
          userId: "usr_ashish",
          name: "Ashish Chaturvedi",
          email: "itsashishchaturvedi@gmail.com",
          role: "owner",
          joinedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        },
        {
          userId: "usr_sarah",
          name: "Sarah Jenkins",
          email: "sarah.jenkins@example.com",
          role: "member",
          joinedAt: new Date(Date.now() - 18 * 86400000).toISOString(),
        },
        {
          userId: "usr_alex",
          name: "Alex Rivera",
          email: "alex.rivera@example.com",
          role: "member",
          joinedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        },
      ],
      initialFund: 30000,
      initialFundComment: "Joint apartment reserve pool fund",
      initialFundDate: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
      initialFundSource: "Shared Pool Contribution",
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const now = new Date();
  const formatD = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString().split('T')[0];

  const defaultTransactions: DbTransaction[] = [
    // Income
    {
      id: "tx_1",
      workspaceId: "ws_personal",
      type: "income",
      category: "salary",
      amount: 125000,
      date: formatD(22),
      description: "₹1,25,000 received as monthly salary from Tech Innovations Pvt Ltd",
      sourceOrPerson: "Tech Innovations Pvt Ltd",
      paymentMethod: "Bank Transfer",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 22 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 22 * 86400000).toISOString(),
    },
    {
      id: "tx_2",
      workspaceId: "ws_personal",
      type: "income",
      category: "other_income",
      amount: 18500,
      date: formatD(14),
      description: "Freelance UI/UX design project milestone payout for client SparkLab",
      sourceOrPerson: "SparkLab Studio",
      paymentMethod: "UPI",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 14 * 86400000).toISOString(),
    },
    {
      id: "tx_3",
      workspaceId: "ws_personal",
      type: "income",
      category: "other_income",
      amount: 3200,
      date: formatD(7),
      description: "Quarterly dividend & fixed deposit interest credited to bank",
      sourceOrPerson: "ICICI Direct & HDFC",
      paymentMethod: "Net Banking",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
    },

    // Expenses
    {
      id: "tx_4",
      workspaceId: "ws_personal",
      type: "expense",
      category: "groceries",
      amount: 4650,
      date: formatD(20),
      description: "₹4,650 spent on monthly organic groceries & pantry essentials at Nature's Basket",
      sourceOrPerson: "Nature's Basket",
      paymentMethod: "Credit Card",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
    },
    {
      id: "tx_5",
      workspaceId: "ws_personal",
      type: "expense",
      category: "groceries",
      amount: 1420,
      date: formatD(5),
      description: "₹1,420 spent on fresh fruits, dairy, and veggies at Reliance Smart",
      sourceOrPerson: "Reliance Smart",
      paymentMethod: "UPI",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    },
    {
      id: "tx_6",
      workspaceId: "ws_personal",
      type: "expense",
      category: "travel",
      amount: 3800,
      date: formatD(16),
      description: "Flight ticket fuel charge and metro smart card auto-topup for commute",
      sourceOrPerson: "IndiGo / Metro Rail",
      paymentMethod: "Credit Card",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 16 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 16 * 86400000).toISOString(),
    },
    {
      id: "tx_7",
      workspaceId: "ws_personal",
      type: "expense",
      category: "education",
      amount: 5999,
      date: formatD(12),
      description: "Annual full-stack engineering certification course & ebook subscriptions",
      sourceOrPerson: "O'Reilly & Coursera",
      paymentMethod: "Credit Card",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
    },
    {
      id: "tx_8",
      workspaceId: "ws_personal",
      type: "expense",
      category: "health",
      amount: 2450,
      date: formatD(9),
      description: "Routine health checkup, vitamins & preventive wellness medicines",
      sourceOrPerson: "Apollo Pharmacy",
      paymentMethod: "UPI",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 9 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 9 * 86400000).toISOString(),
    },
    {
      id: "tx_9",
      workspaceId: "ws_personal",
      type: "expense",
      category: "hobby",
      amount: 3200,
      date: formatD(4),
      description: "Photography gear filter kit and outdoor hiking trail entrance pass",
      sourceOrPerson: "Decathlon & Amazon",
      paymentMethod: "Debit Card",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
    {
      id: "tx_10",
      workspaceId: "ws_personal",
      type: "expense",
      category: "miscellaneous",
      amount: 1850,
      date: formatD(2),
      description: "Home internet broadband bill and streaming cloud subscriptions",
      sourceOrPerson: "Airtel Fiber",
      paymentMethod: "UPI",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },

    // Investments
    {
      id: "tx_11",
      workspaceId: "ws_personal",
      type: "investment",
      category: "sip",
      investmentType: "sip",
      amount: 15000,
      date: formatD(18),
      description: "Monthly automated SIP in Parag Parikh Flexi Cap & Nifty 50 Index Fund",
      platformOrInstitution: "Groww",
      paymentMethod: "Net Banking",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 18 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 18 * 86400000).toISOString(),
    },
    {
      id: "tx_12",
      workspaceId: "ws_personal",
      type: "investment",
      category: "mutual_funds",
      investmentType: "mutual_funds",
      amount: 10000,
      date: formatD(15),
      description: "Lump-sum allocation in Mirae Asset Large Cap Fund during market dip",
      platformOrInstitution: "Zerodha Coin",
      paymentMethod: "Net Banking",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
    },
    {
      id: "tx_13",
      workspaceId: "ws_personal",
      type: "investment",
      category: "stocks",
      investmentType: "stocks",
      amount: 22000,
      date: formatD(10),
      description: "Blue-chip technology & renewable energy equities accumulation",
      platformOrInstitution: "Zerodha Kite",
      paymentMethod: "UPI",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
    {
      id: "tx_14",
      workspaceId: "ws_personal",
      type: "investment",
      category: "fixed_deposits",
      investmentType: "fixed_deposits",
      amount: 25000,
      date: formatD(6),
      description: "1-year compounding fixed deposit booked at 7.75% p.a. interest",
      platformOrInstitution: "HDFC Bank",
      paymentMethod: "Bank Transfer",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 6 * 86400000).toISOString(),
    },

    // Money Lent
    {
      id: "tx_15",
      workspaceId: "ws_personal",
      type: "lent",
      category: "money_lent",
      amount: 8000,
      date: formatD(19),
      description: "₹8,000 lent to Rahul Sharma for medical urgency and vehicle repair",
      sourceOrPerson: "Rahul Sharma",
      expectedRepaymentDate: formatD(-15), // future date
      repaymentStatus: "partially_repaid",
      repaidAmount: 3000,
      repayments: [
        {
          id: "rep_1",
          amount: 3000,
          date: formatD(3),
          comment: "Initial partial repayment sent via GPay",
          addedBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
          createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
        }
      ],
      paymentMethod: "UPI",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 19 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      id: "tx_16",
      workspaceId: "ws_personal",
      type: "lent",
      category: "money_lent",
      amount: 5000,
      date: formatD(11),
      description: "₹5,000 lent to Vikram Patel for laptop repair",
      sourceOrPerson: "Vikram Patel",
      expectedRepaymentDate: formatD(-20),
      repaymentStatus: "pending",
      repaidAmount: 0,
      repayments: [],
      paymentMethod: "UPI",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 11 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 11 * 86400000).toISOString(),
    },

    // Money Borrowed
    {
      id: "tx_17",
      workspaceId: "ws_personal",
      type: "borrowed",
      category: "money_borrowed",
      amount: 10000,
      date: formatD(17),
      description: "₹10,000 borrowed from Amit Verma for urgent equipment purchase before invoice clearance",
      sourceOrPerson: "Amit Verma",
      expectedRepaymentDate: formatD(-10),
      repaymentStatus: "partially_repaid",
      repaidAmount: 5000,
      repayments: [
        {
          id: "rep_2",
          amount: 5000,
          date: formatD(1),
          comment: "Repaid ₹5,000 after client project invoice received",
          addedBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
          createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
        }
      ],
      paymentMethod: "UPI",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 17 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },

    // Shared Apartment transactions
    {
      id: "tx_flat_1",
      workspaceId: "ws_shared_flat",
      type: "expense",
      category: "groceries",
      amount: 6800,
      date: formatD(12),
      description: "Monthly bulk kitchen groceries, cooking oil, spices & cleaning supplies for Apartment 4B",
      sourceOrPerson: "DMart Mega Store",
      paymentMethod: "UPI",
      createdBy: { id: "usr_sarah", name: "Sarah Jenkins", email: "sarah.jenkins@example.com" },
      createdAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 12 * 86400000).toISOString(),
    },
    {
      id: "tx_flat_2",
      workspaceId: "ws_shared_flat",
      type: "expense",
      category: "miscellaneous",
      amount: 2400,
      date: formatD(8),
      description: "High-speed 300Mbps fiber internet & water purifier maintenance bill",
      sourceOrPerson: "Airtel / Urban Company",
      paymentMethod: "Credit Card",
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 8 * 86400000).toISOString(),
    },
    {
      id: "tx_flat_3",
      workspaceId: "ws_shared_flat",
      type: "income",
      category: "other_income",
      amount: 15000,
      date: formatD(15),
      description: "Sarah's monthly contribution to shared apartment expenditure pool",
      sourceOrPerson: "Sarah Jenkins",
      paymentMethod: "UPI",
      createdBy: { id: "usr_sarah", name: "Sarah Jenkins", email: "sarah.jenkins@example.com" },
      createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
    },
    {
      id: "tx_flat_4",
      workspaceId: "ws_shared_flat",
      type: "income",
      category: "other_income",
      amount: 15000,
      date: formatD(15),
      description: "Alex's monthly contribution to shared apartment expenditure pool",
      sourceOrPerson: "Alex Rivera",
      paymentMethod: "UPI",
      createdBy: { id: "usr_alex", name: "Alex Rivera", email: "alex.rivera@example.com" },
      createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
    }
  ];

  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const defaultRecurringRules: DbRecurringRule[] = [
    {
      id: "rec_1",
      workspaceId: "ws_personal",
      type: "income",
      category: "salary",
      amount: 125000,
      description: "Monthly Tech Innovations Salary Credit",
      frequency: "monthly",
      interval: 1,
      startDate: formatD(22),
      nextDueDate: formatD(-8), // 8 days from now
      paymentMethod: "Bank Transfer",
      sourceOrPerson: "Tech Innovations Pvt Ltd",
      isActive: true,
      autoProcess: true,
      generatedCount: 1,
      lastGeneratedDate: formatD(22),
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 22 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 22 * 86400000).toISOString(),
    },
    {
      id: "rec_2",
      workspaceId: "ws_personal",
      type: "investment",
      category: "sip",
      investmentType: "sip",
      amount: 15000,
      description: "Automated Monthly Mutual Fund SIP (Parag Parikh Flexi Cap)",
      frequency: "monthly",
      interval: 1,
      startDate: formatD(18),
      nextDueDate: formatD(-12),
      paymentMethod: "Net Banking",
      platformOrInstitution: "Groww",
      isActive: true,
      autoProcess: true,
      generatedCount: 1,
      lastGeneratedDate: formatD(18),
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 18 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 18 * 86400000).toISOString(),
    },
    {
      id: "rec_3",
      workspaceId: "ws_personal",
      type: "expense",
      category: "miscellaneous",
      amount: 1850,
      description: "Airtel High-Speed Fiber Internet & WiFi Bill",
      frequency: "monthly",
      interval: 1,
      startDate: formatD(2),
      nextDueDate: formatD(-28),
      paymentMethod: "UPI",
      sourceOrPerson: "Airtel Fiber",
      isActive: true,
      autoProcess: true,
      generatedCount: 1,
      lastGeneratedDate: formatD(2),
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
    {
      id: "rec_4",
      workspaceId: "ws_personal",
      type: "expense",
      category: "groceries",
      amount: 2000,
      description: "Weekly Organic Vegetables & Dairy replenishment",
      frequency: "weekly",
      interval: 1,
      startDate: formatD(5),
      nextDueDate: formatD(-2), // due in 2 days
      paymentMethod: "UPI",
      sourceOrPerson: "Nature's Basket",
      isActive: true,
      autoProcess: true,
      generatedCount: 1,
      lastGeneratedDate: formatD(5),
      createdBy: { id: "usr_ashish", name: "Ashish Chaturvedi", email: "itsashishchaturvedi@gmail.com" },
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    }
  ];

  const defaultBudgets: DbMonthlyBudget[] = [
    {
      id: "bgt_1",
      workspaceId: "ws_personal",
      month: currentMonthStr,
      categoryBudgets: {
        groceries: 10000,
        travel: 6000,
        education: 8000,
        health: 4000,
        hobby: 4000,
        miscellaneous: 3500,
      },
      totalLimit: 35500,
      alertsEnabled: true,
      thresholdPercentage: 80,
      createdAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  return {
    users: defaultUsers,
    workspaces: defaultWorkspaces,
    invites: [],
    transactions: defaultTransactions,
    recurringRules: defaultRecurringRules,
    budgets: defaultBudgets,
  };
}

function computeNextDueDate(currentDueDateStr: string, frequency: string, interval = 1): string {
  const d = new Date(currentDueDateStr);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  
  if (frequency === 'daily') {
    d.setDate(d.getDate() + interval);
  } else if (frequency === 'weekly') {
    d.setDate(d.getDate() + 7 * interval);
  } else if (frequency === 'monthly') {
    d.setMonth(d.getMonth() + interval);
  } else if (frequency === 'yearly') {
    d.setFullYear(d.getFullYear() + interval);
  }
  return d.toISOString().split('T')[0];
}

function processRecurringRulesForWorkspace(db: DatabaseSchema, workspaceId: string): { generatedTxs: DbTransaction[]; updatedRules: DbRecurringRule[] } {
  if (!db.recurringRules) db.recurringRules = [];
  if (!db.transactions) db.transactions = [];

  const todayStr = new Date().toISOString().split('T')[0];
  const generatedTxs: DbTransaction[] = [];
  const updatedRules: DbRecurringRule[] = [];

  db.recurringRules.forEach((rule) => {
    if (rule.workspaceId !== workspaceId || !rule.isActive || !rule.autoProcess) return;

    // Safety counter to prevent infinite loop
    let loops = 0;
    while (rule.nextDueDate <= todayStr && rule.isActive && loops < 12) {
      loops++;
      const txDate = rule.nextDueDate;

      // Check if end date reached
      if (rule.endDate && txDate > rule.endDate) {
        rule.isActive = false;
        break;
      }

      // Create transaction instance
      const newTx: DbTransaction = {
        id: "tx_rec_" + Math.random().toString(36).substring(2, 9),
        workspaceId: rule.workspaceId,
        type: rule.type,
        category: rule.category,
        amount: rule.amount,
        date: txDate,
        description: `[Recurring - ${rule.frequency}] ${rule.description}`,
        sourceOrPerson: rule.sourceOrPerson,
        paymentMethod: rule.paymentMethod,
        platformOrInstitution: rule.platformOrInstitution,
        investmentType: rule.investmentType,
        tags: ["recurring", rule.frequency],
        createdBy: rule.createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.transactions.unshift(newTx);
      generatedTxs.push(newTx);

      rule.lastGeneratedDate = txDate;
      rule.generatedCount = (rule.generatedCount || 0) + 1;
      rule.nextDueDate = computeNextDueDate(rule.nextDueDate, rule.frequency, rule.interval || 1);
      rule.updatedAt = new Date().toISOString();
      updatedRules.push(rule);

      if (rule.endDate && rule.nextDueDate > rule.endDate) {
        rule.isActive = false;
      }
    }
  });

  return { generatedTxs, updatedRules };
}

function loadDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data: DatabaseSchema = JSON.parse(raw);
    if (!data.recurringRules) data.recurringRules = [];
    if (!data.budgets) data.budgets = [];
    return data;
  } catch (err) {
    console.error("Error reading database file, returning fallback initial data:", err);
    return getInitialDb();
  }
}

function saveDb(data: DatabaseSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database file:", err);
  }
}

// SSE Subscriber management
interface SseClient {
  id: string;
  workspaceId: string;
  res: Response;
}
let sseClients: SseClient[] = [];

function broadcastToWorkspace(workspaceId: string, eventType: string, payload: any) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach((client) => {
    if (client.workspaceId === workspaceId) {
      try {
        client.res.write(message);
      } catch (err) {
        console.error("Error sending SSE to client:", err);
      }
    }
  });
}

export async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // SSE endpoint for live multi-user synchronization
  app.get("/api/workspaces/:workspaceId/events", (req: Request, res: Response) => {
    const { workspaceId } = req.params;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const clientId = Math.random().toString(36).substring(2, 9);
    const newClient: SseClient = { id: clientId, workspaceId, res };
    sseClients.push(newClient);

    // Send initial connected event
    res.write(`event: connected\ndata: ${JSON.stringify({ status: "connected", clientId, workspaceId })}\n\n`);

    req.on("close", () => {
      sseClients = sseClients.filter((c) => c.id !== clientId);
    });
  });

  // Auth endpoints
  app.post("/api/auth/register", (req: Request, res: Response) => {
    const { name, email, password, avatar } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    const db = loadDb();
    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: "A user with this email already exists" });
    }

    const newUser: DbUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
    };

    // Create default workspace for new user
    const defaultWorkspace: DbWorkspace = {
      id: "ws_" + Math.random().toString(36).substring(2, 9),
      name: `${newUser.name}'s Finances`,
      description: "Personal daily income, expenses, SIP investments & tracking",
      currency: "₹",
      code: "FIN-" + Math.floor(1000 + Math.random() * 9000),
      ownerId: newUser.id,
      members: [
        {
          userId: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: "owner",
          avatar: newUser.avatar,
          joinedAt: new Date().toISOString(),
        }
      ],
      initialFund: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.workspaces.push(defaultWorkspace);
    saveDb(db);

    const { password: _, ...safeUser } = newUser;
    return res.json({ user: safeUser, defaultWorkspaceId: defaultWorkspace.id });
  });

  app.post("/api/auth/login", (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const db = loadDb();
    const normalizedEmail = email.toLowerCase().trim();
    const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  });

  app.post("/api/auth/forgot-password", (req: Request, res: Response) => {
    const { email, newPassword } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const db = loadDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: "No account found with this email" });
    }
    if (newPassword) {
      user.password = newPassword;
      saveDb(db);
      return res.json({ message: "Password updated successfully. You can now log in." });
    }
    return res.json({ message: "Password reset link and temporary security pin generated." });
  });

  app.get("/api/auth/demo-users", (_req: Request, res: Response) => {
    const db = loadDb();
    const safeUsers = db.users.map(({ password: _, ...u }) => u);
    return res.json({ users: safeUsers });
  });

  // Workspaces endpoints
  app.get("/api/workspaces", (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    const userEmail = (req.query.userEmail as string)?.toLowerCase();
    const db = loadDb();

    let userWorkspaces = db.workspaces;
    if (userId || userEmail) {
      userWorkspaces = db.workspaces.filter(
        (w) =>
          w.ownerId === userId ||
          w.members.some((m) => m.userId === userId || (userEmail && m.email.toLowerCase() === userEmail))
      );
    }
    return res.json({ workspaces: userWorkspaces });
  });

  app.post("/api/workspaces", (req: Request, res: Response) => {
    const { name, description, currency = "₹", initialFund = 0, initialFundComment, initialFundSource, initialFundDate, user } = req.body;
    if (!name || !user) {
      return res.status(400).json({ error: "Workspace name and user are required" });
    }

    const db = loadDb();
    const newWs: DbWorkspace = {
      id: "ws_" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      description: description?.trim() || "",
      currency: currency || "₹",
      code: "FIN-" + Math.floor(1000 + Math.random() * 9000),
      ownerId: user.id,
      members: [
        {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: "owner",
          avatar: user.avatar,
          joinedAt: new Date().toISOString(),
        }
      ],
      initialFund: Number(initialFund) || 0,
      initialFundComment: initialFundComment?.trim(),
      initialFundSource: initialFundSource?.trim(),
      initialFundDate: initialFundDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.workspaces.push(newWs);
    saveDb(db);
    return res.json({ workspace: newWs });
  });

  app.get("/api/workspaces/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const db = loadDb();
    const ws = db.workspaces.find((w) => w.id === id);
    if (!ws) {
      return res.status(404).json({ error: "Workspace not found" });
    }
    return res.json({ workspace: ws });
  });

  app.put("/api/workspaces/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    const db = loadDb();
    const index = db.workspaces.findIndex((w) => w.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const updated = {
      ...db.workspaces[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    db.workspaces[index] = updated;
    saveDb(db);
    broadcastToWorkspace(id, "workspace_updated", { workspace: updated });
    return res.json({ workspace: updated });
  });

  // Invite user to workspace
  app.post("/api/workspaces/:id/invite", (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, role = "member", inviter } = req.body;
    if (!email || !inviter) {
      return res.status(400).json({ error: "Invited email and inviter are required" });
    }

    const db = loadDb();
    const ws = db.workspaces.find((w) => w.id === id);
    if (!ws) {
      return res.status(404).json({ error: "Workspace not found" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    // Check if already a member
    if (ws.members.some((m) => m.email.toLowerCase() === normalizedEmail)) {
      return res.status(400).json({ error: "This user is already a member of this workspace" });
    }

    // Auto-accept if user already exists or create invitation
    const existingUser = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (existingUser) {
      // Add directly as member and notify
      const newMember: DbWorkspaceMember = {
        userId: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: role as 'owner' | 'admin' | 'member',
        avatar: existingUser.avatar,
        joinedAt: new Date().toISOString(),
      };
      ws.members.push(newMember);
      ws.updatedAt = new Date().toISOString();
      saveDb(db);
      broadcastToWorkspace(id, "member_added", { member: newMember, workspace: ws });
      return res.json({ message: `${existingUser.name} (${existingUser.email}) has been added to the workspace!`, member: newMember, workspace: ws });
    }

    // Create pending invite
    const invite: DbInvite = {
      id: "inv_" + Math.random().toString(36).substring(2, 9),
      workspaceId: ws.id,
      workspaceName: ws.name,
      inviterEmail: inviter.email,
      inviterName: inviter.name,
      invitedEmail: normalizedEmail,
      role: role as 'owner' | 'admin' | 'member',
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    db.invites.push(invite);
    saveDb(db);
    return res.json({ message: `Invitation sent to ${normalizedEmail}`, invite });
  });

  // Join workspace via code
  app.post("/api/workspaces/join-by-code", (req: Request, res: Response) => {
    const { code, user } = req.body;
    if (!code || !user) {
      return res.status(400).json({ error: "Workspace code and user details are required" });
    }

    const db = loadDb();
    const ws = db.workspaces.find((w) => w.code.toUpperCase() === code.trim().toUpperCase());
    if (!ws) {
      return res.status(404).json({ error: "No workspace found with this code" });
    }

    if (ws.members.some((m) => m.userId === user.id || m.email.toLowerCase() === user.email.toLowerCase())) {
      return res.json({ workspace: ws, message: "You are already a member of this workspace" });
    }

    const newMember: DbWorkspaceMember = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: "member",
      avatar: user.avatar,
      joinedAt: new Date().toISOString(),
    };
    ws.members.push(newMember);
    ws.updatedAt = new Date().toISOString();
    saveDb(db);

    broadcastToWorkspace(ws.id, "member_added", { member: newMember, workspace: ws });
    return res.json({ workspace: ws, message: `Successfully joined ${ws.name}!` });
  });

  // Transactions Endpoints
  app.get("/api/workspaces/:id/transactions", (req: Request, res: Response) => {
    const { id } = req.params;
    const db = loadDb();
    const workspaceTxs = db.transactions.filter((t) => t.workspaceId === id);
    return res.json({ transactions: workspaceTxs });
  });

  app.post("/api/workspaces/:id/transactions", (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      type,
      category,
      amount,
      date,
      description,
      sourceOrPerson,
      paymentMethod,
      platformOrInstitution,
      investmentType,
      expectedRepaymentDate,
      tags,
      user,
    } = req.body;

    if (!type || !amount || !description || !user) {
      return res.status(400).json({ error: "Type, amount, description, and user are required" });
    }

    const db = loadDb();
    const newTx: DbTransaction = {
      id: "tx_" + Math.random().toString(36).substring(2, 9),
      workspaceId: id,
      type,
      category: category || (type === 'lent' ? 'money_lent' : type === 'borrowed' ? 'money_borrowed' : 'miscellaneous'),
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      description: description.trim(),
      sourceOrPerson: sourceOrPerson?.trim() || undefined,
      paymentMethod: paymentMethod || undefined,
      platformOrInstitution: platformOrInstitution?.trim() || undefined,
      investmentType: investmentType || (type === 'investment' ? category : undefined),
      expectedRepaymentDate: expectedRepaymentDate || undefined,
      repaymentStatus: (type === 'lent' || type === 'borrowed') ? 'pending' : undefined,
      repaidAmount: 0,
      repayments: [],
      tags: Array.isArray(tags) ? tags : [],
      createdBy: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.transactions.unshift(newTx);
    saveDb(db);

    broadcastToWorkspace(id, "transaction_created", { transaction: newTx });
    return res.json({ transaction: newTx });
  });

  app.put("/api/workspaces/:id/transactions/:txId", (req: Request, res: Response) => {
    const { id, txId } = req.params;
    const { user, ...updates } = req.body;
    const db = loadDb();

    const index = db.transactions.findIndex((t) => t.id === txId && t.workspaceId === id);
    if (index === -1) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const existing = db.transactions[index];
    const updated: DbTransaction = {
      ...existing,
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : existing.amount,
      updatedBy: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      } : existing.updatedBy,
      updatedAt: new Date().toISOString(),
    };

    db.transactions[index] = updated;
    saveDb(db);

    broadcastToWorkspace(id, "transaction_updated", { transaction: updated });
    return res.json({ transaction: updated });
  });

  app.delete("/api/workspaces/:id/transactions/:txId", (req: Request, res: Response) => {
    const { id, txId } = req.params;
    const db = loadDb();

    const index = db.transactions.findIndex((t) => t.id === txId && t.workspaceId === id);
    if (index === -1) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const deleted = db.transactions.splice(index, 1)[0];
    saveDb(db);

    broadcastToWorkspace(id, "transaction_deleted", { transactionId: txId, transaction: deleted });
    return res.json({ success: true, deletedId: txId });
  });

  // Repay endpoint for money lent / money borrowed
  app.post("/api/workspaces/:id/transactions/:txId/repay", (req: Request, res: Response) => {
    const { id, txId } = req.params;
    const { amount, date, comment, user } = req.body;
    if (!amount || !user) {
      return res.status(400).json({ error: "Repayment amount and user are required" });
    }

    const db = loadDb();
    const index = db.transactions.findIndex((t) => t.id === txId && t.workspaceId === id);
    if (index === -1) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const tx = db.transactions[index];
    const repayAmount = Number(amount);
    const currentRepaid = tx.repaidAmount || 0;
    const newRepaidTotal = currentRepaid + repayAmount;

    const repaymentRecord: DbRepayment = {
      id: "rep_" + Math.random().toString(36).substring(2, 9),
      amount: repayAmount,
      date: date || new Date().toISOString().split('T')[0],
      comment: comment?.trim() || "",
      addedBy: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      createdAt: new Date().toISOString(),
    };

    tx.repayments = [...(tx.repayments || []), repaymentRecord];
    tx.repaidAmount = newRepaidTotal;
    if (newRepaidTotal >= tx.amount) {
      tx.repaymentStatus = "settled";
    } else {
      tx.repaymentStatus = "partially_repaid";
    }
    tx.updatedBy = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };
    tx.updatedAt = new Date().toISOString();

    db.transactions[index] = tx;
    saveDb(db);

    broadcastToWorkspace(id, "transaction_updated", { transaction: tx, repayment: repaymentRecord });
    return res.json({ transaction: tx, repayment: repaymentRecord });
  });

  // Seed / Reset Workspace Demo Data
  app.post("/api/workspaces/:id/seed-demo", (req: Request, res: Response) => {
    const { id } = req.params;
    const { user } = req.body;
    const initial = getInitialDb();
    const db = loadDb();

    // Replace transactions for this workspace with rich sample transactions
    const filteredTxs = (db.transactions || []).filter((t) => t.workspaceId !== id);
    const demoTxs = initial.transactions.map((t) => ({
      ...t,
      id: "tx_" + Math.random().toString(36).substring(2, 9),
      workspaceId: id,
      createdBy: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : t.createdBy,
    }));

    db.transactions = [...demoTxs, ...filteredTxs];

    // Reseed recurring rules
    const filteredRules = (db.recurringRules || []).filter((r) => r.workspaceId !== id);
    const demoRules = (initial.recurringRules || []).map((r) => ({
      ...r,
      id: "rec_" + Math.random().toString(36).substring(2, 9),
      workspaceId: id,
      createdBy: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : r.createdBy,
    }));
    db.recurringRules = [...demoRules, ...filteredRules];

    // Reseed budgets
    const filteredBudgets = (db.budgets || []).filter((b) => b.workspaceId !== id);
    const demoBudgets = (initial.budgets || []).map((b) => ({
      ...b,
      id: "bgt_" + Math.random().toString(36).substring(2, 9),
      workspaceId: id,
    }));
    db.budgets = [...demoBudgets, ...filteredBudgets];

    saveDb(db);

    broadcastToWorkspace(id, "workspace_reseeded", { workspaceId: id });
    return res.json({ success: true, count: demoTxs.length });
  });

  // --- RECURRING RULES ENDPOINTS ---
  app.get("/api/workspaces/:id/recurring", (req: Request, res: Response) => {
    const { id } = req.params;
    const db = loadDb();
    
    // Auto-process due recurring rules on fetch
    const { generatedTxs } = processRecurringRulesForWorkspace(db, id);
    if (generatedTxs.length > 0) {
      saveDb(db);
      generatedTxs.forEach((tx) => broadcastToWorkspace(id, "transaction_created", { transaction: tx }));
      broadcastToWorkspace(id, "recurring_processed", { count: generatedTxs.length });
    }

    const rules = (db.recurringRules || []).filter((r) => r.workspaceId === id);
    return res.json({ recurringRules: rules, autoGeneratedCount: generatedTxs.length });
  });

  app.post("/api/workspaces/:id/recurring", (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      type,
      category,
      amount,
      description,
      frequency,
      interval = 1,
      startDate,
      nextDueDate,
      endDate,
      paymentMethod,
      sourceOrPerson,
      platformOrInstitution,
      investmentType,
      autoProcess = true,
      user,
    } = req.body;

    if (!type || !amount || !description || !frequency || !user) {
      return res.status(400).json({ error: "Type, amount, description, frequency, and user are required" });
    }

    const db = loadDb();
    if (!db.recurringRules) db.recurringRules = [];

    const start = startDate || new Date().toISOString().split('T')[0];
    const newRule: DbRecurringRule = {
      id: "rec_" + Math.random().toString(36).substring(2, 9),
      workspaceId: id,
      type,
      category: category || (type === 'lent' ? 'money_lent' : type === 'borrowed' ? 'money_borrowed' : 'miscellaneous'),
      amount: Number(amount),
      description: description.trim(),
      frequency,
      interval: Number(interval) || 1,
      startDate: start,
      nextDueDate: nextDueDate || start,
      endDate: endDate || undefined,
      paymentMethod: paymentMethod || undefined,
      sourceOrPerson: sourceOrPerson?.trim() || undefined,
      platformOrInstitution: platformOrInstitution?.trim() || undefined,
      investmentType: investmentType || (type === 'investment' ? category : undefined),
      isActive: true,
      autoProcess: autoProcess !== false,
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
    
    // Process immediately if nextDueDate is today or earlier
    const { generatedTxs } = processRecurringRulesForWorkspace(db, id);
    saveDb(db);

    broadcastToWorkspace(id, "recurring_created", { rule: newRule });
    if (generatedTxs.length > 0) {
      generatedTxs.forEach((tx) => broadcastToWorkspace(id, "transaction_created", { transaction: tx }));
    }

    return res.json({ rule: newRule, generatedTransactions: generatedTxs });
  });

  app.put("/api/workspaces/:id/recurring/:ruleId", (req: Request, res: Response) => {
    const { id, ruleId } = req.params;
    const { user, ...updates } = req.body;
    const db = loadDb();
    if (!db.recurringRules) db.recurringRules = [];

    const index = db.recurringRules.findIndex((r) => r.id === ruleId && r.workspaceId === id);
    if (index === -1) {
      return res.status(404).json({ error: "Recurring rule not found" });
    }

    const existing = db.recurringRules[index];
    const updated: DbRecurringRule = {
      ...existing,
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : existing.amount,
      updatedAt: new Date().toISOString(),
    };

    db.recurringRules[index] = updated;
    saveDb(db);

    broadcastToWorkspace(id, "recurring_updated", { rule: updated });
    return res.json({ rule: updated });
  });

  app.delete("/api/workspaces/:id/recurring/:ruleId", (req: Request, res: Response) => {
    const { id, ruleId } = req.params;
    const db = loadDb();
    if (!db.recurringRules) db.recurringRules = [];

    const index = db.recurringRules.findIndex((r) => r.id === ruleId && r.workspaceId === id);
    if (index === -1) {
      return res.status(404).json({ error: "Recurring rule not found" });
    }

    const deleted = db.recurringRules.splice(index, 1)[0];
    saveDb(db);

    broadcastToWorkspace(id, "recurring_deleted", { ruleId, rule: deleted });
    return res.json({ success: true, deletedId: ruleId });
  });

  app.post("/api/workspaces/:id/recurring/:ruleId/trigger", (req: Request, res: Response) => {
    const { id, ruleId } = req.params;
    const { user } = req.body;
    const db = loadDb();
    if (!db.recurringRules) db.recurringRules = [];

    const rule = db.recurringRules.find((r) => r.id === ruleId && r.workspaceId === id);
    if (!rule) {
      return res.status(404).json({ error: "Recurring rule not found" });
    }

    const txDate = new Date().toISOString().split('T')[0];
    const newTx: DbTransaction = {
      id: "tx_rec_" + Math.random().toString(36).substring(2, 9),
      workspaceId: id,
      type: rule.type,
      category: rule.category,
      amount: rule.amount,
      date: txDate,
      description: `[Recurring - ${rule.frequency}] ${rule.description}`,
      sourceOrPerson: rule.sourceOrPerson,
      paymentMethod: rule.paymentMethod,
      platformOrInstitution: rule.platformOrInstitution,
      investmentType: rule.investmentType,
      tags: ["recurring", rule.frequency, "manual-trigger"],
      createdBy: user || rule.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!db.transactions) db.transactions = [];
    db.transactions.unshift(newTx);

    rule.lastGeneratedDate = txDate;
    rule.generatedCount = (rule.generatedCount || 0) + 1;
    rule.nextDueDate = computeNextDueDate(rule.nextDueDate, rule.frequency, rule.interval || 1);
    rule.updatedAt = new Date().toISOString();

    saveDb(db);

    broadcastToWorkspace(id, "transaction_created", { transaction: newTx });
    broadcastToWorkspace(id, "recurring_updated", { rule });
    return res.json({ transaction: newTx, rule });
  });

  app.post("/api/workspaces/:id/recurring/process", (req: Request, res: Response) => {
    const { id } = req.params;
    const db = loadDb();
    const { generatedTxs, updatedRules } = processRecurringRulesForWorkspace(db, id);
    if (generatedTxs.length > 0) {
      saveDb(db);
      generatedTxs.forEach((tx) => broadcastToWorkspace(id, "transaction_created", { transaction: tx }));
      broadcastToWorkspace(id, "recurring_processed", { count: generatedTxs.length });
    }
    return res.json({ generatedCount: generatedTxs.length, transactions: generatedTxs, updatedRules });
  });

  // --- BUDGETS ENDPOINTS ---
  app.get("/api/workspaces/:id/budgets", (req: Request, res: Response) => {
    const { id } = req.params;
    const month = req.query.month as string;
    const db = loadDb();
    const workspaceBudgets = (db.budgets || []).filter((b) => b.workspaceId === id);

    if (month) {
      const budget = workspaceBudgets.find((b) => b.month === month);
      return res.json({ budget: budget || null });
    }
    return res.json({ budgets: workspaceBudgets });
  });

  app.post("/api/workspaces/:id/budgets", (req: Request, res: Response) => {
    const { id } = req.params;
    const { month, categoryBudgets = {}, totalLimit, alertsEnabled = true, thresholdPercentage = 80 } = req.body;
    if (!month) {
      return res.status(400).json({ error: "Month (YYYY-MM) is required" });
    }

    const db = loadDb();
    if (!db.budgets) db.budgets = [];

    const existingIndex = db.budgets.findIndex((b) => b.workspaceId === id && b.month === month);

    const calculatedTotalLimit = totalLimit !== undefined && totalLimit !== null 
      ? Number(totalLimit)
      : Object.values(categoryBudgets as Record<string, number>).reduce((sum: number, val) => sum + (Number(val) || 0), 0);

    if (existingIndex >= 0) {
      const updated: DbMonthlyBudget = {
        ...db.budgets[existingIndex],
        categoryBudgets,
        totalLimit: calculatedTotalLimit,
        alertsEnabled: alertsEnabled !== false,
        thresholdPercentage: Number(thresholdPercentage) || 80,
        updatedAt: new Date().toISOString(),
      };
      db.budgets[existingIndex] = updated;
      saveDb(db);
      broadcastToWorkspace(id, "budget_updated", { budget: updated });
      return res.json({ budget: updated });
    }

    const newBudget: DbMonthlyBudget = {
      id: "bgt_" + Math.random().toString(36).substring(2, 9),
      workspaceId: id,
      month,
      categoryBudgets,
      totalLimit: calculatedTotalLimit,
      alertsEnabled: alertsEnabled !== false,
      thresholdPercentage: Number(thresholdPercentage) || 80,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.budgets.push(newBudget);
    saveDb(db);

    broadcastToWorkspace(id, "budget_updated", { budget: newBudget });
    return res.json({ budget: newBudget });
  });

  app.delete("/api/workspaces/:id/budgets/:budgetId", (req: Request, res: Response) => {
    const { id, budgetId } = req.params;
    const db = loadDb();
    if (!db.budgets) db.budgets = [];

    const index = db.budgets.findIndex((b) => (b.id === budgetId || b.month === budgetId) && b.workspaceId === id);
    if (index === -1) {
      return res.status(404).json({ error: "Budget not found" });
    }

    const deleted = db.budgets.splice(index, 1)[0];
    saveDb(db);

    broadcastToWorkspace(id, "budget_deleted", { budgetId: deleted.id });
    return res.json({ success: true, deletedId: deleted.id });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        if (fs.existsSync(indexPath)) {
          let template = fs.readFileSync(indexPath, "utf-8");
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } else {
          next();
        }
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Finance Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
