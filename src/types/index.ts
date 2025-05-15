export interface DeliveryCompany {
  _id: string;
  name: string;
  code: string;
  trackingUrl: string;
  logoUrl?: string;
  companyInfoUrl: string;
  trackingNumberUrl: string;
  deliveryTimeUrl: string;
  currentLocationUrl: string;
  statusUrl: string;
  apiKey: string;
  apiKeyUrl: string;
}

export interface TrackingHistory {
  _id?: string;
  time: string | Date;
  location: string;
  status: string;
  description?: string;
}

export interface TrackingInfo {
  _id: string;
  company: DeliveryCompany;
  trackingNumber: string;
  status: string;
  currentLocation: string;
  lastUpdated: string | Date;
  history: TrackingHistory[];
  apiData?: {
    trackingBaseInfo: any;
    deliveryTimeInfo: any;
    locationInfo: any;
    statusInfo: any;
  };
} 