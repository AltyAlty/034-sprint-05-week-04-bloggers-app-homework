export const USER_VALIDATION_CONSTRAINTS = {
  ID: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  LOGIN: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 10,
    MATCHES: /^[a-zA-Z0-9_-]*$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 20,
  },
  PASSWORD_HASH: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 1000,
  },
  EMAIL: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 1000,
    MATCHES: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  },
  CONFIRMATION_REGISTRATION_CODE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    MATCHES: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  },
  PASSWORD_RECOVERY_CODE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    MATCHES: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  },
};
