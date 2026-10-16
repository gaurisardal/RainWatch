export type UserRole = 'citizen' | 'response_team';

export type RiskCategory = 'low' | 'moderate' | 'high';

export type ForecastWindow = '1h' | '3h' | '6h';

export interface Location {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  drainageCapacity: 'Poor' | 'Moderate' | 'Adequate';
  elevationProfile: 'Depression / Low-lying' | 'Flat Plain' | 'Elevated Gradient';
  pastWaterloggingHistory: 'Chronic (Monsoon hotspot)' | 'Occasional severe' | 'Rare';
}

export interface ContributingFactors {
  drainage: string;
  lowElevation: string;
  rainfallIntensity: string;
  pastWaterlogging: string;
}

export interface RiskForecast {
  locationId: string;
  window: ForecastWindow;
  score: number; // 0 - 100
  category: RiskCategory;
  rainfallEstimateMm: number;
  contributingFactors: ContributingFactors;
  uncertaintyMargin: number; // e.g. 8 => ±8%
  timestamp: string;
  isDemoEstimate: true;
}

export interface CitizenReport {
  id: string;
  locationName: string;
  lat: number;
  lng: number;
  description: string;
  waterDepthCm?: number;
  photoUrl?: string;
  timestamp: string;
  status: 'Pending' | 'Under Review' | 'Verified' | 'Resolved';
  verifiedIncidentId?: string;
}

export interface Incident {
  id: string;
  locationName: string;
  lat: number;
  lng: number;
  severity: 'Moderate' | 'High' | 'Critical';
  confirmedBy: string;
  confirmedAt: string;
  sourceReportId?: string;
  notes: string;
  status: 'Active' | 'Under Control' | 'Resolved';
}

export interface RouteWarning {
  id: string;
  roadName: string;
  stretch: string;
  riskLevel: 'Moderate' | 'High';
  advisory: string;
  suggestedAlternative?: string;
  isDemoData: true;
}

export interface InspectionPriorityItem {
  location: Location;
  currentForecast: RiskForecast;
  nearbyReportCount: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Under Review' | 'Resolved';
}
