import { RoleType } from '@/users/users.entities';

import { PaymentsService } from './payments.service';

describe('PaymentsService notifications', () => {
  const makeService = () => {
    const payments = {
      findById: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      updateById: jest.fn(),
      create: jest.fn(),
    } as any;

    const deals = {
      findById: jest.fn(),
    } as any;

    const providerTransfers = {
      findById: jest.fn(),
      find: jest.fn(),
      updateById: jest.fn(),
      create: jest.fn(),
    } as any;

    const bankAccounts = {} as any;

    const osnService = {
      createMintRequest: jest.fn(),
      vetSettlementRequest: jest.fn(),
      submitMintRequest: jest.fn(),
      getPaymentHistoryStatus: jest.fn(),
    } as any;

    const osnRuntimeSettings = {
      getOsnRuntimeSettings: jest.fn(),
    } as any;

    const notifications = {
      sendPaymentInitiatedSupplier: jest.fn(),
      sendPaymentInitiatedAdmin: jest.fn(),
      sendBuyerTransferProofSubmittedAdminInApp: jest.fn(),
      sendBuyerTransferProofVerifyingEmail: jest.fn(),
      sendOsnDepositCompletedBuyerEmail: jest.fn(),
      sendOsnDepositCompletedBuyerInApp: jest.fn(),
      sendOsnDepositCompletedAdminInApp: jest.fn(),
      sendOsnDepositCompletedSupplierEmailAndInApp: jest.fn(),
      sendSupplierDocumentsVerifiedEmailAndInApp: jest.fn(),
      sendSupplierPayoutSentEmailAndInApp: jest.fn(),
    } as any;

    const users = {
      findById: jest.fn(),
      findByRole: jest.fn(),
      findByEmail: jest.fn(),
    } as any;
    const pdfClassification = {
      shouldClassify: jest.fn(),
      classifyAndExtractTradePdf: jest.fn(),
      classifyPeruDrawbackPdf: jest.fn(),
    } as any;

    const service = new PaymentsService(
      payments,
      deals,
      providerTransfers,
      bankAccounts,
      osnService,
      osnRuntimeSettings,
      notifications,
      users,
      pdfClassification,
    );

    return {
      service,
      payments,
      deals,
      providerTransfers,
      notifications,
      users,
      osnService,
    };
  };

  it('payment initiated notifications are idempotent (second call skipped)', async () => {
    const {
      service,
      payments,
      deals,
      providerTransfers,
      notifications,
      users,
    } = makeService();

    payments.update.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    payments.findById.mockResolvedValue({
      id: 'p1',
      dealId: 'd1',
      buyerId: 'b1',
      supplierId: 's1',
      supplierEmail: 'sup@example.com',
      amount: 100,
      currency: 'USD',
      activeProviderTransferId: 't1',
    });
    deals.findById.mockResolvedValue({ id: 'd1', name: 'Deal' });
    users.findById
      .mockResolvedValueOnce({
        id: 'b1',
        email: 'buyer@example.com',
        company: { name: 'Buyer Co' },
      })
      .mockResolvedValueOnce({
        id: 's1',
        email: 'sup@example.com',
        company: { name: 'Sup Co' },
      });
    providerTransfers.findById.mockResolvedValue({
      providerPaymentId: 'osn_pay_1',
    });
    users.findByRole.mockResolvedValue([
      { email: 'admin@example.com', role: RoleType.ADMIN },
    ]);

    await (service as any).handlePaymentInitiatedNotifications('p1');
    await (service as any).handlePaymentInitiatedNotifications('p1');

    expect(notifications.sendPaymentInitiatedSupplier).toHaveBeenCalledTimes(1);
    expect(notifications.sendPaymentInitiatedAdmin).toHaveBeenCalledTimes(1);
  });

  it('does not send admin payment-initiated email when admin is the same address as supplier', async () => {
    const { service, payments, deals, notifications, users } = makeService();

    payments.update.mockResolvedValueOnce(1);
    payments.findById.mockResolvedValue({
      id: 'p1',
      dealId: 'd1',
      buyerId: 'b1',
      supplierId: 's1',
      supplierEmail: 'sup@example.com',
      amount: 100,
      currency: 'USD',
    });
    deals.findById.mockResolvedValue({ id: 'd1', name: 'Deal' });
    users.findById
      .mockResolvedValueOnce({
        id: 'b1',
        email: 'buyer@example.com',
        company: { name: 'Buyer Co' },
      })
      .mockResolvedValueOnce({
        id: 's1',
        email: 'sup@example.com',
        company: { name: 'Sup Co' },
      });
    users.findByRole.mockResolvedValue([
      { email: 'sup@example.com', role: RoleType.ADMIN },
    ]);

    await (service as any).handlePaymentInitiatedNotifications('p1');

    expect(notifications.sendPaymentInitiatedSupplier).toHaveBeenCalledTimes(1);
    expect(notifications.sendPaymentInitiatedAdmin).not.toHaveBeenCalled();
  });

  it('OSN deposit completed side effects are skipped when all flags already set', async () => {
    const { service, payments, deals, notifications, users } = makeService();

    const donePayment = {
      id: 'p1',
      dealId: 'd1',
      buyerId: 'b1',
      supplierId: 's1',
      supplierEmail: 'sup@example.com',
      amount: 100,
      currency: 'USD',
      osnDepositBuyerNotifiedAt: new Date(),
      osnDepositAdminNotifiedAt: new Date(),
      osnDepositSupplierNotifiedAt: new Date(),
    };
    payments.findById.mockResolvedValue(donePayment);

    const did = await (service as any).applyOsnDepositCompleted(
      donePayment,
      { providerPaymentId: 'x' } as any,
      { status: 'completed', payment_type: 'bank_to_wallet' } as any,
    );

    expect(did).toBe(false);
    expect(
      notifications.sendOsnDepositCompletedBuyerEmail,
    ).not.toHaveBeenCalled();
    expect(deals.findById).not.toHaveBeenCalled();
    expect(users.findById).not.toHaveBeenCalled();
  });

  it('syncOsnPaymentStatusesFromProvider does not duplicate deposit notifications', async () => {
    const {
      service,
      payments,
      deals,
      providerTransfers,
      notifications,
      users,
      osnService,
    } = makeService();

    providerTransfers.find.mockResolvedValue([
      { id: 'tr1', paymentId: 'p1', providerPaymentId: 'osn_pay_1' },
    ]);
    osnService.getPaymentHistoryStatus.mockResolvedValue({
      status: 'completed',
      payment_type: 'bank_to_wallet',
      payment_id: 'osn_pay_1',
    });

    const pState: any = {
      id: 'p1',
      dealId: 'd1',
      buyerId: 'b1',
      supplierId: 's1',
      supplierEmail: 'sup@example.com',
      amount: 100,
      currency: 'USD',
      feeQuote: { totalFee: 2 },
    };
    payments.findById.mockImplementation(async () => ({ ...pState }));

    deals.findById.mockResolvedValue({ id: 'd1' });
    users.findById.mockImplementation(async (id: string) => {
      if (id === 'b1') return { id: 'b1', email: 'buyer@example.com' };
      if (id === 's1') return { id: 's1', email: 'sup@example.com' };
      return undefined;
    });
    users.findByRole.mockResolvedValue([{ email: 'admin@example.com' }]);
    providerTransfers.updateById.mockResolvedValue({});
    payments.updateById.mockImplementation(async (_id: string, data: any) => {
      Object.assign(pState, data);
      return pState;
    });

    await service.syncOsnPaymentStatusesFromProvider();
    await service.syncOsnPaymentStatusesFromProvider();

    expect(osnService.getPaymentHistoryStatus).toHaveBeenCalledWith(
      'osn_pay_1',
    );
    expect(
      notifications.sendOsnDepositCompletedBuyerEmail,
    ).toHaveBeenCalledTimes(1);
  });
});
