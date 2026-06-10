import { Injectable } from '@nestjs/common';

import { PaymentsRepository } from '@/payments/payments.repository';

import { Payment } from '../../payments/payments.entities';
import { PaymentsModel } from './payments.model';
import { MongooseRepository } from './repository.mongoose';

@Injectable()
export class PaymentsMongooseRepository
  extends MongooseRepository<Payment>
  implements PaymentsRepository
{
  constructor() {
    super(PaymentsModel);
  }
}
