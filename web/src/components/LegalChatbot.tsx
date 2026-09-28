import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Bot,
  User as UserIcon,
  Sparkles,
  Volume2,
  VolumeX,
  Globe,
  Brain,
  Zap,
  Bookmark,
  Check,
  FileText,
  ExternalLink,
  RefreshCw,
  Scale
} from 'lucide-react';
import { ChatMessage } from '../types';
import { playPcmAudio, stopCurrentAudio } from '../utils/audioPlayer';

interface LegalChatbotProps {
  selectedCounty: string;
  onSaveMessageToBriefcase: (title: string, content: string) => void;
  onExportToGoogleDoc?: (title: string, content: string) => void;
  accessToken: string | null;
}

const STARTER_PROMPTS = [
  {
    label: '16 Custody Factors',
    text: 'What are the 16 mandatory statutory factors under 23 Pa.C.S. § 5328 and how do PA courts weigh child safety?'
  },
  {
    label: 'Parental School Records',
    text: 'Can a Pennsylvania school district refuse report cards or IEP records to a non-custodial father under 23 Pa.C.S. § 5336 and FERPA?'
  },
  {
    label: 'Truancy SAIC Defense',
    text: 'A school filed a summary criminal citation for truancy under 24 P.S. § 13-1327 without holding a SAIC conference. Is that legal?'
  },
  {
    label: '2-Year Discovery Rule',
    text: 'How does the Discovery Rule toll the 2-year statute of limitations under 42 Pa.C.S. § 5524 in PA civil litigation?'
  },
  {
    label: 'Parental Kidnapping (§ 2904)',
    text: 'What constitutes interference with child custody under 18 Pa.C.S. § 2904 and what are the codified statutory defenses?'
  }
];

export const LegalChatbot: React.FC<LegalChatbotProps> = ({
  selectedCounty,
  onSaveMessageToBriefcase,
  onExportToGoogleDoc,
  accessToken
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Greetings. I am your Pennsylvania Legal Practice Co-Counsel, specializing in the Commonwealth of Pennsylvania Consolidated Statutes (Title 18 Crimes, Title 23 Domestic Relations, Title 24 Education, Title 42 Judicial Code), the Pennsylvania Rules of Civil Procedure (Pa.R.C.P.), and local county judicial rules (including ${selectedCounty} County).\n\nAsk any question regarding child custody litigation, records access rights, compulsory school attendance, educator reporting, statute of limitations calculations, or court filing prerequisites.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash'
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelTier, setModelTier] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [enableThinking, setEnableThinking] = useState(false);
  const [enableSearch, setEnableSearch] = useState(true);
  const [narratingId, setNarratingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/legal-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({ role: m.role, text: m.text })),
          modelTier,
          enableThinking: enableThinking && modelTier === 'gemini-3.1-pro-preview',
          enableSearch: enableSearch && modelTier === 'gemini-3.5-flash',
          county: `${selectedCounty} County`
        })
      });

      if (!response.ok) {
        throw new Error(`Chat request failed (${response.status})`);
      }

      const data = await response.json();

      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply || 'No response returned from legal engine.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        isThinking: data.isThinking,
        groundingSources: data.groundingSources
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: `Error contacting Pennsylvania Legal Co-Counsel engine: ${err.message || 'Please check network connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTtsNarration = async (msgId: string, text: string) => {
    if (narratingId === msgId) {
      stopCurrentAudio();
      setNarratingId(null);
      return;
    }

    try {
      setNarratingId(msgId);
      const response = await fetch('/api/legal-ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName: 'Kore',
          style: 'Authoritative, articulate Pennsylvania legal counselor'
        })
      });

      if (!response.ok) {
        throw new Error('TTS narration failed.');
      }

      const data = await response.json();
      if (data.audioData) {
        await playPcmAudio(data.audioData, () => {
          setNarratingId(null);
        });
      }
    } catch (err: any) {
      console.error(err);
      setNarratingId(null);
    }
  };

  const handleSaveToBriefcase = (msg: ChatMessage) => {
    onSaveMessageToBriefcase(`Co-Counsel Advisory: ${msg.text.slice(0, 45)}...`, msg.text);
    setSavedId(msg.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col h-[750px]">
      {/* Chat Header & Model Controls */}
      <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold text-white flex items-center gap-2">
              Pennsylvania Legal Co-Counsel
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                {selectedCounty} County Court
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Multi-turn advisory grounded in 18 Pa.C.S., 23 Pa.C.S., 24 P.S., and 42 Pa.C.S.
            </p>
          </div>
        </div>

        {/* Model Tier & Capabilities Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Model Selection */}
          <select
            aria-label="Select AI Reasoning Model"
            value={modelTier}
            onChange={(e: any) => {
              setModelTier(e.target.value);
              if (e.target.value !== 'gemini-3.1-pro-preview') setEnableThinking(false);
              if (e.target.value !== 'gemini-3.5-flash') setEnableSearch(false);
            }}
            className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="gemini-3.5-flash">gemini-3.5-flash (General & Search)</option>
            <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Deep Jurisprudence)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast Procedural)</option>
          </select>

          {/* High Thinking Toggle */}
          {modelTier === 'gemini-3.1-pro-preview' && (
            <button
              onClick={() => setEnableThinking(!enableThinking)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                enableThinking
                  ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Enable High Thinking Level (Deep Legal Reasoning)"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Thinking: HIGH</span>
            </button>
          )}

          {/* Search Grounding Toggle */}
          {modelTier === 'gemini-3.5-flash' && (
            <button
              onClick={() => setEnableSearch(!enableSearch)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                enableSearch
                  ? 'bg-blue-900/60 border-blue-500 text-blue-200'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Ground responses with Google Search for recent PA case precedents"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Search Grounding</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-xs ${
                  isUser
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 text-amber-400 border border-slate-800'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1.5 max-w-[85%]">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-[13px] font-serif-body leading-relaxed whitespace-pre-wrap shadow-xs ${
                    isUser
                      ? 'bg-amber-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-none'
                  }`}
                >
                  {message.text}
                </div>

                {/* Grounding Source Badges (if present) */}
                {message.groundingSources && message.groundingSources.length > 0 && (
                  <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-xs">
                    <span className="font-semibold text-blue-900 flex items-center gap-1 text-[11px]">
                      <Globe className="w-3 h-3 text-blue-600" />
                      Google Search Grounding Authorities:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {message.groundingSources.map((source, sIdx) => (
                        <a
                          key={sIdx}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-blue-200 text-blue-700 hover:text-blue-900 text-[10px] font-sans hover:underline"
                        >
                          <span className="truncate max-w-[180px]">{source.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata & Message Actions Bar */}
                <div
                  className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                    isUser ? 'justify-end' : 'justify-between'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{message.timestamp}</span>
                    {message.modelUsed && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 font-mono text-[9px] text-slate-600">
                        {message.modelUsed}
                      </span>
                    )}
                    {message.isThinking && (
                      <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">
                        Thinking: HIGH
                      </span>
                    )}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-1.5">
                      {/* TTS Narration Button */}
                      <button
                        onClick={() => handleTtsNarration(message.id, message.text)}
                        className={`p-1 rounded hover:bg-slate-200 text-slate-600 transition flex items-center gap-1 ${
                          narratingId === message.id ? 'text-amber-600 bg-amber-50 font-semibold' : ''
                        }`}
                        title="Narrate with Gemini 3.8 Flash TTS"
                      >
                        {narratingId === message.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 animate-pulse text-amber-600" />
                            <span className="text-[10px]">Playing...</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Listen</span>
                          </>
                        )}
                      </button>

                      {/* Export to Google Docs */}
                      {onExportToGoogleDoc && (
                        <button
                          onClick={() => onExportToGoogleDoc('PA Legal Research Advisory', message.text)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-600 transition flex items-center gap-1"
                          title="Export advisory to Google Docs"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-[10px]">Doc</span>
                        </button>
                      )}

                      {/* Save to Research Briefcase */}
                      <button
                        onClick={() => handleSaveToBriefcase(message)}
                        className="p-1 rounded hover:bg-slate-200 text-slate-600 transition flex items-center gap-1"
                        title="Save response to research briefcase"
                      >
                        {savedId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[10px]">{savedId === message.id ? 'Saved' : 'Save'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 max-w-md">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-600 font-serif-body">
              {enableThinking && modelTier === 'gemini-3.1-pro-preview'
                ? 'Engaging High Thinking mode to evaluate PA statutory factors & appellate jurisprudence...'
                : enableSearch && modelTier === 'gemini-3.5-flash'
                ? 'Grounded search: checking recent Pennsylvania court opinions & statutes...'
                : 'Formulating legal counsel advice...'}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Suggested:</span>
        {STARTER_PROMPTS.map((starter, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(starter.text)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap transition"
          >
            {starter.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask your PA Legal Co-Counsel a question, citation query, or factual scenario..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Co-Counsel</span>
          </button>
        </form>
      </div>
    </div>
  );
};
