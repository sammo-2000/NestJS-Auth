export const PROVIDERS = {
  account: 'ACCOUNT_REPOSITORY',
  role: 'ROLE_REPOSITORY',
};

export const DATA_SOURCE = 'DATA_SOURCE';

export const CONFIG = {
  auth: {
    saltOrRounds: 12,
    jwtExpires: '7d' as const,
  },
};
