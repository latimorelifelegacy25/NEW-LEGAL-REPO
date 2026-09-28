/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatutesBrowser } from './components/StatutesBrowser';
import { LegalAIAdvisor } from './components/LegalAIAdvisor';
import { LegalChatbot } from './components/LegalChatbot';
import { PleadingBuilder } from './components/PleadingBuilder';
import { SolCalculator } from './components/SolCalculator';
import { CaseLawLibrary } from './components/CaseLawLibrary';
import { SavedResearchModal } from './components/SavedResearchModal';
import { WorkspaceHub } from './components/WorkspaceHub';
import { QuickCitationWidget } from './components/QuickCitationWidget';
import { WorkspaceConfirmModal } from './components/WorkspaceConfirmModal';
import { PlatformContainer } from './components/platform/PlatformContainer';
import { MatterWorkspace } from './components/MatterWorkspace';
import { StatuteItem, CaseGuidance, SavedResearchItem } from './types';
import {
  initAuth,
  googleSignIn,
  logout,
  testFirestoreConnection,
  fetchUserSavedItems,
  persistSavedItem,
  removePersistedItem,
  updatePersistedItemNotes,
  recordWorkspaceExport,
  getAccessToken
} from './services/firebase';
import {
  createGoogleDoc,
  uploadToGoogleDrive,
  createGoogleTask
} from './services/workspace';
import { User } from 'firebase/auth';
import { Scale, Shield, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'matter' | 'statutes' | 'ai-advisor' | 'chatbot' | 'pleadings' | 'sol' | 'cases' | 'workspace' | 'bookmarks' | 'platform'
  >('matter');
  const [selectedCounty, setSelectedCounty] = useState<string>('Schuylkill');
  const [statuteForAnalysis, setStatuteForAnalysis] = useState<StatuteItem | null>(null);
  const [prefillQuery, setPrefillQuery] = useState<string>('');
  const [prefillFacts, setPrefillFacts] = useState<string>('');

  // Quick Citation Floating Tool state
  const [isCitationWidgetOpen, setIsCitationWidgetOpen] = useState(false);
  const [citationTargetStatute, setCitationTargetStatute] = useState<StatuteItem | null>(null);

  // Authentication & Workspace Token state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Persistent Saved Items
  const [savedItems, setSavedItems] = useState<SavedResearchItem[]>(() => {
    try {
      const stored = localStorage.getItem('pa_legal_saved_items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Global Confirmation Modal for Workspace operations
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    summary: string;
    serviceName: 'Google Drive' | 'Google Docs' | 'Google Tasks' | 'Google Chat' | 'Google Forms' | 'Google Meet';
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    summary: '',
    serviceName: 'Google Docs',
    action: async () => {}
  });

  // Test Firestore on boot and initialize Firebase Auth listener
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = initAuth(
      async (user, token) => {
        setCurrentUser(user);
        if (token) setAccessToken(token);

        // Fetch cloud saved items from Firestore
        try {
          const cloudItems = await fetchUserSavedItems(user.uid);
          if (cloudItems && cloudItems.length > 0) {
            setSavedItems(cloudItems);
            setIsCloudSynced(true);
          }
        } catch (e) {
          console.warn('Could not load Firestore saved items on init:', e);
        }
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setIsCloudSynced(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Save to localStorage as local fallback
  useEffect(() => {
    try {
      localStorage.setItem('pa_legal_saved_items', JSON.stringify(savedItems));
    } catch (e) {
      console.warn('Failed to persist saved items:', e);
    }
  }, [savedItems]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        try {
          const cloudItems = await fetchUserSavedItems(result.user.uid);
          if (cloudItems && cloudItems.length > 0) {
            setSavedItems(cloudItems);
          } else {
            // Push any existing local items to Firestore
            for (const item of savedItems) {
              await persistSavedItem(result.user.uid, item);
            }
          }
          setIsCloudSynced(true);
        } catch (err) {
          console.warn('Failed to sync saved items with Firestore:', err);
        }
      }
    } catch (err) {
      console.error('Sign-in failed:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setAccessToken(null);
    setIsCloudSynced(false);
  };

  const isBookmarked = (id: string): boolean => {
    return savedItems.some((item) => item.id === id);
  };

  const handleToggleStatuteBookmark = async (statute: StatuteItem) => {
    if (isBookmarked(statute.id)) {
      setSavedItems((prev) => prev.filter((i) => i.id !== statute.id));
      if (currentUser?.uid) {
        removePersistedItem(currentUser.uid, statute.id).catch(console.warn);
      }
    } else {
      const newItem: SavedResearchItem = {
        id: statute.id,
        userId: currentUser?.uid,
        type: 'statute',
        title: `${statute.citation} - ${statute.heading}`,
        citation: statute.citation,
        savedAt: new Date().toLocaleDateString('en-US'),
        payload: statute
      };
      setSavedItems((prev) => [newItem, ...prev]);
      if (currentUser?.uid) {
        persistSavedItem(currentUser.uid, newItem).catch(console.warn);
      }
    }
  };

  const handleToggleCaseBookmark = async (caseItem: CaseGuidance) => {
    if (isBookmarked(caseItem.id)) {
      setSavedItems((prev) => prev.filter((i) => i.id !== caseItem.id));
      if (currentUser?.uid) {
        removePersistedItem(currentUser.uid, caseItem.id).catch(console.warn);
      }
    } else {
      const newItem: SavedResearchItem = {
        id: caseItem.id,
        userId: currentUser?.uid,
        type: 'case',
        title: caseItem.caseOrDocumentName,
        citation: caseItem.officialCitation,
        savedAt: new Date().toLocaleDateString('en-US'),
        payload: caseItem
      };
      setSavedItems((prev) => [newItem, ...prev]);
      if (currentUser?.uid) {
        persistSavedItem(currentUser.uid, newItem).catch(console.warn);
      }
    }
  };

  const handleSaveAnalysis = async (title: string, content: string) => {
    const newItem: SavedResearchItem = {
      id: `analysis-${Date.now()}`,
      userId: currentUser?.uid,
      type: 'analysis',
      title,
      savedAt: new Date().toLocaleDateString('en-US'),
      payload: content
    };
    setSavedItems((prev) => [newItem, ...prev]);
    if (currentUser?.uid) {
      persistSavedItem(currentUser.uid, newItem).catch(console.warn);
    }
  };

  const handleSavePleading = async (title: string, content: string) => {
    const newItem: SavedResearchItem = {
      id: `pleading-${Date.now()}`,
      userId: currentUser?.uid,
      type: 'pleading',
      title: `Draft: ${title}`,
      savedAt: new Date().toLocaleDateString('en-US'),
      payload: content
    };
    setSavedItems((prev) => [newItem, ...prev]);
    if (currentUser?.uid) {
      persistSavedItem(currentUser.uid, newItem).catch(console.warn);
    }
  };

  const handleSaveCitationSnippet = async (title: string, content: string) => {
    const newItem: SavedResearchItem = {
      id: `cite-${Date.now()}`,
      userId: currentUser?.uid,
      type: 'citation',
      title,
      savedAt: new Date().toLocaleDateString('en-US'),
      payload: content
    };
    setSavedItems((prev) => [newItem, ...prev]);
    if (currentUser?.uid) {
      persistSavedItem(currentUser.uid, newItem).catch(console.warn);
    }
  };

  const handleRemoveSavedItem = (id: string) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
    if (currentUser?.uid) {
      removePersistedItem(currentUser.uid, id).catch(console.warn);
    }
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setSavedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
    if (currentUser?.uid) {
      updatePersistedItemNotes(currentUser.uid, id, notes).catch(console.warn);
    }
  };

  const handleAnalyzeStatute = (statute: StatuteItem) => {
    setStatuteForAnalysis(statute);
    setPrefillQuery(`What are the legal elements and judicial application of ${statute.citation}?`);
    setPrefillFacts(statute.summary);
    setActiveTab('ai-advisor');
  };

  const handleDraftWithStatute = (statute: StatuteItem) => {
    setPrefillQuery(statute.heading);
    setPrefillFacts(
      `Relief sought under ${statute.citation} (${statute.heading}).\n\nStatutory Summary:\n${statute.summary}`
    );
    setActiveTab('pleadings');
  };

  const handleDraftPleadingFromAnalysis = (title: string, facts: string) => {
    setPrefillQuery(title);
    setPrefillFacts(facts);
    setActiveTab('pleadings');
  };

  const handleAnalyzeCaseTopic = (topic: string, citation: string) => {
    setPrefillQuery(
      `How does the holding in ${topic} (${citation}) apply to parental and institutional rights?`
    );
    setPrefillFacts(`Case analysis request regarding ${citation}.`);
    setActiveTab('ai-advisor');
  };

  const handleOpenQuickCitation = (statute?: StatuteItem) => {
    if (statute) {
      setCitationTargetStatute(statute);
    }
    setIsCitationWidgetOpen(true);
  };

  const handleCloseQuickCitation = () => {
    setIsCitationWidgetOpen(false);
  };

  // Google Docs Export with mandatory confirmation
  const handleExportToGoogleDoc = (title: string, content: string) => {
    if (!accessToken) {
      handleSignIn();
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Export to Google Docs',
      description: `Create a new Google Document named "${title}" in your Google account?`,
      summary: `Document Title: ${title}\nContent Length: ${content.length} characters\nDestination: Google Docs`,
      serviceName: 'Google Docs',
      action: async () => {
        const token = await getAccessToken();
        if (!token) return;
        const result = await createGoogleDoc(token, title, content);
        if (currentUser?.uid) {
          await recordWorkspaceExport(currentUser.uid, {
            id: `doc-${Date.now()}`,
            service: 'docs',
            title,
            externalId: result.documentId,
            externalUrl: result.url,
            timestamp: new Date().toISOString()
          });
        }
        window.open(result.url, '_blank');
      }
    });
  };

  // Google Drive Save with mandatory confirmation
  const handleSaveToDrive = (title: string, content: string) => {
    if (!accessToken) {
      handleSignIn();
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Save to Google Drive',
      description: `Save text file "${title}.txt" to your Google Drive?`,
      summary: `Filename: ${title}.txt\nSize: ${content.length} bytes\nDestination: Root of Google Drive`,
      serviceName: 'Google Drive',
      action: async () => {
        const token = await getAccessToken();
        if (!token) return;
        const result = await uploadToGoogleDrive(token, `${title}.txt`, content, 'text/plain');
        if (currentUser?.uid) {
          await recordWorkspaceExport(currentUser.uid, {
            id: `drive-${Date.now()}`,
            service: 'drive',
            title: `${title}.txt`,
            externalId: result.id,
            externalUrl: result.webViewLink,
            timestamp: new Date().toISOString()
          });
        }
        if (result.webViewLink) window.open(result.webViewLink, '_blank');
      }
    });
  };

  // Google Tasks sync with mandatory confirmation
  const handleSyncTask = (title: string, notes: string, dueDate: string) => {
    if (!accessToken) {
      handleSignIn();
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Add Deadline to Google Tasks',
      description: `Schedule task "${title}" in your Google Tasks account?`,
      summary: `Title: ${title}\nDue Date: ${dueDate || 'Immediate'}\nNotes: ${notes}`,
      serviceName: 'Google Tasks',
      action: async () => {
        const token = await getAccessToken();
        if (!token) return;
        const res = await createGoogleTask(token, title, notes, dueDate);
        if (currentUser?.uid) {
          await recordWorkspaceExport(currentUser.uid, {
            id: `task-${Date.now()}`,
            service: 'tasks',
            title,
            externalId: res.id,
            timestamp: new Date().toISOString()
          });
        }
        alert(`Deadline added to Google Tasks: ${title}`);
      }
    });
  };

  // Keyboard shortcut listener (Ctrl+K or Alt+C for quick cite, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCitationWidgetOpen((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsCitationWidgetOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isCitationWidgetOpen) {
        setIsCitationWidgetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCitationWidgetOpen]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      <div role="status" className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950">Prototype: sample platform records are demonstrations. Matter documents loaded in the workspace remain in browser memory for this session. Do not rely on automated legal verification without checking source documents.</div>
      {activeTab === 'platform' ? (
        <PlatformContainer
          onReturnToLegalPortal={() => setActiveTab('statutes')}
          currentUser={currentUser}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          accessToken={accessToken}
          selectedCounty={selectedCounty}
        />
      ) : (
        <>
          {/* Top Header & Navigation */}
          <Header
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedCounty={selectedCounty}
            setSelectedCounty={setSelectedCounty}
            savedCount={savedItems.length}
            onOpenQuickCitation={() => handleOpenQuickCitation()}
            currentUser={currentUser}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
            isAuthenticating={isAuthenticating}
          />

          {/* Main Body Content Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {activeTab === 'matter' && (
              <MatterWorkspace
                currentUser={currentUser}
                onSignIn={handleSignIn}
                onNavigateToPAStatutes={() => setActiveTab('statutes')}
                onNavigateToPleadings={() => setActiveTab('pleadings')}
              />
            )}

            {activeTab === 'statutes' && (
              <StatutesBrowser
                onAnalyzeStatute={handleAnalyzeStatute}
                onDraftWithStatute={handleDraftWithStatute}
                onToggleBookmark={handleToggleStatuteBookmark}
                isBookmarked={isBookmarked}
                onOpenQuickCitation={handleOpenQuickCitation}
                onSaveToDrive={handleSaveToDrive}
                currentUser={currentUser}
                onSignIn={handleSignIn}
              />
            )}

            {activeTab === 'ai-advisor' && (
              <LegalAIAdvisor
                initialStatute={statuteForAnalysis}
                selectedCounty={selectedCounty}
                onDraftPleading={handleDraftPleadingFromAnalysis}
                onSaveAnalysis={handleSaveAnalysis}
                onExportToGoogleDoc={handleExportToGoogleDoc}
                onSaveToDrive={handleSaveToDrive}
                accessToken={accessToken}
              />
            )}

            {activeTab === 'chatbot' && (
              <LegalChatbot
                selectedCounty={selectedCounty}
                onSaveMessageToBriefcase={handleSaveAnalysis}
                onExportToGoogleDoc={handleExportToGoogleDoc}
                accessToken={accessToken}
              />
            )}

            {activeTab === 'pleadings' && (
              <PleadingBuilder
                selectedCounty={selectedCounty}
                onSavePleading={handleSavePleading}
                prefillQuery={prefillQuery}
                prefillFacts={prefillFacts}
                onExportToGoogleDoc={handleExportToGoogleDoc}
                onSaveToDrive={handleSaveToDrive}
                accessToken={accessToken}
              />
            )}

            {activeTab === 'sol' && (
              <SolCalculator
                onSyncTask={handleSyncTask}
                accessToken={accessToken}
              />
            )}

            {activeTab === 'cases' && (
              <CaseLawLibrary
                onToggleBookmark={handleToggleCaseBookmark}
                isBookmarked={isBookmarked}
                onAnalyzeTopic={handleAnalyzeCaseTopic}
              />
            )}

            {activeTab === 'workspace' && (
              <WorkspaceHub
                accessToken={accessToken}
                currentUser={currentUser}
                onSignIn={handleSignIn}
                selectedCounty={selectedCounty}
              />
            )}

            {activeTab === 'bookmarks' && (
              <SavedResearchModal
                savedItems={savedItems}
                onRemoveItem={handleRemoveSavedItem}
                onUpdateNotes={handleUpdateNotes}
                onExportToGoogleDoc={handleExportToGoogleDoc}
                onSaveToDrive={handleSaveToDrive}
                isCloudSynced={isCloudSynced}
              />
            )}
          </main>

          {/* Formal Legal Portal Footer */}
          <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-display font-semibold text-slate-200">
                    Pennsylvania Legal Reference, Research & Workspace Practice Portal
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Commonwealth of PA Statutory Repository
                  </span>
                  <span>&bull;</span>
                  <span>21st Judicial District ({selectedCounty} County)</span>
                  <span>&bull;</span>
                  <span>Unified Judicial System of Pennsylvania</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-serif-body text-slate-400 leading-relaxed">
                <p>
                  <strong>Disclaimer:</strong> This application is a specialized legal reference, research, and document-formatting system grounded in the Pennsylvania Consolidated Statutes (18 Pa.C.S., 23 Pa.C.S., 24 P.S., 42 Pa.C.S.), the Pennsylvania Code (22 Pa. Code), the Pennsylvania Rules of Civil Procedure (Pa.R.C.P.), and applicable local judicial district rules. Information presented herein is for legal research, educational, and clerical assistance purposes and does not establish an attorney-client relationship. Litigants should review specific local court administrative orders and consult qualified Pennsylvania legal counsel for representation.
                </p>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Floating Bluebook Quick Citation Tool */}
      <QuickCitationWidget
        initialStatute={citationTargetStatute}
        isOpen={isCitationWidgetOpen}
        onClose={handleCloseQuickCitation}
        onOpen={() => setIsCitationWidgetOpen(true)}
        onSaveToBriefcase={handleSaveCitationSnippet}
        onAnalyzeStatute={handleAnalyzeStatute}
      />

      {/* Mandatory User Confirmation Modal for Workspace operations */}
      <WorkspaceConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        affectedDataSummary={confirmModal.summary}
        serviceName={confirmModal.serviceName}
        onConfirm={async () => {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          await confirmModal.action();
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
