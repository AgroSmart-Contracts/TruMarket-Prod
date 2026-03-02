import { Injectable } from '@nestjs/common';
import { UpdateQuery } from 'mongoose';

import {
  Deal,
  DealLog,
  DealStatus,
  DocumentFile,
  Milestone,
  MilestoneApprovalStatus,
} from '@/deals/deals.entities';
import { DealsRepository } from '@/deals/deals.repository';
import DealsLogs from '@/deals-logs/deals-logs.model';
import { NotFoundError } from '@/errors';
import { MongooseRepository } from '@/infra/database/repository.mongoose';

import DealModel from './deals.model';

export interface FindByUserQuery {
  status?: DealStatus;
}

@Injectable()
export class DealsMongooseRepository
  extends MongooseRepository<Deal>
  implements DealsRepository
{
  constructor() {
    super(DealModel);
  }

  async findByUser(userId: string, query: FindByUserQuery): Promise<Deal[]> {
    return (
      await this.find(
        {
          $or: [{ 'buyers.id': userId }, { 'suppliers.id': userId }],
          ...query,
        },
        null,
        {
          sort: { createdAt: -1 },
        },
      )
    ) // Sort by creation date in descending order
      .map((deal) => {
        deal.milestones = deal.milestones.map((m) => {
          return {
            ...m,
            docs: m.docs.map((d) => {
              d.seen = d.seenByUsers ? d.seenByUsers.includes(userId) : false;
              delete d.seenByUsers;
              return {
                ...d,
              };
            }),
          };
        });

        const participant = deal.buyers.find((b) => b.id === userId);
        if (participant) {
          if (participant.new) {
            deal.new = true;
          }
        } else {
          const participant = deal.suppliers.find((s) => s.id === userId);
          if (participant.new) {
            deal.new = true;
          }
        }

        return deal;
      });
  }

  async findByEmail(email: string): Promise<Deal> {
    return this.findOne({ email });
  }

  async pushDocument(
    dealId: string,
    document: { url: string; description: string; seenByUsers: string[] },
  ): Promise<DocumentFile> {
    const deal = await DealModel.findByIdAndUpdate(
      dealId,
      {
        $push: { docs: document },
      },
      { new: true },
    );

    return deal.docs[deal.docs.length - 1];
  }

  async pullDocument(dealId: string, docId: string): Promise<DocumentFile> {
    const deal = await DealModel.findByIdAndUpdate(
      dealId,
      {
        $pull: { docs: { _id: docId } },
      },
      { new: true },
    );

    return deal.docs[deal.docs.length - 1];
  }

  async pushMilestoneDocument(
    dealId: string,
    milestoneId: string,
    document: { url: string; description: string; seenByUsers: string[] },
  ): Promise<DocumentFile> {
    const deal = await DealModel.findOneAndUpdate(
      { _id: dealId, 'milestones._id': milestoneId },
      {
        $set: { newDocuments: true },
        $push: { 'milestones.$.docs': document },
      },
      { new: true },
    );

    const milestone = deal.milestones.find(
      (m) => m.toJSON().id === milestoneId,
    );

    if (!milestone) {
      throw new NotFoundError('milestone not found');
    }

    const doc = milestone.docs.pop();

    return doc.toJSON();
  }

  async upadteMilestoneStatus(
    dealId: string,
    milestoneId: string,
    approvalStatus: MilestoneApprovalStatus,
  ): Promise<Milestone> {
    const update: UpdateQuery<Deal> = {
      $set: { 'milestones.$.approvalStatus': approvalStatus },
    };

    if (approvalStatus === MilestoneApprovalStatus.Approved) {
      update.$inc = { currentMilestone: 1 };
    }

    const deal = await DealModel.findOneAndUpdate(
      { _id: dealId, 'milestones._id': milestoneId },
      update,
      { new: true },
    );

    const milestone = deal.milestones.find(
      (m) => m.toJSON().id === milestoneId,
    );

    if (!milestone) {
      throw new NotFoundError('milestone not found');
    }

    return milestone.toJSON();
  }

  async updateMilestoneDocument(
    dealId: string,
    milestoneId: string,
    docId: string,
    key: string,
    value: string | boolean,
  ): Promise<DocumentFile> {
    const deal = await DealModel.findOneAndUpdate(
      {
        _id: dealId,
        'milestones.docs._id': docId,
      },
      {
        $set: { [`milestones.$.docs.$[doc].${key}`]: value },
      },
      { new: true, arrayFilters: [{ 'doc._id': docId }] },
    );

    const dealJson = deal.toJSON();

    const milestone = dealJson.milestones.find((m) => m.id === milestoneId);

    const doc = milestone.docs.find((d) => d.id === docId);

    return doc;
  }

  async setMilestoneDocumentAsViewed(
    dealId: string,
    milestoneId: string,
    docId: string,
    userId: string,
  ): Promise<DocumentFile> {
    const deal = await DealModel.findOneAndUpdate(
      {
        _id: dealId,
        'milestones.docs._id': docId,
      },
      {
        $addToSet: { 'milestones.$.docs.$[doc].seenByUsers': userId },
      },
      { new: true, arrayFilters: [{ 'doc._id': docId }] },
    );

    const dealJson = deal.toJSON();

    const milestone = dealJson.milestones.find((m) => m.id === milestoneId);

    const doc = milestone.docs.find((d) => d.id === docId);

    return doc;
  }

  async pullMilestoneDocument(
    dealId: string,
    milestoneId: string,
    docId: string,
  ): Promise<void> {
    await DealModel.findOneAndUpdate(
      { _id: dealId, 'milestones._id': milestoneId },
      {
        $pull: { 'milestones.$.docs': { _id: docId } },
      },
      { new: true },
    );
  }

  async assignUserToDeals(
    userId: string,
    userEmail: string,
    walletAddress: string,
  ): Promise<void> {
    await DealModel.updateMany(
      { 'buyers.email': userEmail },
      {
        $set: { 'buyers.$.id': userId },
        'buyers.$.walletAddress': walletAddress,
      },
    );
    await DealModel.updateMany(
      { 'suppliers.email': userEmail },
      {
        $set: {
          'suppliers.$.id': userId,
          'suppliers.$.walletAddress': walletAddress,
        },
      },
    );
  }

  async findDealsLogs(dealId: number): Promise<DealLog[]> {
    const logs = await DealsLogs.find({ dealId });
    return logs.map((l) => l.toJSON());
  }
}
