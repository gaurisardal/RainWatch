import React, { useState } from 'react';
import {
  Location,
  RiskForecast,
  ForecastWindow,
  CitizenReport,
  Incident,
  RouteWarning,
} from '../types';
import { RiskMap } from './RiskMap';
import { CitizenReportForm } from './CitizenReportForm';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Compass, Eye, MapPin, Shield } from 'lucide-react';

interface CitizenPortalProps {
  locations: Location[];
  forecasts: Record<string, RiskForecast>;
  citizenReports: CitizenReport[];
  incidents: Incident[];
  routeWarnings: RouteWarning[];
  selectedWindow: ForecastWindow;
  onWindowChange: (window: ForecastWindow) => void;
  onSubmitReport: (
    report: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>
  ) => Promise<CitizenReport>;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  locations,
  forecasts,
  citizenReports,
  incidents,
  routeWarnings,
  selectedWindow,
  onWindowChange,
  onSubmitReport,
}) => {
  const [showPredictions, setShowPredictions] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [selectedCoord, setSelectedCoord] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setSelectedCoord({ lat, lng });
  };

  const handleSelectPreset = (loc: Location) => {
    setSelectedCoord({ lat: loc.lat, lng: loc.lng });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Risk Map Section */}
      <div className="rw-card">
        <div className="rw-card-header">
          <div>
            <div className="rw-card-title">
              <MapPin size={20} color="#0d9488" />
              <span>Pune Public Monsoon Waterlogging Map</span>
            </div>
            <div style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.2rem' }}>
              Real-time map visualization across 10 key transit nodes and citizen reports
            </div>
          </div>
          <span className="rw-badge rw-badge-demo">Demo Estimates (Not Real-time Forecasts)</span>
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
          onMapLocationSelect={handleMapLocationSelect}
          selectedCoord={selectedCoord}
        />
      </div>

      {/* Grid: Reporting Form & Route Warnings */}
      <div className="rw-grid-2col">
        {/* Left Column: Citizen Report Form */}
        <CitizenReportForm
          locations={locations}
          selectedCoord={selectedCoord}
          onSelectPresetLocation={handleSelectPreset}
          onSubmitReport={onSubmitReport}
        />

        {/* Right Column: Route Warnings (DEMO DATA) & My Reports */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Route Warnings */}
          <div className="rw-card">
            <div className="rw-card-header">
              <div className="rw-card-title">
                <Compass size={18} color="#ea580c" />
                <span>Monsoon Route Advisories</span>
              </div>
              <span className="rw-badge rw-badge-demo">Demo Data</span>
            </div>

            <div
              style={{
                fontSize: '0.75rem',
                color: '#64748b',
                marginBottom: '0.75rem',
                background: '#f8fafc',
                padding: '0.4rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
              }}
            >
              ⚠️ <i>Cautious travel advice for low-lying transit corridors. Does not calculate optimal or automated safe paths.</i>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {routeWarnings.map((warning) => (
                <div
                  key={warning.id}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    background: warning.riskLevel === 'High' ? '#fff5f5' : '#fffbeb',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                      {warning.roadName}
                    </div>
                    <span className={`rw-badge ${warning.riskLevel === 'High' ? 'rw-badge-high' : 'rw-badge-mod'}`}>
                      {warning.riskLevel}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.35rem' }}>
                    <b>Stretch:</b> {warning.stretch}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#1e293b', marginBottom: '0.35rem' }}>
                    {warning.advisory}
                  </div>

                  {warning.suggestedAlternative && (
                    <div style={{ fontSize: '0.75rem', color: '#0f766e', fontWeight: 600 }}>
                      Suggested detour: {warning.suggestedAlternative}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Reports List with Statuses */}
          <div className="rw-card">
            <div className="rw-card-header">
              <div className="rw-card-title">
                <Clock size={18} color="#6366f1" />
                <span>Public Waterlogging Feed</span>
              </div>
              <span className="rw-badge rw-badge-report">{citizenReports.length} Reports</span>
            </div>

            <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {citizenReports.length === 0 ? (
                <div style={{ fontSize: '0.825rem', color: '#64748b', textAlign: 'center', padding: '1rem' }}>
                  No citizen reports submitted yet. Use the form to submit one!
                </div>
              ) : (
                citizenReports.map((rep) => {
                  let statusBadge = <span className="rw-badge rw-badge-demo">Pending Review</span>;
                  if (rep.status === 'Verified') {
                    statusBadge = <span className="rw-badge rw-badge-incident">Verified Incident</span>;
                  } else if (rep.status === 'Under Review') {
                    statusBadge = <span className="rw-badge rw-badge-mod">Under Review</span>;
                  } else if (rep.status === 'Resolved') {
                    statusBadge = <span className="rw-badge rw-badge-low">Resolved</span>;
                  }

                  return (
                    <div
                      key={rep.id}
                      style={{
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        padding: '0.65rem',
                        background: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--navy-900)' }}>
                          {rep.locationName}
                        </span>
                        {statusBadge}
                      </div>

                      <p style={{ fontSize: '0.775rem', color: '#475569', margin: '0.25rem 0' }}>
                        {rep.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '0.35rem' }}>
                        <span>
                          {rep.waterDepthCm ? `Depth: ~${rep.waterDepthCm}cm | ` : ''}
                          Coords: {rep.lat.toFixed(4)}, {rep.lng.toFixed(4)}
                        </span>
                        <span>{new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
