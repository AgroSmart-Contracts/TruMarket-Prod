import * as mongoose from 'mongoose';

export enum DealsLogsJobType {
  DealsManager = 'DealsManager',
  Vault = 'Vault',
}

// Define the interface for SyncDealsLogsJob document
interface ISyncDealsLogsJob extends mongoose.Document {
  type: string;
  contract: string;
  lastBlock: number;
  lastExecution: Date;
  lastStatus: string;
  active: boolean;
  dealId?: number;
}

// Define the Mongoose Schema for SyncDealsLogsJob
const SyncDealsLogsJobSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  contract: {
    type: String,
    required: true,
  },
  lastBlock: {
    type: Number,
    default: 0,
  },
  lastExecution: {
    type: Date,
  },
  lastStatus: {
    type: String,
  },
  error: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
  dealId: {
    type: Number,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the Mongoose model for SyncDealsLogsJob
const SyncDealsLogsJob = mongoose.model<ISyncDealsLogsJob>(
  'SyncDealsLogsJob',
  SyncDealsLogsJobSchema,
);

export default SyncDealsLogsJob;
