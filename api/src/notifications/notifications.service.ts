import { Inject, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { render } from '@react-email/components';

import { config } from '@/config';
import { providers } from '@/constants';
import { Deal, Milestone } from '@/deals/deals.entities';
import { logger } from '@/logger';
import { Page } from '@/types';
import { NotificationsSettings, User } from '@/users/users.entities';
import { UsersService } from '@/users/users.service';

import { Email, EmailProps } from './email-template';
import { Notification } from './notifications.entities';
import { NotificationsRepository } from './notifications.repository';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(providers.NotificationsRepository)
    private readonly repo: NotificationsRepository,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly userService: UsersService,
  ) {}

  async _sendNotification(
    recipients: string[],
    email: EmailProps,
    notificationKey: keyof NotificationsSettings,
  ) {
    try {
      const notifications = await this.repo.bulkCreateByRecipent(recipients, {
        message: email.descriptionText,
        subject: email.actionTitle,
        redirectUrl: email.buttonHref,
        dealId: email.agreementId,
      });

      let usersByEmail = {};

      if (notificationKey) {
        const users = await this.userService.findByEmails(recipients);

        usersByEmail = users.reduce((acc, user) => {
          acc[user.email] = user;
          return acc;
        }, {});
      }

      await Promise.all(
        notifications.map(async (notification) => {
          const user: User = usersByEmail[notification.userId];

          if (!notificationKey || !usersByEmail[notification.userId]) {
            await this.subscriptionsService.send(
              notification.userId,
              notification,
            );
            await this.mailerService.sendMail({
              to: notification.userId,
              subject: email.actionTitle,
              html: render(Email(email)),
            });
            return;
          }

          if (user?.desktopNotifications?.[notificationKey]) {
            await this.subscriptionsService.send(
              notification.userId,
              notification,
            );
          }

          if (user?.emailNotifications?.[notificationKey]) {
            await this.mailerService.sendMail({
              to: notification.userId,
              subject: email.actionTitle,
              html: render(Email(email)),
            });
          }
        }),
      );
    } catch (e) {
      logger.error(e, 'Error sending email', e);
    }
  }

  async sendInviteToSignupNotification(
    recipients: string[],
    deal: Deal,
    email: string,
  ): Promise<void> {
    await this._sendNotification(
      recipients,
      {
        agreementId: deal.id,
        actionTitle: 'Agreement assigned to you',
        descriptionText: `${email} assigned you to the '${deal.name}' shipment agreement in the TruMarket platform. Click the button below to create an account and review the agreement.`,
        buttonText: 'Create account',
        buttonHref: config.appDomain,
      },
      undefined,
    );
  }

  async sendAccountCreatedNotification(recipient: string): Promise<void> {
    await this._sendNotification(
      [recipient],
      {
        agreementId: '',
        actionTitle: 'Account created',
        descriptionText: 'Your account has been successfully created.',
        buttonText: 'Go to TruMarket application',
        buttonHref: config.appDomain,
      },
      undefined,
    );
  }

  async sendNewProposalNotification(
    recipients: string[],
    deal: Deal,
    email: string,
  ): Promise<void> {
    await this._sendNotification(
      recipients,
      {
        agreementId: deal.id,
        actionTitle: 'Agreement assigned to you',
        descriptionText: `${email} assigned you to the '${deal.name}' shipment agreement.`,
        buttonText: 'Review the agreement',
        buttonHref: `${config.appDomain}/dashboard/agreement-details/${deal.id}`,
      },
      'assignedDeal',
    );
  }

  async sendChangesInProposalNotification(
    recipients: string[],
    deal: Deal,
    email: string,
  ): Promise<void> {
    await this._sendNotification(
      recipients,
      {
        agreementId: deal.id,
        actionTitle: 'Changes requested',
        descriptionText: `${email} requested changes in the '${deal.name}' shipment agreement.`,
        buttonText: 'Review the agreement',
        buttonHref: `${config.appDomain}/dashboard/agreement-details/${deal.id}`,
      },
      'submittedDealChanges',
    );
  }

  async sendMilestoneApprovalRequestNotification(
    recipients: string[],
    deal: Deal,
    milestone: Milestone,
    email: string,
  ): Promise<void> {
    await this._sendNotification(
      recipients,
      {
        agreementId: deal.id,
        actionTitle: 'Milestone approval requested',
        descriptionText: `${email} requested your approval of the '${milestone.description}' milestone of the '${deal.name}' shipment.`,
        buttonHref: `${config.appDomain}/dashboard/shipment-details/${deal.id}`,
        buttonText: 'Go to the milestone',
      },
      'supplierRequestedMilestoneApproval',
    );
  }

  async sendNewMilestoneDocumentUploadedNotification(
    recipients: string[],
    deal: Deal,
    milestone: Milestone,
    email: string,
  ): Promise<void> {
    await this._sendNotification(
      recipients,
      {
        agreementId: deal.id,
        actionTitle: 'New document',
        descriptionText: `${email} added new document to '${milestone.description}' milestone of the '${deal.name}' shipment.`,
        buttonText: 'Go to the milestone',
        buttonHref: `${config.appDomain}/dashboard/shipment-details/${deal.id}`,
      },
      'supplierUploadedDocument',
    );
  }

  async sendMilestoneDocumentDeletedNotification(
    recipients: string[],
    deal: Deal,
    milestone: Milestone,
    email: string,
  ): Promise<void> {
    await this._sendNotification(
      recipients,
      {
        agreementId: deal.id,
        actionTitle: 'Document deleted',
        descriptionText: `${email} deleted a document in the '${milestone.description}' milestone of the '${deal.name}' shipment.`,
        buttonHref: `${config.appDomain}/dashboard/shipment-details/${deal.id}`,
        buttonText: 'Go to the milestone',
      },
      'supplierDeletedDocument',
    );
  }

  async sendMilestoneApprovedNotification(
    recipients: string[],
    deal: Deal,
    milestone: Milestone,
    email: string,
  ): Promise<void> {
    await this._sendNotification(
      recipients,
      {
        agreementId: deal.id,
        actionTitle: 'Milestone approved',
        descriptionText: `The '${milestone.description}' milestone of the '${deal.name}' shipment has been approved by ${email}.`,
        buttonText: 'Go to the milestone',
        buttonHref: `${config.appDomain}/dashboard/shipment-details/${deal.id}`,
      },
      'buyerApprovedMilestone',
    );
  }

  async sendMilestoneDeniedNotification(
    recipients: string[],
    deal: Deal,
    milestone: Milestone,
    email: string,
  ): Promise<void> {
    await this._sendNotification(
      recipients,
      {
        agreementId: deal.id,
        actionTitle: 'Milestone denied',
        descriptionText: `The '${milestone.description}' milestone of the '${deal.name}' shipment has been denied by ${email}. Contact him directly for the details.`,
        buttonText: 'Go to the milestone',
        buttonHref: `${config.appDomain}/dashboard/shipment-details/${deal.id}`,
      },
      'buyerDeniedMilestone',
    );
  }

  async sendDealConfirmedNotification(
    recipients: string[],
    deal: Deal,
  ): Promise<void> {
    await this._sendNotification(
      recipients,
      {
        agreementId: deal.id,
        actionTitle: 'Agreement accepted',
        descriptionText: `All parties accepted the '${deal.name}' shipment agreement. The shipment is ready to get started!`,
        buttonText: 'Go to shipment',
        buttonHref: `${config.appDomain}/dashboard/shipment-details/${deal.id}`,
      },
      'confirmedDeal',
    );
  }

  async sendDealCompletedNotification(
    recipients: string[],
    deal: Deal,
  ): Promise<void> {
    await this._sendNotification(
      recipients,
      {
        agreementId: deal.id,
        actionTitle: 'Agreement accepted',
        descriptionText: `The '${deal.name}' shipment arrived to the destination. The agreement is completed!`,
        buttonText: 'Go to shipment',
        buttonHref: `${config.appDomain}/dashboard/shipment-details/${deal.id}`,
      },
      'completedDeal',
    );
  }

  async sendProposalCancelledNotification(
    recipients: string[],
    deal: Deal,
    email: string,
  ): Promise<void> {
    await this._sendNotification(
      recipients,
      {
        agreementId: deal.id,
        actionTitle: 'Agreement acceptance cancelled',
        descriptionText: `${email} cancelled his acceptance for the '${deal.name}' shipment agreement. Contact him directly for the details.`,
        buttonText: 'Go to agreement',
        buttonHref: `${config.appDomain}/dashboard`,
      },
      'cancelledDeal',
    );
  }

  async findNotificationsByEmail(
    email: string,
    offset: number,
  ): Promise<Page<Notification>> {
    return this.repo.paginate({ userId: email }, offset, null, {
      sort: { createdAt: -1 },
    });
  }

  async markAsRead(email: string, notificationId: string): Promise<void> {
    await this.repo.markAsRead(email, notificationId);
  }

  async markAsReadByDealId(email: string, dealId: string): Promise<void> {
    await this.repo.markAsReadByDealId(email, dealId);
  }
}
