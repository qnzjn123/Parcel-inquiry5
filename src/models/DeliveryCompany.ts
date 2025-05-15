import mongoose, { Schema, Document } from 'mongoose';

export interface IDeliveryCompany extends Document {
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

const DeliveryCompanySchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  trackingUrl: { type: String, required: true },
  logoUrl: { type: String },
  companyInfoUrl: { type: String, default: '' },
  trackingNumberUrl: { type: String, default: '' },
  deliveryTimeUrl: { type: String, default: '' },
  currentLocationUrl: { type: String, default: '' },
  statusUrl: { type: String, default: '' },
  apiKey: { type: String, default: '' },
  apiKeyUrl: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.DeliveryCompany || 
  mongoose.model<IDeliveryCompany>('DeliveryCompany', DeliveryCompanySchema); 