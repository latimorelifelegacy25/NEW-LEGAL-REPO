import React, { useState, useMemo, useEffect, useRef } from 'react';
import { StatuteItem, LegalCategory, RecentSearchItem } from '../types';
import { PA_STATUTES } from '../data/paLawData';
import {
  Search,
  BookOpen,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  FileText,
  AlertCircle,
  ShieldAlert,
  Clock,
  Filter,
  Quote,
  Volume2,
  VolumeX,
  RefreshCw,
  HardDrive,
  History,
  X,
  Cloud,
  CheckCircle2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { playPcmAudio, stopCurrentAudio } from '../utils/audioPlayer';
import { User } from 'firebase/auth';
import {
  fetchRecentSearches,
  persistRecentSearch,
  removeRecentSearchDoc,
  clearAllRecentSearches
} from '../services/firebase';

interface StatutesBrowserProps {
  onAnalyzeStatute: (statute: StatuteItem) => void;
  onDraftWithStatute: (statute: StatuteItem) => void;
  onToggleBookmark: (statute: StatuteItem) => void;
  isBookmarked: (id: string) => boolean;
  onOpenQuickCitation?: (statute: StatuteItem) => void;
  onSaveToDrive?: (title: string, content: string) => void;
  currentUser?: User | null;
  onSignIn?: () => void;
}

export const StatutesBrowser: React.FC<StatutesBrowserProps> = ({
  onAnalyzeStatute,
  onDraftWithStatute,
  onToggleBookmark,
  isBookmarked,
  onOpenQuickCitation,
  onSaveToDrive,
  currentUser,
  onSignIn
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LegalCategory>('all');
  const [selectedStatute, setSelectedStatute] = useState<StatuteItem | null>(PA_STATUTES[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);

  // Search History Tracker State (stores up to last 5 searched statutes in Firestore)
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() => {
    try {
      const stored = localStorage.getItem('pa_legal_recent_searches');
      return stored ? JSON.parse(stored).slice(0, 5) : [];
    } catch {
      return [];
    }
  });
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync recent searches from Firestore when currentUser changes
  useEffect(() => {
    let isMounted = true;
    if (currentUser?.uid) {
      setIsSyncing(true);
      fetchRecentSearches(currentUser.uid)
        .then(async (cloudSearches) => {
          if (!isMounted) return;
          if (cloudSearches && cloudSearches.length > 0) {
            setRecentSearches(cloudSearches.slice(0, 5));
            try {
              localStorage.setItem('pa_legal_recent_searches', JSON.stringify(cloudSearches.slice(0, 5)));
            } catch {}
            setIsCloudSynced(true);
          } else {
            // Seed local searches to Firestore if cloud is fresh
            try {
              const local = localStorage.getItem('pa_legal_recent_searches');
              if (local) {
                const parsed: RecentSearchItem[] = JSON.parse(local).slice(0, 5);
                for (const item of parsed) {
                  await persistRecentSearch(currentUser.uid, item);
                }
                setIsCloudSynced(true);
              }
            } catch (err) {
              console.warn('Failed to seed local searches to Firestore:', err);
            }
          }
        })
        .catch((err) => {
          console.warn('Could not load recent searches from Firestore:', err);
        })
        .finally(() => {
          if (isMounted) setIsSyncing(false);
        });
    } else {
      setIsCloudSynced(false);
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const categories: { key: LegalCategory; label: string }[] = [
    { key: 'all', label: 'All PA Codes & Rules' },
    { key: 'crimes', label: 'Title 18 (Crimes Code)' },
    { key: 'domestic_relations', label: 'Title 23 (Custody & Domestic)' },
    { key: 'education', label: 'Title 24 (Public School Code & Ethics)' },
    { key: 'juvenile_matters', label: 'Chapter 63 (Child Protection)' },
    { key: 'civil_procedure', label: '42 Pa.C.S. & Civil Rules' },
    { key: 'local_rules', label: 'Schuylkill County Local Rules' },
    { key: 'ferpa', label: 'FERPA & Privacy' }
  ];

  const filteredStatutes = useMemo(() => {
    return PA_STATUTES.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        item.citation.toLowerCase().includes(q) ||
        item.heading.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.fullText.toLowerCase().includes(q) ||
        item.sectionNumber.toLowerCase().includes(q) ||
        item.titleNumber.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [searchTerm, selectedCategory]);

  // Core function to store search in Firestore and local state (max 5)
  const recordRecentSearch = async (
    queryText: string,
    statute?: StatuteItem | null,
    category?: LegalCategory,
    count?: number
  ) => {
    if (!queryText.trim() && !statute) return;
    const cleanQuery = queryText.trim() || statute?.citation || '';
    if (cleanQuery.length < 2) return;

    const searchId = `search_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newSearchItem: RecentSearchItem = {
      id: searchId,
      userId: currentUser?.uid,
      query: cleanQuery,
      statuteId: statute?.id,
      statuteCitation: statute?.citation,
      statuteHeading: statute?.heading,
      category: category || selectedCategory,
      searchedAt: new Date().toISOString(),
      resultsCount: count ?? (statute ? 1 : filteredStatutes.length)
    };

    setRecentSearches((prev) => {
      // Remove any existing entry with identical query or statuteId
      const filtered = prev.filter(
        (item) =>
          item.query.toLowerCase() !== cleanQuery.toLowerCase() &&
          (!statute || item.statuteId !== statute.id)
      );
      const updated = [newSearchItem, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('pa_legal_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Persist to Firestore if user is authenticated
    if (currentUser?.uid) {
      try {
        await persistRecentSearch(currentUser.uid, newSearchItem);
        setIsCloudSynced(true);
      } catch (err) {
        console.warn('Failed to store recent search in Firestore:', err);
      }
    }
  };

  // Debounced recording when typing in search input
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed || trimmed.length < 3) return;

    const timer = setTimeout(() => {
      const topMatch = filteredStatutes.length > 0 ? filteredStatutes[0] : null;
      recordRecentSearch(trimmed, topMatch, selectedCategory, filteredStatutes.length);
    }, 1200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = searchTerm.trim();
      if (trimmed) {
        const topMatch = filteredStatutes.length > 0 ? filteredStatutes[0] : null;
        recordRecentSearch(trimmed, topMatch, selectedCategory, filteredStatutes.length);
      }
    }
  };

  const handleSelectStatute = (statute: StatuteItem) => {
    stopCurrentAudio();
    setIsNarrating(false);
    setSelectedStatute(statute);

    // Record selected statute into recent search history
    recordRecentSearch(statute.citation, statute, statute.category, 1);
  };

  // Revisit a recent search topic
  const handleSelectRecentSearch = (item: RecentSearchItem) => {
    setSearchTerm(item.query);

    // Switch category if needed
    if (item.category && item.category !== 'all' && selectedCategory !== 'all' && selectedCategory !== item.category) {
      setSelectedCategory(item.category as LegalCategory);
    }

    // Direct selection if associated with a specific statute
    if (item.statuteId) {
      const target = PA_STATUTES.find((s) => s.id === item.statuteId);
      if (target) {
        stopCurrentAudio();
        setIsNarrating(false);
        setSelectedStatute(target);
        return;
      }
    }

    // Try finding by citation
    const byCitation = PA_STATUTES.find(
      (s) => s.citation.toLowerCase().includes(item.query.toLowerCase()) || item.query.toLowerCase().includes(s.citation.toLowerCase())
    );
    if (byCitation) {
      stopCurrentAudio();
      setIsNarrating(false);
      setSelectedStatute(byCitation);
    }
  };

  const handleRemoveRecentSearch = async (searchId: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item.id !== searchId);
      try {
        localStorage.setItem('pa_legal_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentUser?.uid) {
      removeRecentSearchDoc(currentUser.uid, searchId).catch(console.warn);
    }
  };

  const handleClearAllHistory = async () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('pa_legal_recent_searches');
    } catch {}

    if (currentUser?.uid) {
      clearAllRecentSearches(currentUser.uid).catch(console.warn);
    }
  };

  const handleCopyCitation = (citation: string, id: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleTts = async () => {
    if (!selectedStatute) return;
    if (isNarrating) {
      stopCurrentAudio();
      setIsNarrating(false);
      return;
    }

    setTtsLoading(true);
    try {
      const textToRead = `${selectedStatute.citation}. ${selectedStatute.heading}. Overview: ${selectedStatute.summary}. Essential Legal Elements: ${selectedStatute.elements.join('. ')}.`;
      const res = await fetch('/api/legal-ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToRead,
          voiceName: 'Kore',
          style: 'Formal, authoritative Pennsylvania legal reader'
        })
      });

      if (!res.ok) throw new Error('TTS request failed');
      const data = await res.json();
      if (data.audioData) {
        setIsNarrating(true);
        await playPcmAudio(data.audioData, () => setIsNarrating(false));
      }
    } catch (e) {
      console.warn('TTS playback error:', e);
      setIsNarrating(false);
    } finally {
      setTtsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              Pennsylvania Consolidated Statutes & Administrative Rules Explorer
            </h1>
            <p className="text-xs text-slate-500 font-serif-body mt-0.5">
              Full-text searchable statutory codes, criminal elements, custody standards, compulsory attendance, and procedural rules with Speech Narration.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              id="statute-search-input"
              type="text"
              placeholder="Search citation (§ 2904, § 5328), title, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {categories.map((cat) => {
            const count =
              cat.key === 'all'
                ? PA_STATUTES.length
                : PA_STATUTES.filter((s) => s.category === cat.key).length;
            return (
              <button
                key={cat.key}
                id={`filter-cat-${cat.key}`}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat.key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === cat.key
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search History Tracker (Last 5 Searched Statutes in Firestore) */}
        {recentSearches.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
                <History className="w-3.5 h-3.5 text-amber-600" />
                <span>Recent Searches:</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {recentSearches.map((item) => (
                  <div
                    key={item.id}
                    id={`recent-search-${item.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50/80 hover:bg-amber-100 text-amber-950 border border-amber-200/80 transition shadow-2xs group"
                  >
                    <button
                      onClick={() => handleSelectRecentSearch(item)}
                      className="flex items-center gap-1 text-left hover:underline"
                      title={`Revisit recent research: "${item.query}"`}
                    >
                      {item.statuteCitation ? (
                        <span className="font-mono font-bold text-amber-900 bg-amber-200/60 px-1 py-0.2 rounded text-[10px]">
                          {item.statuteCitation}
                        </span>
                      ) : (
                        <Clock className="w-3 h-3 text-amber-700/70" />
                      )}
                      <span className="truncate max-w-[130px] sm:max-w-[210px]">
                        {item.statuteHeading ? item.statuteHeading : item.query}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveRecentSearch(item.id);
                      }}
                      className="text-amber-700/50 hover:text-rose-600 rounded p-0.5 transition ml-0.5"
                      title="Remove from search history"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto text-[11px]">
              {isCloudSynced ? (
                <span
                  className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium flex items-center gap-1"
                  title="Search history safely stored in Firestore database"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Firestore Saved (5)</span>
                </span>
              ) : currentUser ? (
                <span className="text-slate-400 flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-slate-400 animate-pulse" />
                  <span>Syncing with Firestore...</span>
                </span>
              ) : (
                <button
                  onClick={onSignIn}
                  className="text-amber-700 hover:text-amber-800 underline font-medium flex items-center gap-1"
                  title="Sign in with Google to sync search history to Firestore"
                >
                  <Cloud className="w-3 h-3" />
                  <span>Sign in to sync</span>
                </button>
              )}
              <button
                onClick={handleClearAllHistory}
                className="text-slate-400 hover:text-slate-600 underline font-medium flex items-center gap-1 ml-1"
                title="Clear all recent search topics"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Left Column List, Right Column Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Statutes List Column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredStatutes.length} relevant sections</span>
            <span>Click section to review text</span>
          </div>
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredStatutes.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-medium text-slate-700">No statutes matched your search</p>
                <p className="text-xs text-slate-400">
                  Try searching for keywords like "custody", "truancy", "abuse", "attendance", or section numbers like "2904" or "5328".
                </p>
              </div>
            ) : (
              filteredStatutes.map((statute) => {
                const isSelected = selectedStatute?.id === statute.id;
                const bookmarked = isBookmarked(statute.id);
                return (
                  <div
                    key={statute.id}
                    id={`statute-card-${statute.id}`}
                    onClick={() => handleSelectStatute(statute)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-150 relative ${
                      isSelected
                        ? 'bg-amber-50/60 border-amber-500/80 ring-1 ring-amber-500/30 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {statute.citation}
                          </span>
                          {statute.gradeOrSeverity && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {statute.gradeOrSeverity.split(';')[0]}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                          {statute.heading}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {statute.titleNumber} &bull; {statute.chapterName || statute.titleName}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {onOpenQuickCitation && (
                          <button
                            id={`cite-btn-${statute.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenQuickCitation(statute);
                            }}
                            className="p-1.5 rounded-md text-xs text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Generate Bluebook Citation"
                          >
                            <Quote className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          id={`bookmark-btn-${statute.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(statute);
                          }}
                          className={`p-1.5 rounded-md text-xs transition ${
                            bookmarked
                              ? 'text-amber-600 bg-amber-100/70 hover:bg-amber-200'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={bookmarked ? 'Remove Bookmark' : 'Bookmark Section'}
                        >
                          {bookmarked ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-serif-body mt-2 line-clamp-2 leading-relaxed">
                      {statute.summary}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {statute.elements.length} Legal Elements Defined
                      </span>
                      <span className="text-amber-700 font-medium hover:underline">
                        View Code Details &rarr;
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Statute Full Detail Column */}
        <div className="lg:col-span-7">
          {selectedStatute ? (
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden sticky top-4">
              {/* Card Header with Actions */}
              <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded shadow-xs">
                        {selectedStatute.citation}
                      </span>
                      <span className="text-xs text-slate-300">
                        {selectedStatute.titleName}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-display font-bold text-white mt-1.5 leading-snug">
                      {selectedStatute.heading}
                    </h2>
                  </div>

                  {/* Actions Header */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {/* TTS Speech Narration */}
                    <button
                      onClick={handleToggleTts}
                      disabled={ttsLoading}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition ${
                        isNarrating
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                      }`}
                      title="Listen with Gemini 3.8 Flash TTS"
                    >
                      {ttsLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : isNarrating ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      <span>{ttsLoading ? 'Synthesizing...' : isNarrating ? 'Stop' : 'Listen (TTS)'}</span>
                    </button>

                    {onOpenQuickCitation && (
                      <button
                        id="detail-bluebook-cite-btn"
                        onClick={() => onOpenQuickCitation(selectedStatute)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-medium text-amber-300 flex items-center gap-1.5 transition"
                        title="Generate Bluebook Citation"
                      >
                        <Quote className="w-3.5 h-3.5 text-amber-400" />
                        <span>Bluebook</span>
                      </button>
                    )}

                    <button
                      id="detail-copy-citation-btn"
                      onClick={() => handleCopyCitation(selectedStatute.citation, selectedStatute.id)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-xs font-medium text-slate-200 flex items-center gap-1.5 transition"
                      title="Copy Official Citation to Clipboard"
                    >
                      {copiedId === selectedStatute.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      id="detail-bookmark-btn"
                      onClick={() => onToggleBookmark(selectedStatute)}
                      className={`p-1.5 rounded-md border text-xs transition ${
                        isBookmarked(selectedStatute.id)
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                      title="Bookmark this statute"
                    >
                      {isBookmarked(selectedStatute.id) ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold">Grading:</span>
                  <span className="text-slate-800 font-medium">
                    {selectedStatute.gradeOrSeverity || 'Statutory Civil Standard'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onSaveToDrive && (
                    <button
                      onClick={() =>
                        onSaveToDrive(
                          selectedStatute.citation.replace(/[\s§.]/g, '_'),
                          `${selectedStatute.citation} - ${selectedStatute.heading}\n\nSummary:\n${selectedStatute.summary}\n\nFull Text:\n${selectedStatute.fullText}`
                        )
                      }
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium transition"
                      title="Save statute dossier to Google Drive"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                      <span>Save to Drive</span>
                    </button>
                  )}

                  <button
                    id="btn-analyze-with-ai"
                    onClick={() => onAnalyzeStatute(selectedStatute)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze Code</span>
                  </button>

                  <button
                    id="btn-draft-with-statute"
                    onClick={() => onDraftWithStatute(selectedStatute)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Draft Pleading</span>
                  </button>
                </div>
              </div>

              {/* Statute Content Body */}
              <div className="p-6 space-y-6 max-h-[640px] overflow-y-auto">
                {/* Statutory Overview */}
                <div className="space-y-1.5">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                    Statutory Purpose & Executive Summary
                  </h4>
                  <p className="text-sm text-slate-800 font-serif-body leading-relaxed bg-amber-50/40 p-3.5 rounded-lg border border-amber-200/60">
                    {selectedStatute.summary}
                  </p>
                </div>

                {/* Statutory Text verbatim */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      Statutory Text (Commonwealth of Pennsylvania)
                    </h4>
                  </div>
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs sm:text-[13px] font-mono leading-relaxed whitespace-pre-wrap border border-slate-800 overflow-x-auto selection:bg-amber-500 selection:text-slate-950">
                    {selectedStatute.fullText}
                  </div>
                </div>

                {/* Elements Checklist */}
                <div className="space-y-2.5">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Essential Legal Elements to Establish
                  </h4>
                  <div className="space-y-2">
                    {selectedStatute.elements.map((el, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/70 text-xs text-slate-800"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[11px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="mt-0.5 leading-relaxed font-medium">{el}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Defenses & Exceptions (if any) */}
                {selectedStatute.defensesOrExceptions && selectedStatute.defensesOrExceptions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Statutory Defenses & Safe Harbor Exceptions
                    </h4>
                    <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {selectedStatute.defensesOrExceptions.map((def, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {def}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Statute of Limitations & Deadlines */}
                {selectedStatute.statuteOfLimitations && (
                  <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200/70 flex items-start gap-2 text-xs text-blue-950">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Applicable Limitation of Time: </span>
                      <span>{selectedStatute.statuteOfLimitations}</span>
                    </div>
                  </div>
                )}

                {/* Related Cases and Cross-References */}
                {selectedStatute.relatedAuthorities && selectedStatute.relatedAuthorities.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700">
                      Cross-References & Landmark Precedents
                    </h4>
                    <div className="space-y-2">
                      {selectedStatute.relatedAuthorities.map((rel, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span>{rel.title}</span>
                            <span className="font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                              {rel.citation}
                            </span>
                          </div>
                          <p className="text-slate-600 font-serif-body">{rel.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
              Select a statute from the list to view comprehensive text, elements, and case notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

