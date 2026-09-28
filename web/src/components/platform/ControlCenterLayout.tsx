import React, { useState } from 'react';
import {
  Shield,
  Activity,
  Layers,
  Workflow,
  Bot,
  Network,
  Package,
  FileCheck2,
  Share2,
  Lock,
  CheckCircle,
  FileCode,
  FileText,
  AlertOctagon,
  LogOut,
  ChevronDown,
  Scale,
  Cloud,
  Smartphone,
  ExternalLink,
  Search,
  Bell
} from 'lucide-react';
import { Workspace, WorkspaceType, GlobalKillSwitch } from '../../types/platform';
import { User } from 'firebase/auth';

interface ControlCenterLayoutProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  onSelectWorkspace: (ws: Workspace) => void;
  activeNav: string;
  onSelectNav: (nav: string) => void;
  killSwitch: GlobalKillSwitch;
  onToggleKillSwitch: () => void;
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  pendingApprovalsCount: number;
  children: React.ReactNode;
}

export const ControlCenterLayout: React.FC<ControlCenterLayoutProps> = ({
  currentWorkspace,
  workspaces,
  onSelectWorkspace,
  activeNav,
  onSelectNav,
  killSwitch,
  onToggleKillSwitch,
  currentUser,
  onSignIn,
  onSignOut,
  pendingApprovalsCount,
  children
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const getWorkspaceColor = (type: WorkspaceType) => {
    switch (type) {
      case 'legal':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'engineering':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'marketing':
        return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
      case 'business':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'research':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'agents', label: 'Agents', icon: Bot },
    { id: 'knowledge', label: 'Knowledge Graph', icon: Network },
    { id: 'skills', label: 'Skills Registry', icon: Package },
    { id: 'ingestion', label: 'Files & Ingestion', icon: FileCode },
    { id: 'integrations', label: 'Integrations', icon: Share2 },
    { id: 'approvals', label: 'Approvals', icon: Lock, badge: pendingApprovalsCount },
    { id: 'verification', label: 'Verification', icon: FileCheck2 },
    { id: 'audit', label: 'Audit Log', icon: Shield },
    { id: 'legal-suite', label: 'PA Legal Portal', icon: Scale, highlight: true }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Global Command Ribbon */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
            {/* Brand identity */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold tracking-wider text-base sm:text-lg text-white">
                    UNIFIED AI OPERATING PLATFORM
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/30">
                    SPEC-001 — SPEC-007
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-serif-body">
                  Canonical Skills &bull; Bounded Agents &bull; Controlled Workflows &bull; Zero-Trust Audit
                </p>
              </div>
            </div>

            {/* Top Controls: Workspace Context, Kill Switch, Auth */}
            <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
              {/* Workspace Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${getWorkspaceColor(
                    currentWorkspace.type
                  )}`}
                >
                  <span className="capitalize">{currentWorkspace.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {showWorkspaceMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in duration-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 block">
                      Switch Domain Workspace:
                    </span>
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          onSelectWorkspace(ws);
                          setShowWorkspaceMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                          ws.id === currentWorkspace.id ? 'bg-slate-800/80 font-bold text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        <div>
                          <span className="block">{ws.name}</span>
                          <span className="text-[10px] text-slate-500 capitalize">{ws.type} Domain</span>
                        </div>
                        {ws.id === currentWorkspace.id && <CheckCircle className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SPEC-007 Global Kill Switch Pill */}
              <button
                type="button"
                onClick={onToggleKillSwitch}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition shadow-xs ${
                  killSwitch.globalAutonomousActionsDisabled
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 hover:bg-rose-900'
                    : 'bg-emerald-950/80 border-emerald-500 text-emerald-300 hover:bg-emerald-900'
                }`}
                title="Toggle Global Autonomous Action Kill Switch (SPEC-007)"
              >
                <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                <span className="font-mono text-[11px]">
                  {killSwitch.globalAutonomousActionsDisabled ? 'KILL SWITCH: ENGAGED' : 'AUTONOMY: LIVE'}
                </span>
              </button>

              {/* User Identity / Google Auth */}
              {currentUser ? (
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="User" className="w-5 h-5 rounded-full border border-amber-400" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                      {currentUser.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <span className="font-medium text-slate-200 truncate max-w-[100px]">
                    {currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0]}
                  </span>
                  <button onClick={onSignOut} className="text-slate-400 hover:text-rose-400 p-0.5" title="Sign out">
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onSignIn}
                  className="px-2.5 py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Primary Navigation Ribbon (SPEC-006) */}
        <div className="bg-slate-950 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-2 scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectNav(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      item.highlight
                        ? isActive
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                        : isActive
                        ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Safety Notice Banner if Kill Switch is Engaged (SPEC-007) */}
      {killSwitch.globalAutonomousActionsDisabled && (
        <div className="bg-rose-950/70 border-b border-rose-900/60 px-4 py-2 text-rose-200 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>SPEC-007 Policy Guard Active:</strong> {killSwitch.emergencyNotice}
              </span>
            </div>
            <span className="font-mono text-[10px] text-rose-400 shrink-0 hidden sm:inline">
              MUTATIONS BLOCKED &bull; READ/VERIFY ALLOWED
            </span>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Control Center Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span className="font-display font-semibold text-slate-300">
              Unified AI Operating Platform &bull; Production Architecture
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5 text-blue-400" />
              Cloud Run + Supabase + Vercel
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Mobile MFA Ready
            </span>
            <span>&bull;</span>
            <span>Zero-Trust ABAC</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
