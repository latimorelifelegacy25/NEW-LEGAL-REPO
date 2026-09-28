import React from 'react';
import {
  Scale,
  BookOpen,
  FileText,
  Clock,
  Sparkles,
  Shield,
  Bookmark,
  Quote,
  MessageSquare,
  FolderSync,
  LogOut,
  User as UserIcon,
  Layers,
  Briefcase,
  FolderLock
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: 'matter' | 'statutes' | 'ai-advisor' | 'chatbot' | 'pleadings' | 'sol' | 'cases' | 'workspace' | 'bookmarks' | 'platform';
  setActiveTab: (tab: 'matter' | 'statutes' | 'ai-advisor' | 'chatbot' | 'pleadings' | 'sol' | 'cases' | 'workspace' | 'bookmarks' | 'platform') => void;
  selectedCounty: string;
  setSelectedCounty: (county: string) => void;
  savedCount: number;
  onOpenQuickCitation: () => void;
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isAuthenticating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCounty,
  setSelectedCounty,
  savedCount,
  onOpenQuickCitation,
  currentUser,
  onSignIn,
  onSignOut,
  isAuthenticating
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Banner with Jurisdiction Bar & Auth */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo and Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold tracking-wider text-lg text-white">
                  COMMONWEALTH OF PENNSYLVANIA
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                  Legal Code & Practice Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 font-serif-body">
                Consolidated Statutes (Title 18, 23, 24, 42) &bull; Civil Rules &bull; Court Conciliation &bull; Google Workspace
              </p>
            </div>
          </div>

          {/* Controls: Jurisdiction, Quick Cite, Google Sign In, Briefcase */}
          <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
            {/* County Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-md px-2.5 py-1.5 text-xs text-slate-300">
              <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                id="jurisdiction-county-select"
                aria-label="Select Pennsylvania Judicial County Jurisdiction"
                value={selectedCounty}
                onChange={(e) => setSelectedCounty(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="Schuylkill" className="bg-slate-900 text-white">
                  Schuylkill (21st Judicial Dist.)
                </option>
                <option value="Statewide" className="bg-slate-900 text-white">
                  Statewide PA (Appellate & Supreme)
                </option>
                <option value="Philadelphia" className="bg-slate-900 text-white">
                  Philadelphia (1st Judicial Dist.)
                </option>
                <option value="Allegheny" className="bg-slate-900 text-white">
                  Allegheny (5th Judicial Dist.)
                </option>
                <option value="Berks" className="bg-slate-900 text-white">
                  Berks (23rd Judicial Dist.)
                </option>
                <option value="Luzerne" className="bg-slate-900 text-white">
                  Luzerne (11th Judicial Dist.)
                </option>
              </select>
            </div>

            {/* Quick Cite Floating Opener */}
            <button
              id="header-quick-citation-btn"
              onClick={onOpenQuickCitation}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-750 hover:text-amber-200 hover:border-amber-500/40 transition-all shadow-xs"
              title="Open Bluebook Quick Citation Tool"
            >
              <Quote className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">Quick Cite</span>
            </button>

            {/* Google Authentication Control with Material Google Sign-in */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-md px-2.5 py-1 text-xs">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-5 h-5 rounded-full border border-amber-400"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 text-amber-400" />
                )}
                <span className="font-medium text-slate-200 truncate max-w-[120px]">
                  {currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0]}
                </span>
                <button
                  onClick={onSignOut}
                  className="p-1 text-slate-400 hover:text-rose-400 transition"
                  title="Sign out of Google and Firebase"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="header-google-signin-btn"
                onClick={onSignIn}
                disabled={isAuthenticating}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-800 hover:bg-slate-100 rounded-md text-xs font-semibold shadow-xs transition active:scale-98 disabled:opacity-60"
                title="Sign in with Google to enable Google Workspace & Firestore persistence"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isAuthenticating ? 'Connecting...' : 'Sign in'}</span>
              </button>
            )}

            {/* Research Briefcase Toggle */}
            <button
              id="header-bookmarks-toggle-btn"
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-all ${
                activeTab === 'bookmarks'
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
              }`}
              title="View Bookmarked Citations & Cloud Briefcase"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="font-medium">My Research</span>
              {savedCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-slate-950 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            <button
              id="nav-tab-matter"
              onClick={() => setActiveTab('matter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'matter'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-amber-400 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/40'
              }`}
            >
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Matter S-1214-2026</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                SAC
              </span>
            </button>

            <button
              id="nav-tab-statutes"
              onClick={() => setActiveTab('statutes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'statutes'
                  ? 'bg-amber-600/90 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Statutes & Codes</span>
            </button>

            <button
              id="nav-tab-ai-advisor"
              onClick={() => setActiveTab('ai-advisor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'ai-advisor'
                  ? 'bg-amber-600/90 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Fact Diagnostic</span>
            </button>

            <button
              id="nav-tab-chatbot"
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'chatbot'
                  ? 'bg-amber-600/90 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Legal Co-Counsel</span>
            </button>

            <button
              id="nav-tab-pleadings"
              onClick={() => setActiveTab('pleadings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'pleadings'
                  ? 'bg-amber-600/90 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Pleadings Drafter</span>
            </button>

            <button
              id="nav-tab-sol"
              onClick={() => setActiveTab('sol')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'sol'
                  ? 'bg-amber-600/90 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Limitation Periods</span>
            </button>

            <button
              id="nav-tab-cases"
              onClick={() => setActiveTab('cases')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'cases'
                  ? 'bg-amber-600/90 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>Precedents & Guidance</span>
            </button>

            <button
              id="nav-tab-workspace"
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'workspace'
                  ? 'bg-amber-600/90 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <FolderSync className="w-4 h-4 text-emerald-400" />
              <span>Google Workspace Hub</span>
            </button>

            <button
              id="nav-tab-platform"
              onClick={() => setActiveTab('platform')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'platform'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 border border-amber-500/30'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>AI Operating Platform</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
