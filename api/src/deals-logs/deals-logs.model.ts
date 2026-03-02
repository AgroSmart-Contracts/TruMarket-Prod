import * as mongoose from 'mongoose';

// Define the interface for DealsLogs document
export interface IDealsLogs extends mongoose.Document {
  dealId: number;
  event: string;
  args: any;
  blockNumber: number;
  blockTimestamp: Date;
  txHash: string;
  message: string;
}

// Define the Mongoose Schema for DealsLogs
const DealsLogsSchema = new mongoose.Schema({
  dealId: {
    type: Number,
    required: true,
  },
  event: {
    type: String,
    required: true,
  },
  args: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  blockNumber: {
    type: Number,
    required: true,
  },
  blockTimestamp: {
    type: Date,
    required: true,
  },
  txHash: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
});

// Create the Mongoose model for DealsLogs
const DealsLogs = mongoose.model<IDealsLogs>('DealsLogs', DealsLogsSchema);

export default DealsLogs;
