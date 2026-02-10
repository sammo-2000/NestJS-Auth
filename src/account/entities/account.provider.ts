import { DATA_SOURCE, PROVIDERS } from 'src/constants';
import { DataSource } from 'typeorm';
import { Account } from './account.entity';

export const accountProviders = [
  {
    provide: PROVIDERS.account,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Account),
    inject: [DATA_SOURCE],
  },
];
