import { List } from "lucide-react";

export const API_CONFIG = {
BASE_URL: 'http://127.0.0.1:9000/api',
//BASE_URL:'http://16.170.239.185:9000/api',
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
    DELETE: (id: number) => `/users/${id}`,
    CHPS: '/users/chps',
    CHAS: '/users/chas',
    MAP_CHA_CHP: '/users/map-cha-chp'
  },
  COMMUNITY_UNIT: '/community-units',

  COMMODITIES: {
    LIST: '/commodities',
    CREATE: '/records',
    
  },
  COMMUNITY_UNITS: {
    CREATE: '/community-units',
    LIST: '/community-units',
  },
  CHA: {
    CHPS: (userId: number) => `/users/cha/${userId}/chps`
  }
} as const;