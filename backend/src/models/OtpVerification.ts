import mongoose, { Document, Schema } from 'mongoose';

export type OtpPurpose =
  | 'email_verify'
  | 'phone_verify'
  | 'whatsapp_verify'
  | 'password_reset'
  | 'login_2fa'
  | 'login_otp';

export interface IOtpVerification extends Document {
  userId?: mongoose.Types.ObjectId;
  email?: string;
  phone?: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
}

const otpSchema = new Schema<IOtpVerification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    email: String,
    phone: String,
    purpose: {
      type: String,
      enum: ['email_verify', 'phone_verify', 'whatsapp_verify', 'password_reset', 'login_2fa', 'login_otp'],
      required: true,
    },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpVerification = mongoose.model<IOtpVerification>('OtpVerification', otpSchema);
