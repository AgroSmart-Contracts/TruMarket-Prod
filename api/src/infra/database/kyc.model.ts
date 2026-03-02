import mongoose, { Schema } from 'mongoose';

// Define the KYCVerification schema
const KYCVerificationSchema = new Schema({
  attempts: {
    type: Number,
    required: true,
    default: 0,
  },
  applicantId: {
    type: String,
    required: true,
  },
  workflowRunId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['notStarted', 'inProgress', 'complete'],
    required: true,
  },
  result: {
    type: String,
    enum: ['pass', 'fail', 'manualReview'],
    required: false,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

KYCVerificationSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = doc._id.toString();
  },
});

export { KYCVerificationSchema };

const KYCVerificationModel = mongoose.model<any>(
  'KYCVerification',
  KYCVerificationSchema,
);

export default KYCVerificationModel;
