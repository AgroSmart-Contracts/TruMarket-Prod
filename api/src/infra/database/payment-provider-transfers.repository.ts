import { Injectable } from '@nestjs/common';

import { PaymentProviderTransfersRepository } from '@/payments/provider-transfers.repository';

import { PaymentProviderTransfer } from '../../payments/provider-transfers.entities';
import { MongooseRepository } from './repository.mongoose';
import { PaymentProviderTransfersModel } from './payment-provider-transfers.model';

@Injectable()
export class PaymentProviderTransfersMongooseRepository
  extends MongooseRepository<PaymentProviderTransfer>
  implements PaymentProviderTransfersRepository
{
  constructor() {
    super(PaymentProviderTransfersModel);
  }
}

