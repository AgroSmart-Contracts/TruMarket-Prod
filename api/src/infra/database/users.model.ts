import mongoose, { Schema } from 'mongoose';

import {
  AccountType,
  BankDetails,
  RoleType,
  User,
  WalletType,
} from '@/users/users.entities';

const NotificationsSettingsSchema: Schema = new Schema(
  {
    assignedDeal: { type: Boolean, default: true },
    submittedDealChanges: { type: Boolean, default: true },
    confirmedDeal: { type: Boolean, default: true },
    cancelledDeal: { type: Boolean, default: true },
    completedDeal: { type: Boolean, default: true },
    buyerApprovedMilestone: { type: Boolean, default: true },
    buyerDeniedMilestone: { type: Boolean, default: true },
    supplierUploadedDocument: { type: Boolean, default: true },
    supplierDeletedDocument: { type: Boolean, default: true },
    supplierRequestedMilestoneApproval: { type: Boolean, default: true },
    supplierCancelledMilestoneApproval: { type: Boolean, default: true },
  },
  { _id: false },
);

const companySchema = new Schema({
  name: String,
  country: String,
  taxId: String,
});

const bankDetailsSchema = new Schema<BankDetails>(
  {
    beneficiaryName: { type: String, required: true },
    country: { type: String },
    addressLine1: { type: String },
    city: { type: String },
    postalCode: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    swiftCode: { type: String },
  },
  { _id: false },
);

companySchema.set('toJSON', {
  transform: function (doc, ret) {
    return ret;
  },
});

const UserSchema: Schema = new Schema({
  email: { type: String, unique: true, sparse: true },
  accountType: {
    type: String,
    enum: Object.values(AccountType),
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    sparse: true,
  },
  walletType: {
    type: String,
    enum: Object.values(WalletType),
    default: WalletType.EVM,
    required: true,
  },
  role: {
    type: Number,
    enum: RoleType,
    default: 0,
  },
  kycVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
  desktopNotifications: {
    type: NotificationsSettingsSchema,
  },
  emailNotifications: {
    type: NotificationsSettingsSchema,
  },
  isBankLinked: {
    type: Boolean,
    default: false,
  },
  bankDetails: {
    type: bankDetailsSchema,
    required: false,
  },
  company: {
    type: companySchema,
    required: false,
  },
});

UserSchema.set('toJSON', {
  transform: function (doc: any, ret) {
    ret.id = doc._id.toString();

    delete ret.__v;
  },
});

const UserModel = mongoose.model<User>('User', UserSchema);

export default UserModel;
