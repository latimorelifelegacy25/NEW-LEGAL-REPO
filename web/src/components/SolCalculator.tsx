import React, { useState, useMemo } from 'react';
import { PA_SOL_DATA } from '../data/solData';
import { SolItem } from '../types';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Info,
  Scale,
  ShieldAlert,
  CheckSquare,
  Calendar
} from 'lucide-react';

interface SolCalculatorProps {
  onSyncTask?: (title: string, notes: string, dueDate: string) => void;
  accessToken?: string | null;
}

export const SolCalculator: React.FC<SolCalculatorProps> = ({
  onSyncTask,
  accessToken
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string>(PA_SOL_DATA[0].id);
  const [incidentDate, setIncidentDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  });
  const [useDiscoveryRule, setUseDiscoveryRule] = useState<boolean>(false);
  const [discoveryDate, setDiscoveryDate] = useState<string>('');
  const [tableSearch, setTableSearch] = useState<string>('');

  const activeClaim = useMemo(() => {
    return PA_SOL_DATA.find((c) => c.id === selectedClaimId) || PA_SOL_DATA[0];
  }, [selectedClaimId]);

  // Calculation logic
  const calculationResult = useMemo(() => {
    if (!incidentDate) return null;
    const baseDateStr = useDiscoveryRule && discoveryDate ? discoveryDate : incidentDate;
    const baseDate = new Date(baseDateStr);
    if (isNaN(baseDate.getTime())) return null;

    if (activeClaim.periodInYears === 0) {
      return {
        isExempt: true,
        expirationDateStr: 'No Expiration (Indefinite / Permanent)',
        rawDate: '',
        daysRemaining: Infinity,
        isExpired: false,
        statusLabel: 'Statutorily Exempt from Time Bar'
      };
    }

    let expirationDate = new Date(baseDate);
    if (activeClaim.periodInYears < 1) {
      const daysToAdd = Math.round(activeClaim.periodInYears * 365.25);
      expirationDate.setDate(expirationDate.getDate() + daysToAdd);
    } else {
      expirationDate.setFullYear(expirationDate.getFullYear() + activeClaim.periodInYears);
    }

    const today = new Date();
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = diffDays < 0;

    return {
      isExempt: false,
      expirationDateStr: expirationDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      rawDate: expirationDate.toISOString().split('T')[0],
      daysRemaining: diffDays,
      isExpired,
      statusLabel: isExpired
        ? `Expired (${Math.abs(diffDays)} days ago)`
        : `${diffDays} days remaining to file action`
    };
  }, [activeClaim, incidentDate, useDiscoveryRule, discoveryDate]);

  const filteredTable = useMemo(() => {
    if (!tableSearch.trim()) return PA_SOL_DATA;
    const q = tableSearch.toLowerCase();
    return PA_SOL_DATA.filter(
      (item) =>
        item.causeOfAction.toLowerCase().includes(q) ||
        item.claimCategory.toLowerCase().includes(q) ||
        item.statutoryBasis.toLowerCase().includes(q) ||
        item.limitationPeriod.toLowerCase().includes(q)
    );
  }, [tableSearch]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Pennsylvania Statute of Limitations & Bar Date Calculator
            </h1>
            <p className="text-xs text-slate-500 font-serif-body mt-0.5">
              Calculate legal filing deadlines under Title 42 Chapter 55. Evaluates Discovery Rule accrual, minority tolling doctrines, and statutory exemptions with Google Tasks synchronization.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 font-semibold self-start md:self-auto flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            42 Pa.C.S. §§ 5521–5554
          </span>
        </div>
      </div>

      {/* Interactive Calculator Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Inputs */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-600" />
            Select Cause of Action & Incident Date
          </h2>

          <div className="space-y-1.5">
            <label htmlFor="sol-claim-select" className="block text-xs font-semibold text-slate-700">
              Claim / Cause of Action
            </label>
            <select
              id="sol-claim-select"
              aria-label="Select Claim or Cause of Action"
              value={selectedClaimId}
              onChange={(e) => setSelectedClaimId(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            >
              {PA_SOL_DATA.map((claim) => (
                <option key={claim.id} value={claim.id}>
                  {claim.causeOfAction} ({claim.limitationPeriod} - {claim.statutoryBasis})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="sol-incident-date" className="block text-xs font-semibold text-slate-700">
              Date of Incident / Breach / Injury Occurred
            </label>
            <input
              id="sol-incident-date"
              type="date"
              value={incidentDate}
              onChange={(e) => setIncidentDate(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>

          {/* Discovery Rule Toggle */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                id="checkbox-discovery-rule"
                type="checkbox"
                checked={useDiscoveryRule}
                onChange={(e) => setUseDiscoveryRule(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Apply Discovery Rule (Latent injury or reasonably delayed discovery)</span>
            </label>

            {useDiscoveryRule && (
              <div className="space-y-1.5 pl-6">
                <label htmlFor="sol-discovery-date" className="block text-xs font-medium text-slate-600">
                  Date Injury / Harm was Discovered (or reasonably discoverable)
                </label>
                <input
                  id="sol-discovery-date"
                  type="date"
                  value={discoveryDate}
                  onChange={(e) => setDiscoveryDate(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-amber-50/50 border border-amber-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <p className="text-[11px] text-slate-500 font-serif-body">
                  Under <em>Fine v. Checcio</em>, 582 Pa. 253, the Discovery Rule tolls the statute until the plaintiff, using reasonable diligence, knows or should know of the injury and cause.
                </p>
              </div>
            )}
          </div>

          {/* Claim Detail Badges */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Statutory Authority:</span>
              <span className="font-mono font-bold text-amber-700">{activeClaim.statutoryBasis}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Limitation Period:</span>
              <span className="font-bold text-slate-900">{activeClaim.limitationPeriod}</span>
            </div>
            <div className="pt-1 text-slate-600 font-serif-body">
              <span className="font-semibold text-slate-700 block">Accrual Trigger:</span>
              {activeClaim.accrualRule}
            </div>
          </div>
        </div>

        {/* Right Calculation Display Card */}
        <div className="lg:col-span-6 bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
            <span className="font-display font-bold text-sm tracking-wide">
              Filing Deadline & Bar Date Calculation Result
            </span>
          </div>

          <div className="p-6 space-y-6">
            {calculationResult ? (
              <div className="space-y-5">
                {/* Main Status Hero */}
                <div
                  className={`p-5 rounded-xl border flex items-start gap-4 ${
                    calculationResult.isExempt
                      ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                      : calculationResult.isExpired
                      ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {calculationResult.isExempt ? (
                      <Scale className="w-6 h-6 text-blue-600" />
                    ) : calculationResult.isExpired ? (
                      <AlertTriangle className="w-6 h-6 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider font-bold opacity-75">
                      Statutory Status
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold">
                      {calculationResult.statusLabel}
                    </h3>
                    <p className="text-xs sm:text-sm font-serif-body">
                      {calculationResult.isExempt
                        ? 'This matter is not subject to procedural bar dates under Pennsylvania statutes.'
                        : calculationResult.isExpired
                        ? 'Notice: The claim appears to exceed the statutory limitation period under Pennsylvania law. Consult legal counsel immediately to evaluate potential Discovery Rule or tolling arguments.'
                        : 'Actionable: The claim remains within the statutory filing window under Pennsylvania Consolidated Statutes.'}
                    </p>
                  </div>
                </div>

                {/* Expiration Date Metric & Sync Button */}
                {!calculationResult.isExempt && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Exact Statutory Bar Date (Last Day to File)
                        </span>
                        <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                          {calculationResult.expirationDateStr}
                        </p>
                      </div>

                      {/* Sync to Google Tasks */}
                      {onSyncTask && (
                        <button
                          onClick={() =>
                            onSyncTask(
                              `PA Court Filing Deadline: ${activeClaim.causeOfAction}`,
                              `Statutory Basis: ${activeClaim.statutoryBasis}\nAccrual: ${activeClaim.accrualRule}\nKey Precedents: ${activeClaim.keyCases}`,
                              calculationResult.rawDate
                            )
                          }
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition shrink-0"
                          title="Schedule this deadline in Google Tasks"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Sync to Google Tasks</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 font-serif-body">
                      If the final day falls on a Saturday, Sunday, or legal Commonwealth holiday, the deadline extends to the next business day (1 Pa.C.S. § 1908).
                    </p>
                  </div>
                )}

                {/* Tolling Exceptions List */}
                <div className="space-y-2">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Recognized Pennsylvania Tolling Exceptions
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 list-disc list-inside">
                    {activeClaim.tollingRules.map((r, idx) => (
                      <li key={idx} className="font-serif-body leading-relaxed">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Case Citation Footnote */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded border border-slate-200 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    <strong>Governing Authority:</strong> {activeClaim.keyCases}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                Please enter a valid incident date to calculate the bar date.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comprehensive Reference Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600" />
              Pennsylvania Limitation Periods Reference Guide
            </h2>
            <p className="text-xs text-slate-500 font-serif-body">
              Master schedule of limitation periods codified in Title 42 and related domestic/education statutes.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="sol-table-search-input"
              type="text"
              placeholder="Search claims or citations..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-medium">
                <th className="py-2.5 px-3 rounded-l">Cause of Action / Subject</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Statutory Basis</th>
                <th className="py-2.5 px-3">Limitation Period</th>
                <th className="py-2.5 px-3 rounded-r">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTable.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    selectedClaimId === item.id ? 'bg-amber-50/50 font-medium' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 text-slate-900 font-semibold">{item.causeOfAction}</td>
                  <td className="py-2.5 px-3 text-slate-600">{item.claimCategory}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-700">{item.statutoryBasis}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.limitationPeriod}</td>
                  <td className="py-2.5 px-3">
                    <button
                      id={`apply-sol-${item.id}`}
                      onClick={() => {
                        setSelectedClaimId(item.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-amber-600 hover:text-white border border-slate-200 text-slate-700 transition text-[11px] font-medium"
                    >
                      Calculate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
