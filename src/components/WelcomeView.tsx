import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CloudLightning,
  CloudRain,
  Compass,
  Lock,
  MapPin,
  Shield,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { DEMO_CONFIG, SAMPLE_DATA_LAST_UPDATED } from '../data/sampleData';

interface WelcomeViewProps {
  onContinueAsCitizen: () => void;
  onLoginAsStaff: (passcode: string) => boolean;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onContinueAsCitizen,
  onLoginAsStaff,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const handleStaffLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const success = onLoginAsStaff(passcode.trim());
    if (success) {
      setShowAuthModal(false);
    } else {
      setAuthError(`Invalid passcode. Please use demo passcode: ${DEMO_CONFIG.staffPasscode}`);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid #334155',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(13, 148, 136, 0.25)', border: '1px solid #0d9488', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', color: '#5eead4', fontWeight: 700, marginBottom: '1.25rem' }}>
          <CloudRain size={16} />
          <span>Pune Monsoon Early-Warning & Risk Mapping Initiative</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}>
          RainWatch <span style={{ color: '#2dd4bf' }}>Pune</span>
        </h1>

        <p style={{ fontSize: '1.05rem', color: '#cbd5e1', maxWidth: '720px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
          Anticipate urban waterlogging hotspots across Pune before flash floods compromise underpasses and major transit corridors. Powered by multi-factor topographic risk mapping and verified citizen crowdsourcing.
        </p>

        {/* Action Choice Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="rw-btn rw-btn-primary"
            style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', background: '#0d9488' }}
            onClick={onContinueAsCitizen}
          >
            <span>Continue as Citizen</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            className="rw-btn rw-btn-secondary"
            style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => setShowAuthModal(true)}
          >
            <Lock size={16} />
            <span>Response Team Login</span>
          </button>
        </div>

        {/* Freshness & Honesty Tag */}
        <div style={{ marginTop: '1.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
          Data Freshness: <b>{SAMPLE_DATA_LAST_UPDATED}</b> | Demo Forecasts (Not Real Bureau Models)
        </div>
      </div>

      {/* Two Pillars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Citizen Portal Card */}
        <div className="rw-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--teal-50)', color: 'var(--teal-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Users size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
              Citizen Public Portal
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '1rem' }}>
              Open access to real-time risk predictions across 10 vulnerable Pune roads, forecast windows (1h, 3h, 6h), and interactive water hazard reporting with optional photo verification.
            </p>
            <ul style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
              <li>Interactive OpenStreetMap Pune coverage</li>
              <li>Filter by 1-hour, 3-hour, and 6-hour rainfall forecasts</li>
              <li>Crowdsource water depths & blocked drain reports</li>
              <li>Cautious route travel advisories (Demo data)</li>
            </ul>
          </div>

          <button
            type="button"
            className="rw-btn rw-btn-primary"
            style={{ width: '100%' }}
            onClick={onContinueAsCitizen}
          >
            Open Public Portal
          </button>
        </div>

        {/* Response Team Card */}
        <div className="rw-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #f59e0b' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldAlert size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
              Response Team Centre
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '1rem' }}>
              Staff inspection priority ranking combining predictive runoff models and clustered citizen reports (~500m proximity). Field verification promoted directly to active incidents.
            </p>
            <ul style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
              <li>Inspection priority ranking: Critical, High, Medium, Low</li>
              <li>Citizen report verification & promotion into incidents</li>
              <li>Dynamic KPI tracking with auto-recalculation</li>
              <li>Passcode-protected demo staff mode (passcode: <code>{DEMO_CONFIG.staffPasscode}</code>)</li>
            </ul>
          </div>

          <button
            type="button"
            className="rw-btn rw-btn-navy"
            style={{ width: '100%' }}
            onClick={() => setShowAuthModal(true)}
          >
            <Lock size={15} />
            <span>Response Team Login</span>
          </button>
        </div>
      </div>

      {/* Staff Login Modal */}
      {showAuthModal && (
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
                onClick={() => setShowAuthModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Prominent Demo Auth Warning */}
            <div className="rw-banner-demo">
              <ShieldAlert size={16} />
              <span>DEMO-ONLY STAFF MODE, NOT SECURE AUTHENTICATION</span>
            </div>

            <form onSubmit={handleStaffLoginSubmit}>
              <div className="rw-modal-body">
                <p style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Access to the Response Centre table and incident verification requires the demo staff passcode.
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

                {authError && (
                  <div className="rw-alert rw-alert-error" style={{ marginBottom: '1rem' }}>
                    <AlertTriangle size={16} />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="rw-form-group">
                  <label className="rw-label">Enter Staff Passcode *</label>
                  <input
                    type="password"
                    className="rw-input"
                    placeholder="Enter passcode (e.g. pune2026)"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="rw-modal-footer">
                <button
                  type="button"
                  className="rw-btn rw-btn-secondary"
                  onClick={() => setShowAuthModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="rw-btn rw-btn-primary">
                  Verify & Enter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
