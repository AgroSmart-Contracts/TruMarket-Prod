import { Injectable } from '@nestjs/common';

import { PaymentProviderTransfersRepository } from '@/payments/provider-transfers.repository';

import { PaymentProviderTransfer } from '../../payments/provider-transfers.entities';
import { PaymentProviderTransfersModel } from './payment-provider-transfers.model';
import { MongooseRepository } from './repository.mongoose';

@Injectable()
export class PaymentProviderTransfersMongooseRepository
  extends MongooseRepository<PaymentProviderTransfer>
  implements PaymentProviderTransfersRepository
{
  constructor() {
    super(PaymentProviderTransfersModel);
  }
}
