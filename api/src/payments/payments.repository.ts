import { Repository } from '@/repository';

import { Payment } from './payments.entities';

export interface PaymentsRepository extends Repository<Payment> {}

