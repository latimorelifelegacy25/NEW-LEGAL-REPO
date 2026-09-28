import React, { useState } from 'react';
import {
  Network,
  Search,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Layers,
  Database,
  Shield,
  Filter,
  Check,
  Tag,
  Share2,
  FileText
} from 'lucide-react';
import {
  KnowledgeEntity,
  KnowledgeEdge,
  KnowledgeConflict,
  EvidenceClass
} from '../../types/platform';

interface KnowledgeViewProps {
  entities: KnowledgeEntity[];
  edges: KnowledgeEdge[];
  conflicts: KnowledgeConflict[];
  onResolveConflict: (conflictId: string, resolution: any) => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  entities,
  edges,
  conflicts,
  onResolveConflict
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<KnowledgeEntity>(entities[0]);
  const [evidenceFilter, setEvidenceFilter] = useState<string>('all');

  const filteredEntities = entities.filter((ent) => {
    const matchesSearch =
      ent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ent.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ent.sourceSystem.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEvidence =
      evidenceFilter === 'all' || ent.provenance.evidenceClass === evidenceFilter;
    return matchesSearch && matchesEvidence;
  });

  const getConnectedEdges = (entityId: string) => {
    return edges.filter((e) => e.sourceEntityId === entityId || e.targetEntityId === entityId);
  };

  const getEvidenceBadge = (evClass: EvidenceClass) => {
    switch (evClass) {
      case 'DETERMINISTIC':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'SOURCE_DECLARED':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'AI_EXTRACTED':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'HUMAN_CONFIRMED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400" />
              <h1 className="text-xl font-display font-bold text-white tracking-wide">
                Knowledge Graph & Evidence Provenance (SPEC-005)
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-serif-body mt-1">
              External systems remain authoritative. The platform maintains normalized entity versions, graph relationships, conflict resolution, and evidence classification.
            </p>
          </div>
          <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-purple-400 self-start sm:self-auto">
            Evidence Classes: 4 Formally Stratified
          </span>
        </div>
      </div>

      {/* Conflicts Alert Banner (if any open) */}
      {conflicts.some((c) => c.status === 'OPEN') && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span>KNOWLEDGE CONFLICT DETECTED (SPEC-005): Authority Verification Required</span>
          </div>

          <div className="space-y-2">
            {conflicts.filter((c) => c.status === 'OPEN').map((conf) => (
              <div key={conf.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>Entity: {conf.entityId} &bull; Property: {conf.propertyName}</span>
                  <span className="text-rose-400 font-mono text-[10px]">CONFLICT</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">{conf.sourceA.system}</span>
                    <span className="text-slate-200 font-mono">{String(conf.sourceA.value)}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold block">{conf.sourceB.system}</span>
                    <span className="text-slate-200 font-mono">{String(conf.sourceB.value)}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => onResolveConflict(conf.id, conf.sourceA.value)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px]"
                  >
                    Accept Source A
                  </button>
                  <button
                    onClick={() => onResolveConflict(conf.id, conf.sourceB.value)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-semibold"
                  >
                    Accept Source B
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Evidence Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search across graph nodes, cases, filings, statutes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-slate-500 text-[11px] font-medium mr-1">Evidence Class:</span>
          {['all', 'DETERMINISTIC', 'SOURCE_DECLARED', 'AI_EXTRACTED', 'HUMAN_CONFIRMED'].map((ev) => (
            <button
              key={ev}
              onClick={() => setEvidenceFilter(ev)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                evidenceFilter === ev
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {ev}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Entity Browser vs Graph Relations View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Entities List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {filteredEntities.map((ent) => {
            const isSelected = selectedEntity.id === ent.id;
            return (
              <div
                key={ent.id}
                onClick={() => setSelectedEntity(ent)}
                className={`p-3.5 rounded-xl border cursor-pointer transition text-xs space-y-1.5 ${
                  isSelected
                    ? 'bg-slate-900 border-purple-500/80 ring-1 ring-purple-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{ent.title}</span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-bold ${getEvidenceBadge(ent.provenance.evidenceClass)}`}>
                    {ent.provenance.evidenceClass}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>Type: {ent.type}</span>
                  <span>&bull;</span>
                  <span>Source: {ent.sourceSystem}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Graph Relations & Node Details */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          {selectedEntity ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-purple-400">
                    {selectedEntity.type} Entity &bull; {selectedEntity.sourceSystem}
                  </span>
                  <h3 className="text-base font-bold text-white">{selectedEntity.title}</h3>
                  <span className="text-[11px] font-mono text-slate-400 block">Node ID: {selectedEntity.id}</span>
                </div>

                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border font-bold ${getEvidenceBadge(selectedEntity.provenance.evidenceClass)}`}>
                  {selectedEntity.provenance.evidenceClass}
                </span>
              </div>

              {/* Connected Relationships in Knowledge Graph */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide block">
                  Knowledge Graph Edges (SPEC-005 Relations):
                </span>

                <div className="space-y-2">
                  {getConnectedEdges(selectedEntity.id).map((ed) => {
                    const isSource = ed.sourceEntityId === selectedEntity.id;
                    const connectedId = isSource ? ed.targetEntityId : ed.sourceEntityId;
                    const connectedNode = entities.find((n) => n.id === connectedId);

                    return (
                      <div
                        key={ed.id}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="font-bold text-amber-400">{isSource ? 'OUTGOING' : 'INCOMING'}</span>
                          <span className="text-slate-500">&rarr;</span>
                          <span className="text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                            {ed.relationshipType}
                          </span>
                          <span className="text-slate-500">&rarr;</span>
                          <span className="font-semibold text-slate-200">{connectedNode?.title || connectedId}</span>
                        </div>

                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${getEvidenceBadge(ed.evidenceClass)}`}>
                          {ed.evidenceClass}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Provenance Metadata */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs text-slate-400">
                <span className="font-bold text-slate-300 uppercase tracking-wide text-[10px] block">
                  Immutable Provenance Record:
                </span>
                <p className="font-mono text-[11px]">Author: {selectedEntity.provenance.author}</p>
                <p className="font-mono text-[11px] truncate">SHA-256: {selectedEntity.provenance.hash}</p>
                <p className="font-mono text-[11px]">Last Sync Checkpoint: {new Date(selectedEntity.lastSyncedAt).toLocaleString()}</p>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              Select an entity node to inspect graph connections and evidence provenance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
