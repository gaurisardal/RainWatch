import React, { useEffect, useState } from 'react';
import {
  Location,
  RiskForecast,
  ForecastWindow,
  CitizenReport,
  Incident,
  RouteWarning,
  InspectionPriorityItem,
  UserRole,
} from './types';
import { RainWatchApi } from './services/api';
import { DEMO_CONFIG, SAMPLE_DATA_LAST_UPDATED } from './data/sampleData';
import { WelcomeView } from './components/WelcomeView';
import { CitizenPortal } from './components/CitizenPortal';
import { ResponseTeamPortal } from './components/ResponseTeamPortal';
import {
  AlertTriangle,
  CloudRain,
  ExternalLink,
  Layers,
  Lock,
  LogOut,
  MapPin,
  Shield,
  ShieldAlert,
  Users,
} from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & Role State
  const [currentPage, setCurrentPage] = useState<'welcome' | 'citizen' | 'response_team'>('welcome');
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('rainwatch_staff_auth') === 'true';
  });
  const [showNavAuthModal, setShowNavAuthModal] = useState(false);
  const [navPasscode, setNavPasscode] = useState('');
  const [navAuthError, setNavAuthError] = useState<string | null>(null);

  // Core Data States
  const [locations, setLocations] = useState<Location[]>([]);
  const [forecastWindow, setForecastWindow] = useState<ForecastWindow>('1h');
  const [forecasts, setForecasts] = useState<Record<string, RiskForecast>>({});
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [routeWarnings, setRouteWarnings] = useState<RouteWarning[]>([]);
  const [inspectionPriorities, setInspectionPriorities] = useState<InspectionPriorityItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial Data Load
  const refreshAllData = async (window: ForecastWindow = forecastWindow) => {
    try {
      setLoading(true);
      const [locs, fcasts, reps, incs, rwarns, insp] = await Promise.all([
        RainWatchApi.getLocations(),
        RainWatchApi.getForecasts(window),
        RainWatchApi.getCitizenReports(),
        RainWatchApi.getIncidents(),
        RainWatchApi.getRouteWarnings(),
        RainWatchApi.getInspectionPriorities(window),
      ]);

      setLocations(locs);
      setForecasts(fcasts);
      setCitizenReports(reps);
      setIncidents(incs);
      setRouteWarnings(rwarns);
      setInspectionPriorities(insp);
    } catch (err) {
      console.error('Error fetching RainWatch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData(forecastWindow);
  }, [forecastWindow]);

  // Handle Forecast Window Change
  const handleWindowChange = async (newWindow: ForecastWindow) => {
    setForecastWindow(newWindow);
    const newForecasts = await RainWatchApi.getForecasts(newWindow);
    setForecasts(newForecasts);
    const newInsp = await RainWatchApi.getInspectionPriorities(newWindow);
    setInspectionPriorities(newInsp);
  };

  // Staff Login check
  const handleLoginAsStaff = (passcode: string): boolean => {
    if (passcode === DEMO_CONFIG.staffPasscode) {
      setIsStaffAuthenticated(true);
      setUserRole('response_team');
      sessionStorage.setItem('rainwatch_staff_auth', 'true');
      setCurrentPage('response_team');
      return true;
    }
    return false;
  };

  const handleStaffLogout = () => {
    setIsStaffAuthenticated(false);
    setUserRole('citizen');
    sessionStorage.removeItem('rainwatch_staff_auth');
    setCurrentPage('welcome');
  };

  const handleNavResponseTeamClick = () => {
    if (isStaffAuthenticated) {
      setUserRole('response_team');
      setCurrentPage('response_team');
    } else {
      setShowNavAuthModal(true);
    }
  };

  const handleNavAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNavAuthError(null);
    const success = handleLoginAsStaff(navPasscode.trim());
    if (success) {
      setShowNavAuthModal(false);
      setNavPasscode('');
    } else {
      setNavAuthError(`Invalid passcode. Use demo passcode: ${DEMO_CONFIG.staffPasscode}`);
    }
  };

  // Citizen Report Submission (re-computes everything dynamically)
  const handleSubmitCitizenReport = async (
    newReportData: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>
  ): Promise<CitizenReport> => {
    const created = await RainWatchApi.submitCitizenReport(newReportData);
    // Reload citizen reports and recalculate priority matrix
    const [updatedReps, updatedInsp] = await Promise.all([
      RainWatchApi.getCitizenReports(),
      RainWatchApi.getInspectionPriorities(forecastWindow),
    ]);
    setCitizenReports(updatedReps);
    setInspectionPriorities(updatedInsp);
    return created;
  };

  // Verify Report as Incident (promotes report to incident, recalculates dashboard counts)
  const handleVerifyReport = async (
    reportId: string,
    officer: string,
    severity: Incident['severity'],
    notes: string
  ): Promise<void> => {
    await RainWatchApi.verifyReportAsIncident(reportId, officer, severity, notes);
    const [updatedReps, updatedIncs, updatedInsp] = await Promise.all([
      RainWatchApi.getCitizenReports(),
      RainWatchApi.getIncidents(),
      RainWatchApi.getInspectionPriorities(forecastWindow),
    ]);
    setCitizenReports(updatedReps);
    setIncidents(updatedIncs);
    setInspectionPriorities(updatedInsp);
  };

  // Update Inspection Status
  const handleUpdateInspectionStatus = async (
    locationId: string,
    status: 'Pending' | 'Under Review' | 'Resolved'
  ): Promise<void> => {
    await RainWatchApi.updateInspectionStatus(locationId, status);
    const updatedInsp = await RainWatchApi.getInspectionPriorities(forecastWindow);
    setInspectionPriorities(updatedInsp);
  };

  // Update Incident Status
  const handleUpdateIncidentStatus = async (
    incidentId: string,
    status: Incident['status']
  ): Promise<void> => {
    await RainWatchApi.updateIncidentStatus(incidentId, status);
    const updatedIncs = await RainWatchApi.getIncidents();
    setIncidents(updatedIncs);
  };

  // Reset Demo Data
  const handleResetData = async () => {
    if (window.confirm('Reset all modified citizen reports and inspection statuses to default demo state?')) {
      await RainWatchApi.resetDemoData();
      await refreshAllData(forecastWindow);
    }
  };

  return (
    <div className="rw-app-wrapper">
      {/* Top Navbar */}
      <header className="rw-navbar">
        <div className="rw-nav-container">
          {/* Brand */}
          <div className="rw-brand" onClick={() => setCurrentPage('welcome')}>
            <div className="rw-brand-icon">
              <CloudRain size={22} />
            </div>
            <div className="rw-brand-name">
              RainWatch <span className="rw-brand-pune">PUNE</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="rw-nav-links">
            <button
              type="button"
              className={`rw-nav-btn ${currentPage === 'welcome' ? 'active' : ''}`}
              onClick={() => setCurrentPage('welcome')}
            >
              Overview
            </button>

            <button
              type="button"
              className={`rw-nav-btn ${currentPage === 'citizen' ? 'active' : ''}`}
              onClick={() => {
                setUserRole('citizen');
                setCurrentPage('citizen');
              }}
            >
              <Users size={15} />
              <span>Citizen Portal</span>
            </button>

            <button
              type="button"
              className={`rw-nav-btn ${currentPage === 'response_team' ? 'active' : ''}`}
              onClick={handleNavResponseTeamClick}
            >
              <Shield size={15} />
              <span>Response Team</span>
              {!isStaffAuthenticated && <Lock size={12} style={{ opacity: 0.7 }} />}
            </button>

            {/* Current Role Indicator */}
            {isStaffAuthenticated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                <span className="rw-nav-role-badge staff">
                  <ShieldAlert size={12} />
                  <span>DEMO STAFF</span>
                </span>
                <button
                  type="button"
                  className="rw-btn-pill"
                  onClick={handleStaffLogout}
                  title="Logout from Demo Staff Mode"
                  style={{ color: '#f87171', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', gap: '0.2rem', padding: '0.25rem 0.5rem' }}
                >
                  <LogOut size={13} />
                  <span>Exit Staff</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Honesty & Data Freshness Global Banner */}
      <div className="rw-banner-freshness">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="rw-badge rw-badge-demo">Demo Estimate</span>
          <span>Sample data only. These are not real rainfall forecasts or municipal incident records.</span>
        </div>
        <div>
          Data freshness: <b>{SAMPLE_DATA_LAST_UPDATED}</b>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="rw-main">
        {currentPage === 'welcome' && (
          <WelcomeView
            onContinueAsCitizen={() => {
              setUserRole('citizen');
              setCurrentPage('citizen');
            }}
            onLoginAsStaff={handleLoginAsStaff}
          />
        )}

        {currentPage === 'citizen' && (
          <CitizenPortal
            locations={locations}
            forecasts={forecasts}
            citizenReports={citizenReports}
            incidents={incidents}
            routeWarnings={routeWarnings}
            selectedWindow={forecastWindow}
            onWindowChange={handleWindowChange}
            onSubmitReport={handleSubmitCitizenReport}
          />
        )}

        {currentPage === 'response_team' && isStaffAuthenticated && (
          <ResponseTeamPortal
            locations={locations}
            forecasts={forecasts}
            citizenReports={citizenReports}
            incidents={incidents}
            inspectionPriorities={inspectionPriorities}
            selectedWindow={forecastWindow}
            onWindowChange={handleWindowChange}
            onUpdateInspectionStatus={handleUpdateInspectionStatus}
            onVerifyReport={handleVerifyReport}
            onUpdateIncidentStatus={handleUpdateIncidentStatus}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          background: '#fff',
          padding: '1.25rem',
          textAlign: 'center',
          fontSize: '0.775rem',
          color: '#64748b',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <b>RainWatch</b> &copy; 2026 Monsoon Waterlogging Risk Mapping System for Pune. Built with React + TypeScript + Leaflet.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Demo Passcode: <code>{DEMO_CONFIG.staffPasscode}</code></span>
            <span>OSM Tiles &copy; OpenStreetMap</span>
          </div>
        </div>
      </footer>

      {/* Navbar Passcode Modal */}
      {showNavAuthModal && (
        <div className="rw-modal-backdrop">
          <div className="rw-modal-card">
            <div className="rw-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} color="#2dd4bf" />
                <span style={{ fontWeight: 800 }}>Response Team Verification</span>
              </div>
              <button
                type="button"
                style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '1.2rem' }}
                onClick={() => setShowNavAuthModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="rw-banner-demo">
              <ShieldAlert size={16} />
              <span>DEMO-ONLY STAFF MODE, NOT SECURE AUTHENTICATION</span>
            </div>

            <form onSubmit={handleNavAuthSubmit}>
              <div className="rw-modal-body">
                <p style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Selecting Response Team alone does not grant admin access. Enter the demo passcode to view the Response Centre priority table.
                </p>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px dashed #94a3b8',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#334155',
                    marginBottom: '1rem',
                  }}
                >
                  🔑 <b>Demo Config Passcode:</b> <code style={{ background: '#e2e8f0', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>{DEMO_CONFIG.staffPasscode}</code>
                </div>

                {navAuthError && (
                  <div className="rw-alert rw-alert-error" style={{ marginBottom: '1rem' }}>
                    <AlertTriangle size={16} />
                    <span>{navAuthError}</span>
                  </div>
                )}

                <div className="rw-form-group">
                  <label className="rw-label">Demo Staff Passcode *</label>
                  <input
                    type="password"
                    className="rw-input"
                    placeholder="e.g. pune2026"
                    value={navPasscode}
                    onChange={(e) => setNavPasscode(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="rw-modal-footer">
                <button
                  type="button"
                  className="rw-btn rw-btn-secondary"
                  onClick={() => setShowNavAuthModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="rw-btn rw-btn-primary">
                  Enter Response Centre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
