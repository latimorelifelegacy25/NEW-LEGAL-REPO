import React, { useState, useEffect } from 'react';
import {
  FolderSync,
  HardDrive,
  FileText,
  CheckSquare,
  MessageSquare,
  FormInput,
  Video,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Send,
  Link,
  Clock,
  Shield
} from 'lucide-react';
import {
  uploadToGoogleDrive,
  listGoogleDriveFiles,
  createGoogleDoc,
  createGoogleTask,
  listGoogleTasks,
  sendGoogleChatMessage,
  createGoogleForm,
  createGoogleMeetSpace,
  GoogleDriveFile,
  GoogleTaskResult
} from '../services/workspace';
import { recordWorkspaceExport, fetchWorkspaceExports } from '../services/firebase';
import { WorkspaceExportItem } from '../types';
import { WorkspaceConfirmModal } from './WorkspaceConfirmModal';

interface WorkspaceHubProps {
  accessToken: string | null;
  currentUser: any | null;
  onSignIn: () => void;
  selectedCounty: string;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  accessToken,
  currentUser,
  onSignIn,
  selectedCounty
}) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'docs' | 'tasks' | 'chat' | 'forms' | 'meet' | 'history'>('drive');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; url?: string } | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [customUploadTitle, setCustomUploadTitle] = useState('PA-Legal-Custody-Brief');
  const [customUploadContent, setCustomUploadContent] = useState(
    'PENNSYLVANIA LEGAL RESEARCH & JURISPRUDENCE MEMORANDUM\nCounty: Schuylkill County Court of Common Pleas\nGoverning Code: 23 Pa.C.S. § 5328 (16 Custody Factors)\n\nPrepared via PA Legal Portal.'
  );

  // Docs state
  const [docTitle, setDocTitle] = useState('Complaint for Custody - Verified Pleading');
  const [docContent, setDocContent] = useState(
    'IN THE COURT OF COMMON PLEAS OF SCHUYLKILL COUNTY, PENNSYLVANIA\nCIVIL DIVISION - FAMILY\n\nCOMPLAINT FOR CUSTODY UNDER 23 Pa.C.S. § 5328\n\n1. Plaintiff and Defendant are the biological and legal parents of the minor child.\n2. Best interests of the minor child will be advanced by awarding shared legal custody.\n\nRespectfully submitted.'
  );

  // Tasks state
  const [tasksList, setTasksList] = useState<GoogleTaskResult[]>([]);
  const [taskTitle, setTaskTaskTitle] = useState('File Exceptions to Schuylkill County Custody Conciliator Report');
  const [taskNotes, setTaskNotes] = useState('Strict 20-day deadline under Schuylkill Cnty. L.R.C.P. 1915.3(d) following conciliation conference.');
  const [taskDueDate, setTaskDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 20);
    return d.toISOString().split('T')[0];
  });

  // Chat state
  const [chatSpace, setChatSpace] = useState('');
  const [chatMessage, setChatMessage] = useState(`[Case Update] Custody conference scheduled in ${selectedCounty} County Court of Common Pleas. All 23 Pa.C.S. § 5328 factors prepared.`);

  // Forms state
  const [formTitle, setFormTitle] = useState('Pennsylvania Family Law & Child Custody Intake Questionnaire');
  const [formDesc, setFormDesc] = useState(`Confidential client intake for legal representation in ${selectedCounty} County Court of Common Pleas.`);

  // Meet state
  const [latestMeetUrl, setLatestMeetUrl] = useState<string | null>(null);
  const [latestMeetCode, setLatestMeetCode] = useState<string | null>(null);

  // Audit history
  const [exportHistory, setExportHistory] = useState<WorkspaceExportItem[]>([]);

  // Confirmation Modal state
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
    serviceName: 'Google Drive',
    action: async () => {}
  });

  // Load files when tab opened if token available
  useEffect(() => {
    if (accessToken) {
      if (activeTab === 'drive') loadDriveFiles();
      if (activeTab === 'tasks') loadTasks();
      if (activeTab === 'history' && currentUser?.uid) loadExportHistory();
    }
  }, [activeTab, accessToken]);

  const loadDriveFiles = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const files = await listGoogleDriveFiles(accessToken);
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Could not list drive files:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const items = await listGoogleTasks(accessToken);
      setTasksList(items);
    } catch (err: any) {
      console.warn('Could not list tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExportHistory = async () => {
    if (!currentUser?.uid) return;
    try {
      const history = await fetchWorkspaceExports(currentUser.uid);
      setExportHistory(history);
    } catch (e) {
      console.warn(e);
    }
  };

  // 1. Google Drive Upload Action with User Confirmation
  const promptDriveUpload = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Upload File to Google Drive',
      description: `Upload legal file "${customUploadTitle}.txt" to your Google Drive account?`,
      summary: `Filename: ${customUploadTitle}.txt\nType: Text/Document\nLength: ${customUploadContent.length} characters\nDestination: Personal Google Drive root`,
      serviceName: 'Google Drive',
      action: async () => {
        if (!accessToken) return;
        setIsLoading(true);
        setStatusMessage(null);
        try {
          const file = await uploadToGoogleDrive(
            accessToken,
            `${customUploadTitle}.txt`,
            customUploadContent,
            'text/plain'
          );

          if (currentUser?.uid) {
            await recordWorkspaceExport(currentUser.uid, {
              id: `drive-${Date.now()}`,
              service: 'drive',
              title: `${customUploadTitle}.txt`,
              externalId: file.id,
              externalUrl: file.webViewLink,
              timestamp: new Date().toISOString()
            });
          }

          setStatusMessage({
            type: 'success',
            text: `Successfully uploaded "${customUploadTitle}.txt" to Google Drive!`,
            url: file.webViewLink
          });
          loadDriveFiles();
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Drive upload failed.' });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // 2. Google Docs Creation with User Confirmation
  const promptDocCreate = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Create Document in Google Docs',
      description: `Generate a new document titled "${docTitle}" in your Google Docs account?`,
      summary: `Title: ${docTitle}\nContent length: ${docContent.length} characters\nFormat: Pleading & Practice Document with Pennsylvania footer`,
      serviceName: 'Google Docs',
      action: async () => {
        if (!accessToken) return;
        setIsLoading(true);
        setStatusMessage(null);
        try {
          const result = await createGoogleDoc(accessToken, docTitle, docContent);

          if (currentUser?.uid) {
            await recordWorkspaceExport(currentUser.uid, {
              id: `doc-${Date.now()}`,
              service: 'docs',
              title: docTitle,
              externalId: result.documentId,
              externalUrl: result.url,
              timestamp: new Date().toISOString()
            });
          }

          setStatusMessage({
            type: 'success',
            text: `Successfully created "${docTitle}" in Google Docs!`,
            url: result.url
          });
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Docs creation failed.' });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // 3. Google Task Creation with User Confirmation
  const promptTaskCreate = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Schedule Legal Deadline in Google Tasks',
      description: `Add deadline task "${taskTitle}" to your Google Tasks list?`,
      summary: `Task: ${taskTitle}\nDue Date: ${taskDueDate || 'No due date'}\nNotes: ${taskNotes}`,
      serviceName: 'Google Tasks',
      action: async () => {
        if (!accessToken) return;
        setIsLoading(true);
        setStatusMessage(null);
        try {
          const result = await createGoogleTask(accessToken, taskTitle, taskNotes, taskDueDate);

          if (currentUser?.uid) {
            await recordWorkspaceExport(currentUser.uid, {
              id: `task-${Date.now()}`,
              service: 'tasks',
              title: taskTitle,
              externalId: result.id,
              timestamp: new Date().toISOString()
            });
          }

          setStatusMessage({
            type: 'success',
            text: `Successfully added "${taskTitle}" to Google Tasks (Due: ${taskDueDate})!`
          });
          loadTasks();
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Task creation failed.' });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // 4. Google Chat Message with User Confirmation
  const promptChatMessage = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Send Message to Google Chat',
      description: `Post legal case update to your Google Chat space?`,
      summary: `Message Preview: "${chatMessage}"\nTarget Space: ${chatSpace || 'First authorized user space'}`,
      serviceName: 'Google Chat',
      action: async () => {
        if (!accessToken) return;
        setIsLoading(true);
        setStatusMessage(null);
        try {
          const result = await sendGoogleChatMessage(accessToken, chatSpace, chatMessage);

          if (currentUser?.uid) {
            await recordWorkspaceExport(currentUser.uid, {
              id: `chat-${Date.now()}`,
              service: 'chat',
              title: 'Case Update Message',
              externalId: result.name,
              timestamp: new Date().toISOString()
            });
          }

          setStatusMessage({
            type: 'success',
            text: 'Successfully sent legal matter update to Google Chat!'
          });
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Chat message failed.' });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // 5. Google Forms Creation with User Confirmation
  const promptFormCreate = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Generate Legal Questionnaire in Google Forms',
      description: `Create client intake questionnaire "${formTitle}" in your Google Forms account?`,
      summary: `Form Title: ${formTitle}\nDescription: ${formDesc}\nIncluded Items: Client Contact Info, Minor Children Ages, Relational Party, Existing Court Decrees, Relief Sought`,
      serviceName: 'Google Forms',
      action: async () => {
        if (!accessToken) return;
        setIsLoading(true);
        setStatusMessage(null);
        try {
          const questions = [
            { title: 'Full Legal Name of Client / Litigant', required: true },
            { title: 'Current County of Residence in Pennsylvania', required: true },
            { title: 'Name(s) and Date(s) of Birth of Minor Child(ren)', required: true },
            { title: 'Full Name and Current Address of Adverse / Other Parent', required: true },
            { title: 'Are there any existing custody orders, PFA decrees, or ChildLine reports?', required: true },
            { title: 'Detailed Factual Chronology and Relief Sought', required: true }
          ];

          const result = await createGoogleForm(accessToken, formTitle, formDesc, questions);

          if (currentUser?.uid) {
            await recordWorkspaceExport(currentUser.uid, {
              id: `form-${Date.now()}`,
              service: 'forms',
              title: formTitle,
              externalId: result.formId,
              externalUrl: result.responderUri,
              timestamp: new Date().toISOString()
            });
          }

          setStatusMessage({
            type: 'success',
            text: `Successfully created "${formTitle}" in Google Forms!`,
            url: result.responderUri
          });
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Forms creation failed.' });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // 6. Google Meet Creation with User Confirmation
  const promptMeetCreate = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Schedule Legal Consultation in Google Meet',
      description: 'Create an instant, secure Google Meet room for attorney-client consultation or custody conciliation prep?',
      summary: `Service: Google Meet REST API (meet.googleapis.com)\nJurisdiction: ${selectedCounty} County Court Preparation\nAccess: Secure Open Meeting Space`,
      serviceName: 'Google Meet',
      action: async () => {
        if (!accessToken) return;
        setIsLoading(true);
        setStatusMessage(null);
        try {
          const result = await createGoogleMeetSpace(accessToken);
          setLatestMeetUrl(result.meetingUri);
          setLatestMeetCode(result.meetingCode);

          if (currentUser?.uid) {
            await recordWorkspaceExport(currentUser.uid, {
              id: `meet-${Date.now()}`,
              service: 'meet',
              title: `Consultation (${result.meetingCode})`,
              externalId: result.meetingCode,
              externalUrl: result.meetingUri,
              timestamp: new Date().toISOString()
            });
          }

          setStatusMessage({
            type: 'success',
            text: `Google Meet space created: ${result.meetingCode}!`,
            url: result.meetingUri
          });
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Meet creation failed.' });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Introduction Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <FolderSync className="w-5 h-5 text-emerald-600" />
              Google Workspace Legal Operations Hub
            </h1>
            <p className="text-xs text-slate-500 font-serif-body mt-0.5">
              Directly synchronize court pleadings, legal research, statutory deadlines, client intake questionnaires, and conference spaces across Google Drive, Docs, Tasks, Chat, Forms, and Meet.
            </p>
          </div>

          {!accessToken && (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition shrink-0"
            >
              <span>Connect Google Account</span>
            </button>
          )}
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            {statusMessage.url && (
              <a
                href={statusMessage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded bg-white border border-emerald-300 text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 shadow-2xs"
              >
                <span>Open in Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Workspace Service Tabs */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'drive'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-4 h-4 text-blue-600" />
            <span>Google Drive</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'docs'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Google Docs</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'tasks'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>Google Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Google Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'forms'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FormInput className="w-4 h-4 text-purple-600" />
            <span>Google Forms</span>
          </button>

          <button
            onClick={() => setActiveTab('meet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'meet'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-4 h-4 text-rose-500" />
            <span>Google Meet</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Sync History</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {!accessToken ? (
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
              <Shield className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">Google Workspace Authorization Required</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-serif-body">
                Please sign in with your Google account using the button above to authorize Google Drive, Docs, Tasks, Chat, Forms, and Meet.
              </p>
              <button
                onClick={onSignIn}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                Sign In with Google
              </button>
            </div>
          ) : (
            <div>
              {/* 1. GOOGLE DRIVE TAB */}
              {activeTab === 'drive' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <HardDrive className="w-4 h-4 text-blue-600" />
                      Save Legal Dossier to Google Drive
                    </h3>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Filename</label>
                      <input
                        type="text"
                        value={customUploadTitle}
                        onChange={(e) => setCustomUploadTitle(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Content / Legal Payload</label>
                      <textarea
                        rows={7}
                        value={customUploadContent}
                        onChange={(e) => setCustomUploadContent(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>
                    <button
                      onClick={promptDriveUpload}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <HardDrive className="w-4 h-4" />}
                      <span>Save to Google Drive (with Confirmation)</span>
                    </button>
                  </div>

                  <div className="lg:col-span-7 bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Google Drive Files ({driveFiles.length})
                      </span>
                      <button
                        onClick={loadDriveFiles}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {driveFiles.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center font-serif-body">
                        No files listed or currently loading. Click "Save to Google Drive" to upload your first legal memorandum.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {driveFiles.map((f) => (
                          <div
                            key={f.id}
                            className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5 truncate">
                              <span className="font-semibold text-slate-900 block truncate">{f.name}</span>
                              <span className="text-[11px] text-slate-400 font-mono">{f.mimeType}</span>
                            </div>
                            {f.webViewLink && (
                              <a
                                href={f.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200 text-xs shrink-0 flex items-center gap-1"
                              >
                                <span>Open</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. GOOGLE DOCS TAB */}
              {activeTab === 'docs' && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Export Pleading or Legal Brief to Google Docs
                  </h3>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Document Title</label>
                    <input
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Pleading Text / Body</label>
                    <textarea
                      rows={10}
                      value={docContent}
                      onChange={(e) => setDocContent(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>
                  <button
                    onClick={promptDocCreate}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    <span>Create in Google Docs (with User Confirmation)</span>
                  </button>
                </div>
              )}

              {/* 3. GOOGLE TASKS TAB */}
              {activeTab === 'tasks' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                      Add Statutory Filing Deadline
                    </h3>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Task Title</label>
                      <input
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTaskTitle(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Due Date</label>
                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">Statutory Notes & Citations</label>
                      <textarea
                        rows={4}
                        value={taskNotes}
                        onChange={(e) => setTaskNotes(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-serif-body focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>
                    <button
                      onClick={promptTaskCreate}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      <span>Add to Google Tasks (with Confirmation)</span>
                    </button>
                  </div>

                  <div className="lg:col-span-7 bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Active Google Tasks ({tasksList.length})
                      </span>
                      <button
                        onClick={loadTasks}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {tasksList.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center font-serif-body">
                        No pending legal tasks found. Schedule limitation deadlines or conciliation filing dates above.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {tasksList.map((t) => (
                          <div
                            key={t.id}
                            className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900">{t.title}</span>
                              {t.due && (
                                <span className="font-mono text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  Due: {new Date(t.due).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {t.notes && <p className="text-slate-600 font-serif-body text-[11px]">{t.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. GOOGLE CHAT TAB */}
              {activeTab === 'chat' && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    Post Legal Case Briefing to Google Chat
                  </h3>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Space Name (Optional / Leave blank for first available space)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., spaces/XXXXXXXXX"
                      value={chatSpace}
                      onChange={(e) => setChatSpace(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Message Text</label>
                    <textarea
                      rows={5}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-serif-body focus:outline-none focus:border-emerald-500 leading-relaxed"
                    />
                  </div>
                  <button
                    onClick={promptChatMessage}
                    disabled={isLoading || !chatMessage.trim()}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Post to Google Chat Space (with User Confirmation)</span>
                  </button>
                </div>
              )}

              {/* 5. GOOGLE FORMS TAB */}
              {activeTab === 'forms' && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <FormInput className="w-4 h-4 text-purple-600" />
                    Generate Client Intake Form in Google Forms
                  </h3>
                  <p className="text-xs text-slate-500 font-serif-body">
                    Creates an official, shareable Google Form with pre-built questions for Pennsylvania family litigation, custody factors, adverse parties, and relevant court decrees.
                  </p>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Form Title</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Form Description</label>
                    <textarea
                      rows={3}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-serif-body focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    onClick={promptFormCreate}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FormInput className="w-4 h-4" />}
                    <span>Create Google Form (with Confirmation)</span>
                  </button>
                </div>
              )}

              {/* 6. GOOGLE MEET TAB */}
              {activeTab === 'meet' && (
                <div className="max-w-2xl mx-auto space-y-4 text-center py-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mx-auto">
                    <Video className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Schedule Legal Client Consultation in Google Meet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto font-serif-body">
                    Creates an instant, open Google Meet consultation space for trial prep, custody conciliation strategy, or client conferences.
                  </p>
                  <button
                    onClick={promptMeetCreate}
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs inline-flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                    <span>Create Google Meet Space (with Confirmation)</span>
                  </button>

                  {latestMeetUrl && (
                    <div className="mt-6 p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2 text-xs">
                      <span className="font-bold text-rose-900 block">Meeting Space Ready:</span>
                      <a
                        href={latestMeetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm font-bold text-rose-700 hover:underline flex items-center justify-center gap-1.5"
                      >
                        <span>{latestMeetUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <p className="text-[11px] text-slate-500 font-serif-body">
                        Meeting Code: {latestMeetCode}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 7. SYNC HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Google Workspace Export & Sync History
                    </h3>
                    <button
                      onClick={loadExportHistory}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {exportHistory.length === 0 ? (
                    <p className="text-xs text-slate-400 py-8 text-center font-serif-body">
                      No exports logged yet in this session. Export items to Drive, Docs, Tasks, or Forms to build your audit log.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                      {exportHistory.map((item) => (
                        <div key={item.id} className="p-3 bg-white flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span className="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 mr-2">
                              {item.service}
                            </span>
                            <span className="font-semibold text-slate-900">{item.title}</span>
                            <span className="text-[11px] text-slate-400 block">{item.timestamp}</span>
                          </div>
                          {item.externalUrl && (
                            <a
                              href={item.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs flex items-center gap-1"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mandatory User Confirmation Modal */}
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
        isLoading={isLoading}
      />
    </div>
  );
};
