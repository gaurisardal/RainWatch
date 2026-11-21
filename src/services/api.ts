import { Location, RiskForecast, ForecastWindow, CitizenReport, Incident, RouteWarning, InspectionPriorityItem } from '../types';

const API_BASE = '/api'; // proxied by Vite to FastAPI backend

export const RainWatchApi = {
  async getLocations(): Promise<Location[]> {
    const res = await fetch(`${API_BASE}/locations`);
    if (!res.ok) throw new Error('Failed to fetch locations');
    return res.json();
  },

  async getForecasts(window: ForecastWindow = '1h'): Promise<Record<string, RiskForecast>> {
    const res = await fetch(`${API_BASE}/forecasts/${window}`);
    if (!res.ok) throw new Error('Failed to fetch forecasts');
    return res.json();
  },

  async getCitizenReports(): Promise<CitizenReport[]> {
    const res = await fetch(`${API_BASE}/citizen_reports`);
    if (!res.ok) throw new Error('Failed to fetch citizen reports');
    return res.json();
  },

  async submitCitizenReport(newReportData: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>): Promise<CitizenReport> {
    const res = await fetch(`${API_BASE}/citizen_reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReportData),
    });
    if (!res.ok) throw new Error('Failed to submit citizen report');
    return res.json();
  },

  async updateReportStatus(reportId: string, status: CitizenReport['status']): Promise<CitizenReport> {
    const res = await fetch(`${API_BASE}/citizen_reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update report status');
    return res.json();
  },

  async getIncidents(): Promise<Incident[]> {
    const res = await fetch(`${API_BASE}/incidents`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async verifyReportAsIncident(reportId: string, officerName: string = 'Duty Officer (Demo)', severity: Incident['severity'] = 'High', notes: string = 'Verified on site via emergency check.') {
    const params = new URLSearchParams({ officer_name: officerName, severity, notes });
    const res = await fetch(`${API_BASE}/incidents/verify/${reportId}?${params.toString()}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to verify report as incident');
    return res.json();
  },

  async updateIncidentStatus(incidentId: string, status: Incident['status']): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update incident status');
    return res.json();
  },

  async getRouteWarnings(): Promise<RouteWarning[]> {
    const res = await fetch(`${API_BASE}/route_warnings`);
    if (!res.ok) throw new Error('Failed to fetch route warnings');
    return res.json();
  },

  async getInspectionPriorities(window: ForecastWindow = '1h'): Promise<InspectionPriorityItem[]> {
    const res = await fetch(`${API_BASE}/inspection_priorities/${window}`);
    if (!res.ok) throw new Error('Failed to fetch inspection priorities');
    return res.json();
  },

  async updateInspectionStatus(locationId: string, status: 'Pending' | 'Under Review' | 'Resolved') {
    const res = await fetch(`${API_BASE}/inspection_status/${locationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update inspection status');
    return res.json();
  },

  async resetDemoData() {
    const res = await fetch(`${API_BASE}/reset_demo`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },
};
