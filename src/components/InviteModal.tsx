import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Users,
  Copy,
  Check,
  Mail,
  ShieldCheck,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { activeWorkspace, inviteMember, joinWorkspaceByCode } = useFinance();
  const { t } = useLanguage();

  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [joinCode, setJoinCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (activeWorkspace?.code) {
      navigator.clipboard.writeText(activeWorkspace.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!inviteEmail.trim()) return;

    setIsSubmitting(true);
    try {
      if (activeWorkspace) {
        await inviteMember(activeWorkspace.id, inviteEmail.trim());
        setStatusMsg({
          text: `${t('Add Member')}: ${inviteEmail}`,
          type: 'success',
        });
        setInviteEmail('');
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || t('Failed to save transaction.'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    if (!joinCode.trim()) return;

    setIsSubmitting(true);
    try {
      await joinWorkspaceByCode(joinCode.trim());
      setStatusMsg({ text: t('Workspaces'), type: 'success' });
      setJoinCode('');
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setStatusMsg({ text: err.message || t('Failed to save transaction.'), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        id="invite-members-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/80">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Add Member')}
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
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/20'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* Section 1: Share Code */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('Workspace')} Code
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('Members')}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-white">
                {activeWorkspace?.code}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-colors"
                id="copy-ws-code-btn"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? t('Active') : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Invite by Email */}
          <form onSubmit={handleInvite} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('Add Member')} ({t('Email')})
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  id="invite-email-input"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
                id="send-invite-btn"
              >
                {t('Add Member')}
              </button>
            </div>
          </form>

          {/* Section 3: Current Members List */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('Members')} ({activeWorkspace?.members.length})
            </label>
            <div className="divide-y divide-slate-100 dark:divide-slate-700 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {activeWorkspace?.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 text-xs bg-white dark:bg-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {member.name}
                        {member.id === user?.id && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">(You)</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">{member.email}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      member.role === 'owner'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {member.role === 'owner' ? t('Admin') : t('Members')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Join Another Workspace using Code */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('Workspaces')}
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('Workspaces')}
            </p>
            <form onSubmit={handleJoin} className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. MYFIN-101"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs uppercase font-mono font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  id="join-code-input"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-colors"
                id="join-by-code-btn"
              >
                <span>{t('Workspaces')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
