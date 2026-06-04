import mongoose, { Document, Schema } from 'mongoose';

export interface IUserDevice extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  deviceName?: string;
  platform?: string;
  browser?: string;
  ipAddress?: string;
  lastActiveAt: Date;
  trusted: boolean;
}

const userDeviceSchema = new Schema<IUserDevice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: String, required: true },
    deviceName: String,
    platform: String,
    browser: String,
    ipAddress: String,
    lastActiveAt: { type: Date, default: Date.now },
    trusted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export const UserDevice = mongoose.model<IUserDevice>('UserDevice', userDeviceSchema);
