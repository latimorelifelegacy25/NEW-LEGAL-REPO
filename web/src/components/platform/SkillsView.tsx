import React, { useState } from 'react';
import {
  Package,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Tag,
  FolderGit2,
  Terminal,
  Cpu,
  ShieldCheck,
  Search
} from 'lucide-react';
import { CanonicalSkill } from '../../types/platform';

interface SkillsViewProps {
  skills: CanonicalSkill[];
}

export const SkillsView: React.FC<SkillsViewProps> = ({ skills }) => {
  const [selectedSkill, setSelectedSkill] = useState<CanonicalSkill>(skills[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSkills = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                Canonical Skills Registry (SPEC-001 & SPEC-002)
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-serif-body mt-1">
              Owns canonical skills, versioned bindings across runtimes, dependency discovery, and immutable file hashes.
            </p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 self-start sm:self-auto">
            Decoupled Runtimes: Gemini / Claude / Universal
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter canonical skills by name, domain, tools, or dependencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Grid: Skills List vs Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Skill Cards */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
          {filteredSkills.map((sk) => {
            const isSelected = selectedSkill.id === sk.id;
            return (
              <div
                key={sk.id}
                onClick={() => setSelectedSkill(sk)}
                className={`p-4 rounded-xl border cursor-pointer transition text-xs space-y-2 ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500/80 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100">{sk.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">v{sk.version}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-serif-body line-clamp-2">
                  {sk.description}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {sk.runtimeBindings.map((rt) => (
                    <span
                      key={rt}
                      className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[9px] uppercase"
                    >
                      {rt}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Skill Inspector */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          {selectedSkill ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{selectedSkill.name}</span>
                    <span className="text-xs font-mono text-amber-400">v{selectedSkill.version}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Category: {selectedSkill.category} &bull; Author: {selectedSkill.author}</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tests Passing</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Description</span>
                <p className="text-xs text-slate-300 font-serif-body leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedSkill.description}
                </p>
              </div>

              {/* Runtime Bindings & Tools */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px] block">Runtime Bindings</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedSkill.runtimeBindings.map((r) => (
                      <span key={r} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px] block">Required Tools</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedSkill.toolsRequired.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skill Files with SHA-256 Provenance (SPEC-002) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                  Canonical File Hashes (Immutable SHA-256):
                </span>
                <div className="space-y-1.5">
                  {selectedSkill.files.map((f) => (
                    <div
                      key={f.path}
                      className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-slate-200">{f.path}</span>
                      <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                        <span>{f.sizeBytes} bytes</span>
                        <span className="text-amber-400 truncate max-w-xs">{f.sha256}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Select a canonical skill to inspect version bindings and tool requirements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
