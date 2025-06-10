const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin@123';
const BASE_CREDENTIALS = btoa(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`);

export const AUTH_HEADER = `Basic ${BASE_CREDENTIALS}`;