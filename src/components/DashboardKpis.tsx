import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ClipboardCheck, MessageSquare, ShieldAlert } from 'lucide-react';
import { Location, RiskForecast, CitizenReport, InspectionPriorityItem } from '../types';

interface DashboardKpisProps {
  locations: Location[];
  forecasts: Record<string, RiskForecast>;
  citizenReports: CitizenReport[];
  inspectionPriorities: InspectionPriorityItem[];
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({
  locations,
  forecasts,
  citizenReports,
  inspectionPriorities,
}) => {
  // Compute metrics dynamically from current data
  const highRiskCount = Object.values(forecasts).filter((f) => f.category === 'high').length;
  const modRiskCount = Object.values(forecasts).filter((f) => f.category === 'moderate').length;
  const reportsReceived = citizenReports.length;
  const pendingReports = citizenReports.filter((r) => r.status === 'Pending').length;
  
  // Locations requiring immediate inspection: Critical or High priority with Pending/Under Review status
  const requiringInspectionCount = inspectionPriorities.filter(
    (item) => (item.priority === 'Critical' || item.priority === 'High') && item.status !== 'Resolved'
  ).length;

  return (
    <div className="rw-kpi-grid">
      {/* High-Risk Locations */}
      <div className="rw-kpi-card" style={{ borderLeft: '4px solid var(--risk-high)' }}>
        <div className="rw-kpi-icon" style={{ background: 'var(--risk-high-bg)', color: 'var(--risk-high)' }}>
          <AlertCircle size={24} />
        </div>
        <div className="rw-kpi-content">
          <div className="rw-kpi-val" style={{ color: 'var(--risk-high)' }}>
            {highRiskCount}
          </div>
          <div className="rw-kpi-label">High-Risk Hotspots</div>
          <div className="rw-kpi-sub">Score ≥ 75 | Severe inundation risk</div>
        </div>
      </div>

      {/* Moderate-Risk Locations */}
      <div className="rw-kpi-card" style={{ borderLeft: '4px solid var(--risk-mod)' }}>
        <div className="rw-kpi-icon" style={{ background: 'var(--risk-mod-bg)', color: 'var(--risk-mod)' }}>
          <AlertTriangle size={24} />
        </div>
        <div className="rw-kpi-content">
          <div className="rw-kpi-val" style={{ color: 'var(--risk-mod)' }}>
            {modRiskCount}
          </div>
          <div className="rw-kpi-label">Moderate-Risk Roads</div>
          <div className="rw-kpi-sub">Score 40–74 | Slow transit & pooling</div>
        </div>
      </div>

      {/* Citizen Reports Received */}
      <div className="rw-kpi-card" style={{ borderLeft: '4px solid var(--rep-color)' }}>
        <div className="rw-kpi-icon" style={{ background: 'var(--rep-bg)', color: 'var(--rep-color)' }}>
          <MessageSquare size={24} />
        </div>
        <div className="rw-kpi-content">
          <div className="rw-kpi-val" style={{ color: 'var(--rep-color)' }}>
            {reportsReceived}
          </div>
          <div className="rw-kpi-label">Citizen Reports Logged</div>
          <div className="rw-kpi-sub">{pendingReports} unverified / awaiting review</div>
        </div>
      </div>

      {/* Locations Requiring Inspection */}
      <div className="rw-kpi-card" style={{ borderLeft: '4px solid #0f766e' }}>
        <div className="rw-kpi-icon" style={{ background: 'var(--teal-100)', color: 'var(--teal-700)' }}>
          <ClipboardCheck size={24} />
        </div>
        <div className="rw-kpi-content">
          <div className="rw-kpi-val" style={{ color: 'var(--teal-700)' }}>
            {requiringInspectionCount}
          </div>
          <div className="rw-kpi-label">Requires Inspection</div>
          <div className="rw-kpi-sub">Critical / High priority sites active</div>
        </div>
      </div>
    </div>
  );
};
