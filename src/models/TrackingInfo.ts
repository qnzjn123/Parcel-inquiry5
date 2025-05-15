import mongoose, { Schema, Document } from 'mongoose';

export interface ITrackingInfo extends Document {
  company: Schema.Types.ObjectId;
  trackingNumber: string;
  status: string;
  currentLocation: string;
  lastUpdated: Date;
  history: {
    time: Date;
    location: string;
    status: string;
    description?: string;
  }[];
}

const TrackingInfoSchema: Schema = new Schema({
  company: { 
    type: Schema.Types.ObjectId, 
    ref: 'DeliveryCompany', 
    required: true 
  },
  trackingNumber: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    required: true,
    enum: ['발송준비중', '집화완료', '배송중', '배송완료', '배송실패']
  },
  currentLocation: { 
    type: String 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  history: [{
    time: { 
      type: Date, 
      required: true 
    },
    location: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    }
  }]
}, { timestamps: true });

// 회사 코드와 운송장 번호의 조합은 고유해야 함
TrackingInfoSchema.index({ company: 1, trackingNumber: 1 }, { unique: true });

export default mongoose.models.TrackingInfo || 
  mongoose.model<ITrackingInfo>('TrackingInfo', TrackingInfoSchema); 