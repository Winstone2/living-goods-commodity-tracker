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
    DELETE: (id: number) => `/users/${id}`
  },
  COMMODITIES: {
    LIST: '/commodities',
    CREATE: '/records',
    
  },
COMMUNITY_UNITS:{
    CREATE:'/community-units',
    LIST:'/community-units',
}
} as const;