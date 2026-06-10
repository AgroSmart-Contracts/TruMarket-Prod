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

import { EmailRich, type EmailRichProps } from './email-rich-template';
import { Email, EmailProps } from './email-template';
import { Notification } from './notifications.entities';
import { NotificationsRepository } from './notifications.repository';
import { SubscriptionsService } from './subscriptions.service';

export type NotificationDeliveryContext = {
  eventName: string;
  mailType?: string;
  entityId?: string;
  extra?: Record<string, unknown>;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(providers.NotificationsRepository)
    private readonly repo: NotificationsRepository,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly userService: UsersService,
  ) {}

  private logDelivery(
    ctx: NotificationDeliveryContext | undefined,
    step: string,
    data?: Record<string, unknown>,
  ) {
    logger.info(
      {
        ...(ctx || {}),
        step,
        ...data,
      },
      ctx?.eventName ? `notification:${ctx.eventName}` : 'notification',
    );
  }

  private async sendMailWithLogging(options: {
    to: string;
    subject: string;
    html: string;
    mailType: string;
    ctx?: NotificationDeliveryContext;
  }): Promise<void> {
    const { to, subject, html, mailType, ctx } = options;
    this.logDelivery(ctx, 'sendMail_started', {
      emailRecipient: to,
      emailSubject: subject,
      mailType,
    });
    logger.debug(
      {
        ...(ctx || {}),
        recipientEmail: to,
        subject,
        mailType,
      },
      'mailer.sendMail: debug (pre-send)',
    );
    try {
      await this.mailerService.sendMail({ to, subject, html });
      this.logDelivery(ctx, 'sendMail_succeeded', {
        emailRecipient: to,
        emailSubject: subject,
        mailType,
      });
    } catch (err) {
      this.logDelivery(ctx, 'sendMail_failed', {
        emailRecipient: to,
        emailSubject: subject,
        mailType,
        err,
      });
      throw err;
    }
  }

  /**
   * In-app notifications + optional email, respecting per-user notification settings when `notificationKey` is set.
   * When `notificationKey` is undefined, always delivers desktop push (if registered) + email (legacy behavior).
   */
  async _sendNotification(
    recipients: string[],
    email: EmailProps,
    notificationKey: keyof NotificationsSettings | undefined,
    ctx?: NotificationDeliveryContext,
  ) {
    const mailType = email.mailType || 'legacy_simple_template';
    try {
      this.logDelivery(ctx, 'bulk_in_app_create_started', {
        recipientCount: recipients.length,
        notificationType: notificationKey ?? 'always_all_channels',
        emailSubject: email.actionTitle,
        mailType,
      });
      const notifications = await this.repo.bulkCreateByRecipent(recipients, {
        message: email.descriptionText,
        subject: email.actionTitle,
        redirectUrl: email.buttonHref,
        dealId: email.agreementId,
      });
      this.logDelivery(ctx, 'bulk_in_app_create_succeeded', {
        createdCount: notifications.length,
        mailType,
      });

      let usersByEmail: Record<string, User> = {};

      if (notificationKey) {
        const users = await this.userService.findByEmails(recipients);

        usersByEmail = (users || []).reduce((acc, user) => {
          acc[user.email] = user;
          return acc;
        }, {});
      }

      await Promise.all(
        notifications.map(async (notification) => {
          const user: User = usersByEmail[notification.userId];

          if (!notificationKey || !usersByEmail[notification.userId]) {
            this.logDelivery(ctx, 'in_app_push_started', {
              recipientEmail: notification.userId,
              mailType,
            });
            try {
              await this.subscriptionsService.send(
                notification.userId,
                notification,
              );
              this.logDelivery(ctx, 'in_app_push_succeeded', {
                recipientEmail: notification.userId,
              });
            } catch (err) {
              this.logDelivery(ctx, 'in_app_push_failed', {
                recipientEmail: notification.userId,
                err,
              });
            }
            await this.sendMailWithLogging({
              to: notification.userId,
              subject: email.actionTitle,
              html: render(Email(email)),
              mailType,
              ctx,
            });
            return;
          }

          if (user?.desktopNotifications?.[notificationKey]) {
            this.logDelivery(ctx, 'in_app_push_started', {
              recipientEmail: notification.userId,
              mailType,
            });
            try {
              await this.subscriptionsService.send(
                notification.userId,
                notification,
              );
              this.logDelivery(ctx, 'in_app_push_succeeded', {
                recipientEmail: notification.userId,
              });
            } catch (err) {
              this.logDelivery(ctx, 'in_app_push_failed', {
                recipientEmail: notification.userId,
                err,
              });
            }
          } else {
            this.logDelivery(ctx, 'in_app_push_skipped', {
              recipientEmail: notification.userId,
              reason: 'desktop_notifications_disabled_for_key',
              notificationKey,
            });
          }

          if (user?.emailNotifications?.[notificationKey]) {
            await this.sendMailWithLogging({
              to: notification.userId,
              subject: email.actionTitle,
              html: render(Email(email)),
              mailType,
              ctx,
            });
          } else {
            this.logDelivery(ctx, 'email_skipped', {
              recipientEmail: notification.userId,
              reason: 'email_notifications_disabled_for_key',
              notificationKey,
            });
          }
        }),
      );
    } catch (e) {
      this.logDelivery(ctx, 'notification_pipeline_failed', {
        err: e,
        mailType,
      });
      logger.error(e, 'Error sending notification');
    }
  }

  async sendRichEmailOnly(
    to: string,
    props: EmailRichProps,
    ctx: NotificationDeliveryContext & { mailType: string },
  ): Promise<void> {
    await this.sendMailWithLogging({
      to,
      subject: props.title,
      html: render(EmailRich(props)),
      mailType: ctx.mailType,
      ctx,
    });
  }

  async sendInAppOnly(
    recipients: string[],
    partial: {
      message: string;
      subject: string;
      redirectUrl: string;
      dealId: string;
    },
    ctx: NotificationDeliveryContext,
  ): Promise<void> {
    this.logDelivery(ctx, 'in_app_only_create_started', {
      recipientCount: recipients.length,
    });
    try {
      const notifications = await this.repo.bulkCreateByRecipent(
        recipients,
        partial,
      );
      this.logDelivery(ctx, 'in_app_only_create_succeeded', {
        createdCount: notifications.length,
      });
      await Promise.all(
        notifications.map(async (n) => {
          this.logDelivery(ctx, 'in_app_only_push_started', {
            recipientEmail: n.userId,
          });
          try {
            await this.subscriptionsService.send(n.userId, n);
            this.logDelivery(ctx, 'in_app_only_push_succeeded', {
              recipientEmail: n.userId,
            });
          } catch (err) {
            this.logDelivery(ctx, 'in_app_only_push_failed', {
              recipientEmail: n.userId,
              err,
            });
          }
        }),
      );
    } catch (err) {
      this.logDelivery(ctx, 'in_app_only_failed', { err });
      throw err;
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

  /**
   * Buyer bank account approved (OSN ACTIVE). Rich email + in-app (always-on channels).
   */
  async sendBankAccountApprovedBuyerEmail(
    recipientEmail: string,
    params: {
      userName: string;
      bankName: string;
      currency: string;
      accountLast4: string;
    },
  ): Promise<void> {
    const link = `${config.appDomain}/dashboard/account-details`;
    const props: EmailRichProps = {
      previewText: 'Your bank account has been approved',
      title: 'Your bank account has been approved',
      greeting: `Hello ${params.userName},`,
      paragraphs: [
        `Your bank account ending in ${params.accountLast4} has been approved and is now active in TruMarket.`,
        'You can now use this bank account for payments.',
      ],
      detailTitle: 'Bank Details',
      details: [
        { label: 'Bank name: ', value: params.bankName },
        { label: 'Currency: ', value: params.currency.toUpperCase() },
        { label: 'Account ending in: ', value: params.accountLast4 },
      ],
      buttonText: 'View bank accounts',
      buttonHref: link,
    };
    await this.sendRichEmailOnly(recipientEmail, props, {
      eventName: 'bank_account_approved_email',
      mailType: 'bank_account_approved',
      entityId: recipientEmail,
    });
  }

  async sendBankAccountApprovedBuyerInApp(
    recipientEmail: string,
  ): Promise<void> {
    const link = `${config.appDomain}/dashboard/account-details`;
    await this.sendInAppOnly(
      [recipientEmail],
      {
        subject: 'Your bank account has been approved',
        message:
          'Your bank account has been approved and is now active in TruMarket. You can now use this bank account for payments.',
        redirectUrl: link,
        dealId: '',
      },
      {
        eventName: 'bank_account_approved_in_app',
        entityId: recipientEmail,
      },
    );
  }

  async sendDealCreatedNotification(
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

  private paymentDetailsLink(dealId: string): string {
    return `${config.appDomain}/dashboard/shipment-details/${dealId}`;
  }

  async sendPaymentInitiatedSupplier(
    supplierEmail: string,
    opts: {
      dealId: string;
      recipientName: string;
      amount: number;
      currency: string;
      transactionId: string;
    },
  ): Promise<void> {
    const link = this.paymentDetailsLink(opts.dealId);
    const props: EmailRichProps = {
      previewText: 'A payment has been initiated for your deal',
      title: 'A payment has been initiated for your deal',
      greeting: `Hello ${opts.recipientName},`,
      paragraphs: [
        'A payment has been initiated for your deal in TruMarket.',
        'Please start preparing and uploading the required documents so the process can continue smoothly.',
      ],
      detailTitle: 'Transfer Details',
      details: [
        {
          label: 'Amount: ',
          value: `${opts.amount} ${opts.currency.toUpperCase()}`,
        },
        { label: 'Transaction ID: ', value: opts.transactionId },
      ],
      buttonText: 'View payment details',
      buttonHref: link,
    };
    await this.sendInAppOnly(
      [supplierEmail],
      {
        subject: props.title,
        message: props.paragraphs.join(' '),
        redirectUrl: link,
        dealId: opts.dealId,
      },
      { eventName: 'payment_initiated_supplier_in_app', entityId: opts.dealId },
    );
    await this.sendRichEmailOnly(supplierEmail, props, {
      eventName: 'payment_initiated_supplier_email',
      mailType: 'payment_initiated_supplier',
      entityId: opts.dealId,
    });
  }

  async sendPaymentInitiatedAdmin(
    adminEmail: string,
    opts: {
      dealId: string;
      adminName: string;
      buyerName: string;
      supplierName: string;
      amount: number;
      currency: string;
      transactionId: string;
    },
  ): Promise<void> {
    const link = this.paymentDetailsLink(opts.dealId);
    const props: EmailRichProps = {
      previewText: 'Payment initiated and awaiting buyer confirmation',
      title: 'Payment initiated and awaiting buyer confirmation',
      greeting: `Hello ${opts.adminName},`,
      paragraphs: [
        'A new payment has been initiated in TruMarket.',
        'The buyer has started the payment flow. The next step is waiting for the buyer’s transfer confirmation / proof, followed by payment confirmation.',
      ],
      detailTitle: 'Payment Details',
      details: [
        { label: 'Buyer: ', value: opts.buyerName },
        { label: 'Supplier: ', value: opts.supplierName },
        {
          label: 'Amount: ',
          value: `${opts.amount} ${opts.currency.toUpperCase()}`,
        },
        { label: 'Transaction ID: ', value: opts.transactionId },
      ],
      buttonText: 'View payment details',
      buttonHref: link,
    };
    await this.sendInAppOnly(
      [adminEmail],
      {
        subject: props.title,
        message: props.paragraphs.join(' '),
        redirectUrl: link,
        dealId: opts.dealId,
      },
      { eventName: 'payment_initiated_admin_in_app', entityId: opts.dealId },
    );
    await this.sendRichEmailOnly(adminEmail, props, {
      eventName: 'payment_initiated_admin_email',
      mailType: 'payment_initiated_admin',
      entityId: opts.dealId,
    });
  }

  async sendBuyerTransferProofSubmittedAdminInApp(
    adminEmails: string[],
    opts: { dealId: string; buyerName: string; transactionId: string },
  ): Promise<void> {
    const link = this.paymentDetailsLink(opts.dealId);
    await this.sendInAppOnly(
      adminEmails,
      {
        subject: 'Buyer submitted transfer proof',
        message: `${opts.buyerName} submitted a transfer reference / proof for payment ${opts.transactionId}. Please verify and process the payment.`,
        redirectUrl: link,
        dealId: opts.dealId,
      },
      {
        eventName: 'buyer_transfer_proof_admin_in_app',
        entityId: opts.dealId,
        extra: { transactionId: opts.transactionId },
      },
    );
  }

  async sendBuyerTransferProofVerifyingEmail(
    buyerEmail: string,
    opts: {
      dealId: string;
      senderName: string;
      amount: number;
      currency: string;
      fees: string;
      recipientName: string;
      transactionId: string;
    },
  ): Promise<void> {
    const link = this.paymentDetailsLink(opts.dealId);
    const props: EmailRichProps = {
      previewText: 'We are verifying your payment',
      title: 'We are verifying your payment',
      greeting: `Hello ${opts.senderName},`,
      paragraphs: [
        `We are verifying your transfer of ${opts.amount} ${opts.currency.toUpperCase()} to ${opts.recipientName}.`,
        'We have received your payment proof. We are verifying your payment with our Hong Kong bank. This typically takes 1-2 hours. You’ll receive an email as soon as we confirm receipt.',
      ],
      detailTitle: 'Transfer Details',
      details: [
        {
          label: 'Amount: ',
          value: `${opts.amount} ${opts.currency.toUpperCase()}`,
        },
        { label: 'Fees: ', value: opts.fees },
        { label: 'Transaction ID: ', value: opts.transactionId },
      ],
      buttonText: 'View transfer details',
      buttonHref: link,
    };
    await this.sendRichEmailOnly(buyerEmail, props, {
      eventName: 'buyer_transfer_proof_verifying_email',
      mailType: 'buyer_proof_verifying',
      entityId: opts.dealId,
    });
  }

  async sendOsnDepositCompletedBuyerEmail(
    buyerEmail: string,
    opts: {
      dealId: string;
      senderName: string;
      amount: number;
      currency: string;
      fees: string;
      recipientName: string;
      transactionId: string;
    },
  ): Promise<void> {
    const link = this.paymentDetailsLink(opts.dealId);
    const props: EmailRichProps = {
      previewText: 'Payment confirmed — processing onward',
      title: 'Payment confirmed — processing onward',
      greeting: `Hello ${opts.senderName},`,
      paragraphs: [
        `${opts.amount} ${opts.currency.toUpperCase()} is now on the way to ${opts.recipientName}.`,
        `We confirm we have received ${opts.amount} ${opts.currency.toUpperCase()}. We are now transferring this amount to ${opts.recipientName}.`,
      ],
      detailTitle: 'Transfer Details',
      details: [
        {
          label: 'Amount: ',
          value: `${opts.amount} ${opts.currency.toUpperCase()}`,
        },
        { label: 'Fees: ', value: opts.fees },
        { label: 'Transaction ID: ', value: opts.transactionId },
      ],
      buttonText: 'View transfer details',
      buttonHref: link,
    };
    await this.sendRichEmailOnly(buyerEmail, props, {
      eventName: 'osn_deposit_completed_buyer_email',
      mailType: 'hk_payment_confirmed_processing',
      entityId: opts.dealId,
    });
  }

  async sendOsnDepositCompletedBuyerInApp(
    buyerEmail: string,
    opts: { dealId: string; transactionId: string },
  ): Promise<void> {
    const link = this.paymentDetailsLink(opts.dealId);
    await this.sendInAppOnly(
      [buyerEmail],
      {
        subject: 'Payment confirmed',
        message:
          'We have received your payment and are processing it onward. You will receive an email with details.',
        redirectUrl: link,
        dealId: opts.dealId,
      },
      {
        eventName: 'osn_deposit_completed_buyer_in_app',
        entityId: opts.dealId,
      },
    );
  }

  async sendOsnDepositCompletedAdminInApp(
    adminEmails: string[],
    opts: { dealId: string; transactionId: string },
  ): Promise<void> {
    const link = this.paymentDetailsLink(opts.dealId);
    await this.sendInAppOnly(
      adminEmails,
      {
        subject: 'Payment confirmed',
        message: `OSN reports payment ${opts.transactionId} as completed. Please continue processing as needed.`,
        redirectUrl: link,
        dealId: opts.dealId,
      },
      {
        eventName: 'osn_deposit_completed_admin_in_app',
        entityId: opts.dealId,
      },
    );
  }

  async sendOsnDepositCompletedSupplierEmailAndInApp(
    supplierEmail: string,
    opts: {
      dealId: string;
      recipientName: string;
      amount: number;
      currency: string;
      transactionId: string;
    },
  ): Promise<void> {
    const link = this.paymentDetailsLink(opts.dealId);
    const props: EmailRichProps = {
      previewText: 'Payment received — please complete document upload',
      title: 'Payment received — please complete document upload',
      greeting: `Hello ${opts.recipientName},`,
      paragraphs: [
        'The payment for your deal has been received by TruMarket.',
        'Please complete uploading the required documents so the process can continue.',
      ],
      detailTitle: 'Transfer Details',
      details: [
        {
          label: 'Amount: ',
          value: `${opts.amount} ${opts.currency.toUpperCase()}`,
        },
        { label: 'Transaction ID: ', value: opts.transactionId },
      ],
      buttonText: 'View payment details',
      buttonHref: link,
    };
    await this.sendInAppOnly(
      [supplierEmail],
      {
        subject: props.title,
        message: props.paragraphs.join(' '),
        redirectUrl: link,
        dealId: opts.dealId,
      },
      {
        eventName: 'osn_deposit_completed_supplier_in_app',
        entityId: opts.dealId,
      },
    );
    await this.sendRichEmailOnly(supplierEmail, props, {
      eventName: 'osn_deposit_completed_supplier_email',
      mailType: 'payment_received_supplier',
      entityId: opts.dealId,
    });
  }

  async sendSupplierDocumentsVerifiedEmailAndInApp(
    supplierEmail: string,
    opts: {
      dealId: string;
      recipientName: string;
      amount: number;
      currency: string;
      transactionId: string;
    },
  ): Promise<void> {
    const link = this.paymentDetailsLink(opts.dealId);
    const props: EmailRichProps = {
      previewText: 'Your documents are verified',
      title: 'Your documents are verified',
      greeting: `Hello ${opts.recipientName},`,
      paragraphs: [
        'Your documents have been verified successfully.',
        'You can now request transfer of the funds to your bank account in TruMarket.',
      ],
      detailTitle: 'Transfer Details',
      details: [
        {
          label: 'Amount: ',
          value: `${opts.amount} ${opts.currency.toUpperCase()}`,
        },
        { label: 'Transaction ID: ', value: opts.transactionId },
      ],
      buttonText: 'View payment details',
      buttonHref: link,
    };
    await this.sendInAppOnly(
      [supplierEmail],
      {
        subject: props.title,
        message: props.paragraphs.join(' '),
        redirectUrl: link,
        dealId: opts.dealId,
      },
      {
        eventName: 'supplier_documents_verified_in_app',
        entityId: opts.dealId,
      },
    );
    await this.sendRichEmailOnly(supplierEmail, props, {
      eventName: 'supplier_documents_verified_email',
      mailType: 'documents_verified_request_transfer',
      entityId: opts.dealId,
    });
  }

  async sendSupplierPayoutSentEmailAndInApp(
    supplierEmail: string,
    opts: {
      dealId: string;
      recipientName: string;
      amount: number;
      currency: string;
      transactionId: string;
    },
  ): Promise<void> {
    const link = this.paymentDetailsLink(opts.dealId);
    const props: EmailRichProps = {
      previewText: 'Your payment is on the way to your bank account',
      title: 'Your payment is on the way to your bank account',
      greeting: `Hello ${opts.recipientName},`,
      paragraphs: [
        'Your payment has been sent to your bank account from TruMarket’s Peruvian bank account.',
        'You should receive the funds soon, depending on your bank’s processing time.',
      ],
      detailTitle: 'Transfer Details',
      details: [
        {
          label: 'Amount: ',
          value: `${opts.amount} ${opts.currency.toUpperCase()}`,
        },
        { label: 'Transaction ID: ', value: opts.transactionId },
      ],
      buttonText: 'View payment details',
      buttonHref: link,
    };
    await this.sendInAppOnly(
      [supplierEmail],
      {
        subject: props.title,
        message: props.paragraphs.join(' '),
        redirectUrl: link,
        dealId: opts.dealId,
      },
      { eventName: 'supplier_payout_sent_in_app', entityId: opts.dealId },
    );
    await this.sendRichEmailOnly(supplierEmail, props, {
      eventName: 'supplier_payout_sent_email',
      mailType: 'money_sent_peru_bank',
      entityId: opts.dealId,
    });
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
