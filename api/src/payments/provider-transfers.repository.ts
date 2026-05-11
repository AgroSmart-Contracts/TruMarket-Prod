import { Repository } from '@/repository';

import { PaymentProviderTransfer } from './provider-transfers.entities';

export interface PaymentProviderTransfersRepository
  extends Repository<PaymentProviderTransfer> {}

