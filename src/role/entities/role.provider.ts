import { DATA_SOURCE, PROVIDERS } from 'src/constants';
import { DataSource } from 'typeorm';
import { Role } from './role.entity';

export const roleProviders = [
  {
    provide: PROVIDERS.role,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Role),
    inject: [DATA_SOURCE],
  },
];
