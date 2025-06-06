
// Database Configuration and Connection Setup
// This file provides database connection utilities and configuration

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  max_connections?: number;
  connection_timeout?: number;
}

// Environment-based configuration
export const getDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'community_health_supply',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    max_connections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    connection_timeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
  };
};

// Connection string builder for different database systems
export const buildConnectionString = (config: DatabaseConfig): string => {
  const { host, port, database, username, password, ssl } = config;
  const sslParam = ssl ? '?sslmode=require' : '';
  return `postgresql://${username}:${password}@${host}:${port}/${database}${sslParam}`;
};

// Supabase configuration (when using Supabase)
export interface SupabaseConfig {
  url: string;
  anon_key: string;
  service_role_key?: string;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  return {
    url: process.env.VITE_SUPABASE_URL || '',
    anon_key: process.env.VITE_SUPABASE_ANON_KEY || '',
    service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  };
};

// Database table names enum for type safety
export enum TableNames {
  USERS = 'users',
  COUNTIES = 'counties',
  SUB_COUNTIES = 'sub_counties',
  WARDS = 'wards',
  FACILITIES = 'facilities',
  COMMUNITY_UNITS = 'community_units',
  COMMODITY_CATEGORIES = 'commodity_categories',
  COMMODITIES = 'commodities',
  COMMODITY_RECORDS = 'commodity_records',
  COMMODITY_STOCK_HISTORY = 'commodity_stock_history',
}

// Common database operations
export interface QueryOptions {
  limit?: number;
  offset?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Error types for database operations
export enum DatabaseErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  QUERY_ERROR = 'QUERY_ERROR',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export interface DatabaseError {
  type: DatabaseErrorType;
  message: string;
  details?: any;
  query?: string;
}

// Transaction types
export type TransactionCallback<T> = () => Promise<T>;

export interface TransactionOptions {
  isolation_level?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  timeout?: number;
}
