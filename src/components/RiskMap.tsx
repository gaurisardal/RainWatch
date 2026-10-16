import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Location, RiskForecast, CitizenReport, Incident, ForecastWindow } from '../types';
import { AlertTriangle, Clock, CloudRain, Droplets, Info, MapPin } from 'lucide-react';

interface RiskMapProps {
  locations: Location[];
  forecasts: Record<string, RiskForecast>;
  citizenReports: CitizenReport[];
  incidents: Incident[];
  selectedWindow: ForecastWindow;
  onWindowChange: (window: ForecastWindow) => void;
  showPredictions: boolean;
  onTogglePredictions: (val: boolean) => void;
  showReports: boolean;
  onToggleReports: (val: boolean) => void;
  showIncidents: boolean;
  onToggleIncidents: (val: boolean) => void;
  onMapLocationSelect?: (lat: number, lng: number, placeName?: string) => void;
  selectedCoord?: { lat: number; lng: number } | null;
  isLoading?: boolean;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  locations,
  forecasts,
  citizenReports,
  incidents,
  selectedWindow,
  onWindowChange,
  showPredictions,
  onTogglePredictions,
  showReports,
  onToggleReports,
  showIncidents,
  onToggleIncidents,
  onMapLocationSelect,
  selectedCoord,
  isLoading = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const selectedPinMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default Pune center: Alka Talkies / Deccan area
    const puneCenter: [number, number] = [18.5204, 73.8567];

    const map = L.map(mapContainerRef.current, {
      center: puneCenter,
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    // Dynamic tile provider: Use Google Maps only if VITE_GOOGLE_MAPS_API_KEY is provided; never block on key
    const googleMapsApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    const tileUrl = googleMapsApiKey
      ? `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${googleMapsApiKey}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileAttribution = googleMapsApiKey
      ? '&copy; Google Maps | RainWatch Pune'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | RainWatch Pune';

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: tileAttribution,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Handle map click for reporting
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (onMapLocationSelect) {
        onMapLocationSelect(parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5)));
      }
    });

    // Resize fix
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update selected click marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedPinMarkerRef.current) {
      selectedPinMarkerRef.current.remove();
      selectedPinMarkerRef.current = null;
    }

    if (selectedCoord) {
      const pinIcon = L.divIcon({
        className: 'custom-selected-pin',
        html: `
          <div style="background:#0284c7; width:22px; height:22px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 10px rgba(2,132,199,0.9); animation: pulseRisk 1.5s infinite;"></div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([selectedCoord.lat, selectedCoord.lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup('<b>Selected Pin for Citizen Report</b><br>Coordinates captured from map click.')
        .openPopup();

      selectedPinMarkerRef.current = marker;
    }
  }, [selectedCoord]);

  // Render markers whenever data or toggles change
  useEffect(() => {
    const markersGroup = markersLayerRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    // 1. Predicted Risk Locations
    if (showPredictions) {
      locations.forEach((loc) => {
        const forecast = forecasts[loc.id];
        const score = forecast ? forecast.score : 40;
        const category = forecast ? forecast.category : 'low';
        const rain = forecast ? forecast.rainfallEstimateMm : 10;
        const uncertainty = forecast ? forecast.uncertaintyMargin : 8;

        const pinClass = category === 'high' ? 'high' : category === 'moderate' ? 'mod' : 'low';

        const customIcon = L.divIcon({
          className: 'custom-risk-icon',
          html: `
            <div class="rw-pin ${pinClass}" title="${loc.name} - ${score}/100 Risk">
              <span class="rw-pin-inner">${score}</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28],
        });

        const factorsHtml = forecast
          ? `
            <div class="rw-popup-factors">
              <div class="rw-popup-factor-item"><b>Drainage:</b> ${forecast.contributingFactors.drainage}</div>
              <div class="rw-popup-factor-item"><b>Elevation:</b> ${loc.elevationProfile} (${forecast.contributingFactors.lowElevation})</div>
              <div class="rw-popup-factor-item"><b>Rainfall:</b> ~${rain} mm (${forecast.contributingFactors.rainfallIntensity})</div>
              <div class="rw-popup-factor-item"><b>History:</b> ${loc.pastWaterloggingHistory}</div>
            </div>
          `
          : '<p>Loading factor details...</p>';

        const popupContent = `
          <div class="rw-popup-container">
            <div class="rw-popup-header">
              <div class="rw-popup-title">${loc.name}</div>
              <div class="rw-popup-area">${loc.area}, Pune</div>
            </div>

            <div class="rw-popup-score-row">
              <div>
                <span class="rw-badge rw-badge-${pinClass}">${category.toUpperCase()} RISK</span>
                <span class="rw-badge rw-badge-demo" style="margin-left: 4px;">DEMO ESTIMATE</span>
              </div>
              <div style="font-weight: 800; font-size: 1.15rem; color: #0f172a;">
                ${score}<span style="font-size:0.75rem; color:#64748b;">/100</span>
              </div>
            </div>

            <div style="font-size: 0.775rem; color: #475569; margin-bottom: 0.4rem; display:flex; justify-content:space-between;">
              <span>Forecast Window: <b>${selectedWindow.toUpperCase()}</b></span>
              <span>Rainfall: <b>~${rain} mm</b></span>
            </div>

            ${factorsHtml}

            <div class="rw-popup-footer">
              <span>Uncertainty: <b>±${uncertainty}%</b></span>
              <span>Sample data</span>
            </div>
          </div>
        `;

        const marker = L.marker([loc.lat, loc.lng], { icon: customIcon });
        marker.bindPopup(popupContent, { maxWidth: 320 });
        markersGroup.addLayer(marker);
      });
    }

    // 2. Citizen Reports
    if (showReports) {
      citizenReports.forEach((rep) => {
        const isVerified = rep.status === 'Verified';
        const repIcon = L.divIcon({
          className: 'custom-rep-icon',
          html: `
            <div class="rw-pin report-marker" title="Citizen Report: ${rep.locationName}">
              <span class="rw-pin-inner">📢</span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12],
        });

        const popupContent = `
          <div class="rw-popup-container">
            <div class="rw-popup-header">
              <div class="rw-popup-title">Citizen Report</div>
              <div class="rw-popup-area">${rep.locationName}</div>
            </div>
            <div style="margin: 0.5rem 0;">
              <span class="rw-badge rw-badge-report">${rep.status}</span>
              ${rep.waterDepthCm ? `<span class="rw-badge rw-badge-demo" style="margin-left:4px;">Water: ~${rep.waterDepthCm} cm</span>` : ''}
            </div>
            <p style="font-size: 0.8rem; color: #334155; margin-bottom: 0.5rem;">
              "${rep.description}"
            </p>
            ${
              rep.photoUrl
                ? `<div style="margin-bottom:0.5rem;"><img src="${rep.photoUrl}" alt="Report photo" style="width:100%; max-height:120px; object-fit:cover; border-radius:4px; border:1px solid #cbd5e1;" /></div>`
                : ''
            }
            <div class="rw-popup-footer">
              <span>Reported: ${new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>Coords: ${rep.lat.toFixed(4)}, ${rep.lng.toFixed(4)}</span>
            </div>
          </div>
        `;

        const marker = L.marker([rep.lat, rep.lng], { icon: repIcon });
        marker.bindPopup(popupContent, { maxWidth: 300 });
        markersGroup.addLayer(marker);
      });
    }

    // 3. Confirmed Incidents
    if (showIncidents) {
      incidents.forEach((inc) => {
        const incIcon = L.divIcon({
          className: 'custom-inc-icon',
          html: `
            <div class="rw-pin incident-marker" title="Confirmed Incident: ${inc.locationName}">
              <span class="rw-pin-inner">⚠️</span>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          popupAnchor: [0, -13],
        });

        const popupContent = `
          <div class="rw-popup-container">
            <div class="rw-popup-header">
              <div class="rw-popup-title" style="color: #b91c1c;">Confirmed Incident</div>
              <div class="rw-popup-area">${inc.locationName}</div>
            </div>
            <div style="margin: 0.5rem 0;">
              <span class="rw-badge rw-badge-incident">SEVERITY: ${inc.severity.toUpperCase()}</span>
              <span class="rw-badge rw-badge-demo" style="margin-left:4px;">STATUS: ${inc.status}</span>
            </div>
            <p style="font-size: 0.8rem; color: #334155; margin-bottom: 0.5rem;">
              <b>Action / Notes:</b> ${inc.notes}
            </p>
            <div class="rw-popup-footer">
              <span>Confirmed by: <b>${inc.confirmedBy}</b></span>
              <span>${new Date(inc.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        `;

        const marker = L.marker([inc.lat, inc.lng], { icon: incIcon });
        marker.bindPopup(popupContent, { maxWidth: 300 });
        markersGroup.addLayer(marker);
      });
    }
  }, [
    locations,
    forecasts,
    citizenReports,
    incidents,
    selectedWindow,
    showPredictions,
    showReports,
    showIncidents,
  ]);

  return (
    <div className="rw-map-section">
      {/* Map Control Bar */}
      <div className="rw-map-controls-bar">
        {/* Forecast Window Filter */}
        <div className="rw-control-group">
          <span className="rw-control-label">
            <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />
            Forecast Window:
          </span>
          <div className="rw-btn-group">
            <button
              type="button"
              className={`rw-btn-pill ${selectedWindow === '1h' ? 'active' : ''}`}
              onClick={() => onWindowChange('1h')}
            >
              1-Hour Ahead
            </button>
            <button
              type="button"
              className={`rw-btn-pill ${selectedWindow === '3h' ? 'active' : ''}`}
              onClick={() => onWindowChange('3h')}
            >
              3-Hours Ahead
            </button>
            <button
              type="button"
              className={`rw-btn-pill ${selectedWindow === '6h' ? 'active' : ''}`}
              onClick={() => onWindowChange('6h')}
            >
              6-Hours Ahead
            </button>
          </div>
        </div>

        {/* Map Layers Toggles */}
        <div className="rw-control-group">
          <label className={`rw-toggle-chip ${showPredictions ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={showPredictions}
              onChange={(e) => onTogglePredictions(e.target.checked)}
            />
            <span>Predicted Risk ({locations.length})</span>
          </label>

          <label className={`rw-toggle-chip ${showReports ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={showReports}
              onChange={(e) => onToggleReports(e.target.checked)}
            />
            <span>Citizen Reports ({citizenReports.length})</span>
          </label>

          <label className={`rw-toggle-chip ${showIncidents ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => onToggleIncidents(e.target.checked)}
            />
            <span>Confirmed Incidents ({incidents.length})</span>
          </label>
        </div>
      </div>

      {/* Map Container */}
      <div className="rw-map-wrapper">
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255,255,255,0.7)',
              zIndex: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            Updating risk mapping...
          </div>
        )}

        <div ref={mapContainerRef} className="rw-map-container" />

        {/* Interactive Floating Legend */}
        <div className="rw-map-legend">
          <div className="rw-legend-title">
            <Info size={14} color="#0d9488" />
            <span>Map Legend & Layers</span>
          </div>
          <div className="rw-legend-row">
            <span className="rw-legend-dot high"></span>
            <span>High Risk (Score 75-100)</span>
          </div>
          <div className="rw-legend-row">
            <span className="rw-legend-dot mod"></span>
            <span>Moderate Risk (Score 40-74)</span>
          </div>
          <div className="rw-legend-row">
            <span className="rw-legend-dot low"></span>
            <span>Low Risk (Score 0-39)</span>
          </div>
          <div className="rw-legend-row">
            <span className="rw-legend-dot rep"></span>
            <span>📢 Citizen Report (Unverified)</span>
          </div>
          <div className="rw-legend-row">
            <span className="rw-legend-dot inc"></span>
            <span>⚠️ Confirmed Incident (Staff)</span>
          </div>
          <div
            style={{
              marginTop: '0.5rem',
              paddingTop: '0.35rem',
              borderTop: '1px solid #e2e8f0',
              fontSize: '0.7rem',
              color: '#64748b',
            }}
          >
            💡 <i>Tip: Click any location on map to set report coordinates.</i>
          </div>
        </div>
      </div>
    </div>
  );
};
