import { Injectable } from '@nestjs/common';

import { TruMarketSettingsRepository } from '@/settings/trumarket-settings.repository';

import { TruMarketSettings } from '../../settings/trumarket-settings.entities';
import { MongooseRepository } from './repository.mongoose';
import { TruMarketSettingsModel } from './trumarket-settings.model';

@Injectable()
export class TruMarketSettingsMongooseRepository
  extends MongooseRepository<TruMarketSettings>
  implements TruMarketSettingsRepository
{
  constructor() {
    super(TruMarketSettingsModel);
  }
}

