export const BLOG_VALIDATION_CONSTRAINTS = {
  ID: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 15,
  },
  DESCRIPTION: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
  },
  WEBSITE_URL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100,
    MATCHES: /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  },
};
