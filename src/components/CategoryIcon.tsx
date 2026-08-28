import React from 'react';
import {
  Briefcase,
  ShoppingCart,
  Plane,
  GraduationCap,
  Repeat,
  PieChart,
  CandlestickChart,
  ShieldCheck,
  Gem,
  HeartPulse,
  Palette,
  Layers,
  HandCoins,
  Receipt,
  Landmark,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Flame,
  Building2,
} from 'lucide-react';
import { CATEGORY_META } from '../utils/formatters';

interface CategoryIconProps {
  category: string;
  type?: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  type,
  className = 'w-5 h-5',
  size = 20,
}) => {
  const meta = CATEGORY_META[category];

  const getIcon = () => {
    switch (category) {
      case 'salary':
        return <Briefcase size={size} />;
      case 'initial_fund':
        return <Landmark size={size} />;
      case 'other_income':
        return <TrendingUp size={size} />;
      case 'groceries':
        return <ShoppingCart size={size} />;
      case 'travel':
        return <Plane size={size} />;
      case 'education':
        return <GraduationCap size={size} />;
      case 'sip':
        return <Repeat size={size} />;
      case 'mutual_funds':
        return <PieChart size={size} />;
      case 'stocks':
        return <CandlestickChart size={size} />;
      case 'fixed_deposits':
        return <ShieldCheck size={size} />;
      case 'other_investments':
        return <Gem size={size} />;
      case 'health':
        return <HeartPulse size={size} />;
      case 'dharma':
      case 'dharma_expenses':
        return <Flame size={size} />;
      case 'rental':
      case 'rental_expenses':
        return <Building2 size={size} />;
      case 'hobby':
        return <Palette size={size} />;
      case 'miscellaneous':
        return <Layers size={size} />;
      case 'money_lent':
        return <HandCoins size={size} />;
      case 'money_borrowed':
        return <Receipt size={size} />;
      default:
        if (type === 'income') return <ArrowDownRight size={size} />;
        if (type === 'expense') return <ArrowUpRight size={size} />;
        if (type === 'investment') return <PieChart size={size} />;
        if (type === 'lent') return <HandCoins size={size} />;
        if (type === 'borrowed') return <Receipt size={size} />;
        return <Wallet size={size} />;
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl p-2.5 transition-transform hover:scale-105 ${
        meta?.bg || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
      } ${className}`}
      id={`cat-icon-${category || 'default'}`}
    >
      {getIcon()}
    </div>
  );
};
