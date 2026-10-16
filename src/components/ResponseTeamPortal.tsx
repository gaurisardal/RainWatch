import React, { useState } from 'react';
import {
  Location,
  RiskForecast,
  ForecastWindow,
  CitizenReport,
  Incident,
  InspectionPriorityItem,
} from '../types';
import { DashboardKpis } from './DashboardKpis';
import { RiskMap } from './RiskMap';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  ShieldAlert,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react';

interface ResponseTeamPortalProps {
  locations: Location[];
  forecasts: Record<string, RiskForecast>;
  citizenReports: CitizenReport[];
  incidents: Incident[];
  inspectionPriorities: InspectionPriorityItem[];
  selectedWindow: ForecastWindow;
  onWindowChange: (window: ForecastWindow) => void;
  onUpdateInspectionStatus: (
    locationId: string,
    status: 'Pending' | 'Under Review' | 'Resolved'
  ) => Promise<void>;
  onVerifyReport: (
    reportId: string,
    officerName: string,
    severity: Incident['severity'],
    notes: string
  ) => Promise<void>;
  onUpdateIncidentStatus: (
    incidentId: string,
    status: Incident['status']
  ) => Promise<void>;
  onResetData: () => Promise<void>;
}

export const ResponseTeamPortal: React.FC<ResponseTeamPortalProps> = ({
  locations,
  forecasts,
  citizenReports,
  incidents,
  inspectionPriorities,
  selectedWindow,
  onWindowChange,
  onUpdateInspectionStatus,
  onVerifyReport,
  onUpdateIncidentStatus,
  onResetData,
}) => {
  // Table filters
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Under Review' | 'Resolved'>('All');
  
  // Verification Modal State
  const [verifyingReport, setVerifyingReport] = useState<CitizenReport | null>(null);
  const [officerName, setOfficerName] = useState('Ward Officer (Demo)');
  const [incidentSeverity, setIncidentSeverity] = useState<Incident['severity']>('High');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Map layer controls
  const [showPredictions, setShowPredictions] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);

  // Filtered Inspection List
  const filteredInspections = inspectionPriorities.filter((item) => {
    if (priorityFilter !== 'All' && item.priority !== priorityFilter) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    return true;
  });

  const handleOpenVerifyModal = (report: CitizenReport) => {
    setVerifyingReport(report);
    setVerificationNotes(
      `Dispatched field crew to ${report.locationName}. Verified standing water (~${report.waterDepthCm || 25}cm). Pump clearance required.`
    );
  };

  const handleConfirmVerification = async () => {
    if (!verifyingReport) return;
    setIsProcessing(true);
    try {
      await onVerifyReport(
        verifyingReport.id,
        officerName,
        incidentSeverity,
        verificationNotes
      );
      setVerifyingReport(null);
    } catch (err) {
      console.error(err);
      alert('Failed to verify report into incident');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Warning Banner for Demo Security */}
      <div className="rw-banner-demo">
        <ShieldAlert size={16} />
        <span>DEMO-ONLY STAFF MODE, NOT SECURE AUTHENTICATION — FOR JUDGES & SIMULATION TESTING</span>
      </div>

      {/* KPI Summary Cards */}
      <DashboardKpis
        locations={locations}
        forecasts={forecasts}
        citizenReports={citizenReports}
        inspectionPriorities={inspectionPriorities}
      />

      {/* Overview Map */}
      <div className="rw-card">
        <div className="rw-card-header">
          <div className="rw-card-title">
            <Layers size={18} color="#0d9488" />
            <span>Monsoon Emergency Tactical Map (Pune Division)</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="rw-badge rw-badge-demo">Live Operational View</span>
          </div>
        </div>

        <RiskMap
          locations={locations}
          forecasts={forecasts}
          citizenReports={citizenReports}
          incidents={incidents}
          selectedWindow={selectedWindow}
          onWindowChange={onWindowChange}
          showPredictions={showPredictions}
          onTogglePredictions={setShowPredictions}
          showReports={showReports}
          onToggleReports={setShowReports}
          showIncidents={showIncidents}
          onToggleIncidents={setShowIncidents}
        />
      </div>

      {/* Response Centre Priority Inspection Table */}
      <div className="rw-card">
        <div className="rw-card-header">
          <div>
            <div className="rw-card-title">
              <ShieldAlert size={18} color="#dc2626" />
              <span>Response Centre Inspection Priority Table</span>
            </div>
            <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.2rem' }}>
              Ranked by composite risk: predicted rainfall accumulation + topography + nearby reports (~500m)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className="rw-btn rw-btn-secondary rw-btn-sm"
              onClick={onResetData}
              title="Reset all modified reports and incidents to fresh demo state"
            >
              <RefreshCw size={14} />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            background: '#f8fafc',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            border: '1px solid var(--color-border)',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="#475569" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Priority:</span>
            <select
              className="rw-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Status:</span>
            <select
              className="rw-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
            Showing <b>{filteredInspections.length}</b> of {inspectionPriorities.length} monitored sites
          </div>
        </div>

        {/* Priority Table */}
        <div className="rw-table-responsive">
          <table className="rw-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Location / Area</th>
                <th>Forecast Risk</th>
                <th>Nearby Reports (~500m)</th>
                <th>Contributing Factors</th>
                <th>Inspection Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInspections.map((item) => {
                let priBadgeClass = 'rw-badge-demo';
                if (item.priority === 'Critical') priBadgeClass = 'rw-badge-high';
                else if (item.priority === 'High') priBadgeClass = 'rw-badge-high';
                else if (item.priority === 'Medium') priBadgeClass = 'rw-badge-mod';
                else if (item.priority === 'Low') priBadgeClass = 'rw-badge-low';

                return (
                  <tr key={item.location.id}>
                    <td>
                      <span className={`rw-badge ${priBadgeClass}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                        {item.location.name}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                        {item.location.area} | {item.location.elevationProfile}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span
                          className={`rw-badge ${
                            item.currentForecast.category === 'high'
                              ? 'rw-badge-high'
                              : item.currentForecast.category === 'moderate'
                              ? 'rw-badge-mod'
                              : 'rw-badge-low'
                          }`}
                        >
                          {item.currentForecast.score}/100
                        </span>
                        <span className="rw-badge rw-badge-demo">Demo</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                        ~{item.currentForecast.rainfallEstimateMm}mm rain (±{item.currentForecast.uncertaintyMargin}%)
                      </div>
                    </td>
                    <td>
                      {item.nearbyReportCount > 0 ? (
                        <span
                          className="rw-badge rw-badge-report"
                          title="Citizen reports submitted within 500m radius"
                        >
                          📢 {item.nearbyReportCount} report{item.nearbyReportCount > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>0 reports</span>
                      )}
                    </td>
                    <td>
                      <div style={{ maxWidth: '280px', fontSize: '0.75rem', color: '#334155' }}>
                        <div><b>Drainage:</b> {item.currentForecast.contributingFactors.drainage}</div>
                        <div><b>Intensity:</b> {item.currentForecast.contributingFactors.rainfallIntensity}</div>
                      </div>
                    </td>
                    <td>
                      <select
                        className="rw-select"
                        value={item.status}
                        onChange={(e) =>
                          onUpdateInspectionStatus(
                            item.location.id,
                            e.target.value as 'Pending' | 'Under Review' | 'Resolved'
                          )
                        }
                        style={{
                          fontSize: '0.775rem',
                          padding: '0.3rem 0.5rem',
                          background:
                            item.status === 'Resolved'
                              ? '#dcfce7'
                              : item.status === 'Under Review'
                              ? '#fef3c7'
                              : '#fff',
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="rw-btn rw-btn-secondary rw-btn-sm"
                        onClick={() =>
                          onUpdateInspectionStatus(
                            item.location.id,
                            item.status === 'Resolved' ? 'Pending' : 'Resolved'
                          )
                        }
                      >
                        {item.status === 'Resolved' ? 'Re-open' : 'Mark Cleared'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incoming Citizen Reports Verification Queue */}
      <div className="rw-grid-2col">
        {/* Verification Queue */}
        <div className="rw-card">
          <div className="rw-card-header">
            <div className="rw-card-title">
              <UserCheck size={18} color="#6366f1" />
              <span>Incoming Citizen Reports Queue</span>
            </div>
            <span className="rw-badge rw-badge-report">
              {citizenReports.filter((r) => r.status !== 'Resolved').length} Active
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '450px', overflowY: 'auto' }}>
            {citizenReports.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                No citizen reports logged.
              </div>
            ) : (
              citizenReports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    background: report.status === 'Verified' ? '#f0fdf4' : '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy-900)' }}>
                        {report.locationName}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                        Coords: {report.lat.toFixed(4)}, {report.lng.toFixed(4)} | Time: {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <span
                      className={`rw-badge ${
                        report.status === 'Verified'
                          ? 'rw-badge-low'
                          : report.status === 'Under Review'
                          ? 'rw-badge-mod'
                          : 'rw-badge-demo'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '0.5rem' }}>
                    {report.description}
                  </p>

                  {report.photoUrl && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <img
                        src={report.photoUrl}
                        alt="Citizen proof"
                        style={{ height: '60px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                    {report.status !== 'Verified' && (
                      <button
                        type="button"
                        className="rw-btn rw-btn-primary rw-btn-sm"
                        onClick={() => handleOpenVerifyModal(report)}
                      >
                        <CheckCircle2 size={14} />
                        <span>Verify as Confirmed Incident</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Confirmed Incidents List */}
        <div className="rw-card">
          <div className="rw-card-header">
            <div className="rw-card-title">
              <AlertCircle size={18} color="#b91c1c" />
              <span>Confirmed Emergency Incidents</span>
            </div>
            <span className="rw-badge rw-badge-incident">{incidents.length} Verified</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '450px', overflowY: 'auto' }}>
            {incidents.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                No active confirmed incidents at this moment.
              </div>
            ) : (
              incidents.map((inc) => (
                <div
                  key={inc.id}
                  style={{
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    background: '#fff5f5',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#991b1b' }}>
                      {inc.locationName}
                    </div>
                    <span className="rw-badge rw-badge-incident">
                      {inc.severity} Severity
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#334155', margin: '0.35rem 0' }}>
                    <b>Action Note:</b> {inc.notes}
                  </p>

                  <div style={{ fontSize: '0.725rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>By: {inc.confirmedBy}</span>
                    <span>Status: <b>{inc.status}</b></span>
                  </div>

                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                    <select
                      className="rw-select"
                      value={inc.status}
                      onChange={(e) => onUpdateIncidentStatus(inc.id, e.target.value as any)}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Under Control">Under Control</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Verification Modal Dialog */}
      {verifyingReport && (
        <div className="rw-modal-backdrop">
          <div className="rw-modal-card">
            <div className="rw-modal-header">
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>Verify Citizen Report into Incident</span>
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
                onClick={() => setVerifyingReport(null)}
              >
                ✕
              </button>
            </div>

            <div className="rw-modal-body">
              <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{verifyingReport.locationName}</div>
                <div style={{ fontSize: '0.775rem', color: '#475569', marginTop: '0.25rem' }}>
                  "{verifyingReport.description}"
                </div>
              </div>

              <div className="rw-form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="rw-label">Verifying Officer / Designation</label>
                <input
                  type="text"
                  className="rw-input"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                />
              </div>

              <div className="rw-form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="rw-label">Incident Severity</label>
                <select
                  className="rw-select"
                  value={incidentSeverity}
                  onChange={(e) => setIncidentSeverity(e.target.value as any)}
                >
                  <option value="Moderate">Moderate (Water slow moving, passable)</option>
                  <option value="High">High (Lane blocked, pump dispatch required)</option>
                  <option value="Critical">Critical (Complete underpass closure / traffic halt)</option>
                </select>
              </div>

              <div className="rw-form-group">
                <label className="rw-label">Action Taken / Dispatch Instructions</label>
                <textarea
                  className="rw-textarea"
                  rows={3}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="rw-modal-footer">
              <button
                type="button"
                className="rw-btn rw-btn-secondary"
                onClick={() => setVerifyingReport(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rw-btn rw-btn-primary"
                disabled={isProcessing}
                onClick={handleConfirmVerification}
              >
                {isProcessing ? 'Promoting...' : 'Promote to Incident'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
