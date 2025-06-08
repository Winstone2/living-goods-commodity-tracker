export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8082/api',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    
  },
  DASHBOARD: {
    STATS: '/dashboard/stats'
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`
  },
  COMMODITIES: {
    LIST: '/commodities',
    CREATE: '/records',
    
  },
COMMUNITY_UNITS:{
    CREATE:'/community-units'
}
} as const;