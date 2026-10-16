import {
  Location,
  RiskForecast,
  ForecastWindow,
  CitizenReport,
  Incident,
  RouteWarning,
  InspectionPriorityItem,
} from '../types';
import {
  SAMPLE_LOCATIONS,
  SAMPLE_FORECASTS,
  INITIAL_CITIZEN_REPORTS,
  INITIAL_INCIDENTS,
  SAMPLE_ROUTE_WARNINGS,
} from '../data/sampleData';

const STORAGE_KEYS = {
  REPORTS: 'rainwatch_citizen_reports_v1',
  INCIDENTS: 'rainwatch_incidents_v1',
  CUSTOM_FORECASTS: 'rainwatch_custom_forecasts_v1',
  INSPECTION_STATUS: 'rainwatch_inspection_status_v1',
};

// Distance calculation using Haversine formula (meters)
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function getStoredReports(): CitizenReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_CITIZEN_REPORTS));
      return INITIAL_CITIZEN_REPORTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse stored reports, using fallback', err);
    return INITIAL_CITIZEN_REPORTS;
  }
}

function saveStoredReports(reports: CitizenReport[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to save reports to localStorage', err);
  }
}

function getStoredIncidents(): Incident[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(INITIAL_INCIDENTS));
      return INITIAL_INCIDENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to parse stored incidents, using fallback', err);
    return INITIAL_INCIDENTS;
  }
}

function saveStoredIncidents(incidents: Incident[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  } catch (err) {
    console.error('Failed to save incidents to localStorage', err);
  }
}

function getStoredInspectionStatus(): Record<string, 'Pending' | 'Under Review' | 'Resolved'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSPECTION_STATUS);
    if (!raw) {
      // Default statuses for locations
      const defaults: Record<string, 'Pending' | 'Under Review' | 'Resolved'> = {
        'pune-loc-01': 'Under Review',
        'pune-loc-02': 'Pending',
        'pune-loc-03': 'Pending',
        'pune-loc-08': 'Under Review',
      };
      localStorage.setItem(STORAGE_KEYS.INSPECTION_STATUS, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveInspectionStatus(statuses: Record<string, 'Pending' | 'Under Review' | 'Resolved'>) {
  try {
    localStorage.setItem(STORAGE_KEYS.INSPECTION_STATUS, JSON.stringify(statuses));
  } catch (err) {
    console.error('Failed to save inspection statuses', err);
  }
}

/**
 * RainWatch Mock / LocalStorage Service Layer
 * Designed to mirror future RESTful API endpoints from a Python FastAPI backend.
 */
export const RainWatchApi = {
  async getLocations(): Promise<Location[]> {
    return [...SAMPLE_LOCATIONS];
  },

  async getForecasts(window: ForecastWindow = '1h'): Promise<Record<string, RiskForecast>> {
    const result: Record<string, RiskForecast> = {};
    for (const [locId, forecastMap] of Object.entries(SAMPLE_FORECASTS)) {
      result[locId] = forecastMap[window];
    }
    return result;
  },

  async getCitizenReports(): Promise<CitizenReport[]> {
    return getStoredReports();
  },

  async submitCitizenReport(
    newReportData: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>
  ): Promise<CitizenReport> {
    const reports = getStoredReports();
    const newReport: CitizenReport = {
      ...newReportData,
      id: `rep-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'Pending',
    };
    const updated = [newReport, ...reports];
    saveStoredReports(updated);
    return newReport;
  },

  async updateReportStatus(
    reportId: string,
    status: CitizenReport['status']
  ): Promise<CitizenReport> {
    const reports = getStoredReports();
    const index = reports.findIndex((r) => r.id === reportId);
    if (index === -1) {
      throw new Error(`Report not found with id ${reportId}`);
    }
    reports[index] = { ...reports[index], status };
    saveStoredReports(reports);
    return reports[index];
  },

  async getIncidents(): Promise<Incident[]> {
    return getStoredIncidents();
  },

  async verifyReportAsIncident(
    reportId: string,
    officerName: string = 'Duty Officer (Demo)',
    severity: Incident['severity'] = 'High',
    notes: string = 'Verified on site via emergency check.'
  ): Promise<{ incident: Incident; updatedReport: CitizenReport }> {
    const reports = getStoredReports();
    const repIndex = reports.findIndex((r) => r.id === reportId);
    if (repIndex === -1) {
      throw new Error(`Report not found with id ${reportId}`);
    }

    const report = reports[repIndex];
    const newIncidentId = `inc-${Date.now()}`;
    const newIncident: Incident = {
      id: newIncidentId,
      locationName: report.locationName,
      lat: report.lat,
      lng: report.lng,
      severity,
      confirmedBy: officerName,
      confirmedAt: new Date().toISOString(),
      sourceReportId: report.id,
      notes,
      status: 'Active',
    };

    const incidents = getStoredIncidents();
    saveStoredIncidents([newIncident, ...incidents]);

    reports[repIndex] = {
      ...report,
      status: 'Verified',
      verifiedIncidentId: newIncidentId,
    };
    saveStoredReports(reports);

    return { incident: newIncident, updatedReport: reports[repIndex] };
  },

  async updateIncidentStatus(
    incidentId: string,
    status: Incident['status']
  ): Promise<Incident> {
    const incidents = getStoredIncidents();
    const index = incidents.findIndex((i) => i.id === incidentId);
    if (index === -1) {
      throw new Error(`Incident not found with id ${incidentId}`);
    }
    incidents[index] = { ...incidents[index], status };
    saveStoredIncidents(incidents);
    return incidents[index];
  },

  async getRouteWarnings(): Promise<RouteWarning[]> {
    return [...SAMPLE_ROUTE_WARNINGS];
  },

  async getInspectionPriorities(
    window: ForecastWindow = '1h'
  ): Promise<InspectionPriorityItem[]> {
    const locations = await this.getLocations();
    const forecasts = await this.getForecasts(window);
    const reports = getStoredReports();
    const statuses = getStoredInspectionStatus();

    const items: InspectionPriorityItem[] = locations.map((loc) => {
      const forecast = forecasts[loc.id] || {
        locationId: loc.id,
        window,
        score: 40,
        category: 'low',
        rainfallEstimateMm: 10,
        contributingFactors: {
          drainage: 'Normal',
          lowElevation: 'Standard',
          rainfallIntensity: 'Mild',
          pastWaterlogging: 'Low',
        },
        uncertaintyMargin: 10,
        timestamp: new Date().toISOString(),
        isDemoEstimate: true,
      };

      // Count reports within ~500m (0.5 km)
      const nearbyCount = reports.filter((r) => {
        // filter out dismissed or resolved
        if (r.status === 'Resolved') return false;
        const dist = calculateDistanceMeters(loc.lat, loc.lng, r.lat, r.lng);
        return dist <= 600; // ~500m radius with margin
      }).length;

      // Priority calculation: combines risk score + nearby citizen reports + history
      let priority: InspectionPriorityItem['priority'] = 'Low';
      const effectiveScore = forecast.score + nearbyCount * 12;

      if (effectiveScore >= 80 || forecast.score >= 85) {
        priority = 'Critical';
      } else if (effectiveScore >= 65 || forecast.score >= 70) {
        priority = 'High';
      } else if (effectiveScore >= 45 || forecast.score >= 50) {
        priority = 'Medium';
      }

      const status = statuses[loc.id] || (priority === 'Critical' ? 'Pending' : 'Pending');

      return {
        location: loc,
        currentForecast: forecast,
        nearbyReportCount: nearbyCount,
        priority,
        status,
      };
    });

    // Rank by priority order: Critical -> High -> Medium -> Low, then by score descending
    const orderMap: Record<InspectionPriorityItem['priority'], number> = {
      Critical: 0,
      High: 1,
      Medium: 2,
      Low: 3,
    };

    items.sort((a, b) => {
      const pDiff = orderMap[a.priority] - orderMap[b.priority];
      if (pDiff !== 0) return pDiff;
      return b.currentForecast.score - a.currentForecast.score;
    });

    return items;
  },

  async updateInspectionStatus(
    locationId: string,
    status: 'Pending' | 'Under Review' | 'Resolved'
  ): Promise<void> {
    const statuses = getStoredInspectionStatus();
    statuses[locationId] = status;
    saveInspectionStatus(statuses);
  },

  async resetDemoData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.INSPECTION_STATUS);
  },
};
