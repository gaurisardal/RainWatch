import React, { useState } from 'react';
import { Camera, CheckCircle2, Clock, MapPin, Send, Trash2, XCircle } from 'lucide-react';
import { CitizenReport, Location } from '../types';

interface CitizenReportFormProps {
  locations: Location[];
  selectedCoord: { lat: number; lng: number } | null;
  onSelectPresetLocation: (loc: Location) => void;
  onSubmitReport: (
    report: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>
  ) => Promise<CitizenReport>;
}

export const CitizenReportForm: React.FC<CitizenReportFormProps> = ({
  locations,
  selectedCoord,
  onSelectPresetLocation,
  onSubmitReport,
}) => {
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState<string>(selectedCoord ? selectedCoord.lat.toString() : '18.5204');
  const [lng, setLng] = useState<string>(selectedCoord ? selectedCoord.lng.toString() : '73.8567');
  const [waterDepthCm, setWaterDepthCm] = useState<number>(20);
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync when selectedCoord changes from map click
  React.useEffect(() => {
    if (selectedCoord) {
      setLat(selectedCoord.lat.toFixed(5));
      setLng(selectedCoord.lng.toFixed(5));
      if (!locationName) {
        setLocationName(`Near Map Pin (${selectedCoord.lat.toFixed(4)}, ${selectedCoord.lng.toFixed(4)})`);
      }
    }
  }, [selectedCoord]);

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locId = e.target.value;
    if (!locId) return;
    const found = locations.find((l) => l.id === locId);
    if (found) {
      setLocationName(`${found.name} (${found.area})`);
      setLat(found.lat.toString());
      setLng(found.lng.toString());
      onSelectPresetLocation(found);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Photo must be smaller than 3MB for fast in-browser preview.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    // Validation
    if (!locationName.trim()) {
      setErrorMsg('Please enter or select a landmark/road location in Pune.');
      return;
    }

    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);

    if (isNaN(numLat) || isNaN(numLng)) {
      setErrorMsg('Valid coordinates are required.');
      return;
    }

    // Pune rough bounding box check
    if (numLat < 18.3 || numLat > 18.8 || numLng < 73.6 || numLng > 74.2) {
      setErrorMsg('Coordinates appear outside Pune metropolitan boundary.');
      return;
    }

    if (description.trim().length < 8) {
      setErrorMsg('Please provide a brief description (at least 8 characters) of waterlogging conditions.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await onSubmitReport({
        locationName: locationName.trim(),
        lat: numLat,
        lng: numLng,
        description: description.trim(),
        waterDepthCm: waterDepthCm || undefined,
        photoUrl: photoPreview || undefined,
      });

      setSuccessMsg(
        `Report successfully logged for "${created.locationName}". It is now visible on the public map with "Pending" status.`
      );
      // Reset form
      setDescription('');
      setPhotoPreview(null);
      // clear success message after 6 seconds
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rw-card">
      <div className="rw-card-header">
        <div className="rw-card-title">
          <Send size={18} color="#0d9488" />
          <span>Report Monsoon Waterlogging</span>
        </div>
        <span className="rw-badge rw-badge-report">Citizen Crowdsource</span>
      </div>

      {successMsg && (
        <div className="rw-alert rw-alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle2 size={18} />
          <div>{successMsg}</div>
        </div>
      )}

      {errorMsg && (
        <div className="rw-alert rw-alert-error" style={{ marginBottom: '1rem' }}>
          <XCircle size={18} />
          <div>{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="rw-form-grid">
          {/* Quick Preset Selector */}
          <div className="rw-form-group full">
            <label className="rw-label">Quick-Select Known Waterlogging Spot (or click map):</label>
            <select className="rw-select" onChange={handlePresetChange} defaultValue="">
              <option value="">-- Choose from 10 monitored Pune junctions --</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.area})
                </option>
              ))}
            </select>
          </div>

          {/* Location Name */}
          <div className="rw-form-group full">
            <label className="rw-label">Road / Landmark Name *</label>
            <input
              type="text"
              className="rw-input"
              placeholder="e.g. Sancheti Underpass, Deccan Gymkhana, Nagar Road"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
            />
          </div>

          {/* Coordinates */}
          <div className="rw-form-group">
            <label className="rw-label">Latitude *</label>
            <input
              type="number"
              step="any"
              className="rw-input"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            />
            <span className="rw-input-hint">Clicking map auto-populates this</span>
          </div>

          <div className="rw-form-group">
            <label className="rw-label">Longitude *</label>
            <input
              type="number"
              step="any"
              className="rw-input"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
            />
            <span className="rw-input-hint">Clicking map auto-populates this</span>
          </div>

          {/* Water Depth Estimate */}
          <div className="rw-form-group full">
            <label className="rw-label">
              Estimated Water Depth: <b>{waterDepthCm} cm</b> (~{Math.round(waterDepthCm / 2.54)} inches)
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={waterDepthCm}
              onChange={(e) => setWaterDepthCm(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--teal-600)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#64748b' }}>
              <span>Curb height (~10cm)</span>
              <span>Knee depth (~40cm)</span>
              <span>Vehicle submergence risk (70cm+)</span>
            </div>
          </div>

          {/* Description */}
          <div className="rw-form-group full">
            <label className="rw-label">Description of Water Hazard *</label>
            <textarea
              className="rw-textarea"
              rows={3}
              placeholder="Describe road conditions, stalled vehicles, manhole overflow, blocked storm drains..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Photo Upload with Client-side Preview */}
          <div className="rw-form-group full">
            <label className="rw-label">Optional Photo Verification</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <label className="rw-btn rw-btn-secondary" style={{ cursor: 'pointer' }}>
                <Camera size={16} />
                <span>Upload Photo Preview</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {photoPreview && (
                <button
                  type="button"
                  className="rw-btn rw-btn-secondary rw-btn-sm"
                  onClick={() => setPhotoPreview(null)}
                  style={{ color: '#dc2626' }}
                >
                  <Trash2 size={14} />
                  <span>Remove photo</span>
                </button>
              )}
            </div>

            {photoPreview && (
              <div style={{ marginTop: '0.5rem' }}>
                <img
                  src={photoPreview}
                  alt="Citizen report preview"
                  style={{
                    maxHeight: '140px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="submit"
            className="rw-btn rw-btn-primary"
            disabled={isSubmitting}
            style={{ minWidth: '160px' }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Citizen Report'}
          </button>
        </div>
      </form>
    </div>
  );
};
