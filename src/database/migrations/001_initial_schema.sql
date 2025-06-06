
-- Community Health Supply Management System Database Schema
-- Initial Migration Script

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'user')) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create counties table
CREATE TABLE IF NOT EXISTS counties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE
);

-- Create sub_counties table
CREATE TABLE IF NOT EXISTS sub_counties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    county_id UUID NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
    UNIQUE(name, county_id)
);

-- Create wards table
CREATE TABLE IF NOT EXISTS wards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sub_county_id UUID NOT NULL REFERENCES sub_counties(id) ON DELETE CASCADE,
    UNIQUE(name, sub_county_id)
);

-- Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
    facility_code VARCHAR(50) UNIQUE,
    type VARCHAR(100),
    UNIQUE(name, ward_id)
);

-- Create community_units table
CREATE TABLE IF NOT EXISTS community_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_unit_name VARCHAR(255) NOT NULL,
    county_id UUID NOT NULL REFERENCES counties(id),
    sub_county_id UUID NOT NULL REFERENCES sub_counties(id),
    ward_id UUID NOT NULL REFERENCES wards(id),
    link_facility_id UUID NOT NULL REFERENCES facilities(id),
    cha_name VARCHAR(255) NOT NULL,
    total_chps INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id)
);

-- Create commodity_categories table
CREATE TABLE IF NOT EXISTS commodity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

-- Create commodities table
CREATE TABLE IF NOT EXISTS commodities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category_id UUID NOT NULL REFERENCES commodity_categories(id),
    unit_of_measure VARCHAR(50) NOT NULL,
    description TEXT
);

-- Create commodity_records table
CREATE TABLE IF NOT EXISTS commodity_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_unit_id UUID NOT NULL REFERENCES community_units(id) ON DELETE CASCADE,
    commodity_id UUID NOT NULL REFERENCES commodities(id),
    quantity_expired INTEGER DEFAULT 0,
    quantity_damaged INTEGER DEFAULT 0,
    stock_on_hand INTEGER DEFAULT 0,
    quantity_issued INTEGER DEFAULT 0,
    excess_quantity_returned INTEGER DEFAULT 0,
    quantity_consumed INTEGER DEFAULT 0,
    closing_balance INTEGER DEFAULT 0,
    last_restock_date TIMESTAMP WITH TIME ZONE,
    stock_out_date TIMESTAMP WITH TIME ZONE,
    consumption_period INTEGER,
    record_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create commodity_stock_history table
CREATE TABLE IF NOT EXISTS commodity_stock_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_unit_id UUID NOT NULL REFERENCES community_units(id) ON DELETE CASCADE,
    commodity_id UUID NOT NULL REFERENCES commodities(id),
    previous_balance INTEGER NOT NULL,
    new_balance INTEGER NOT NULL,
    quantity_changed INTEGER NOT NULL,
    change_type VARCHAR(20) CHECK (change_type IN ('restock', 'issue', 'return', 'adjustment', 'expired', 'damaged')) NOT NULL,
    record_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recorded_by UUID NOT NULL REFERENCES users(id),
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_units_county ON community_units(county_id);
CREATE INDEX IF NOT EXISTS idx_community_units_sub_county ON community_units(sub_county_id);
CREATE INDEX IF NOT EXISTS idx_community_units_ward ON community_units(ward_id);
CREATE INDEX IF NOT EXISTS idx_community_units_facility ON community_units(link_facility_id);

CREATE INDEX IF NOT EXISTS idx_commodity_records_community_unit ON commodity_records(community_unit_id);
CREATE INDEX IF NOT EXISTS idx_commodity_records_commodity ON commodity_records(commodity_id);
CREATE INDEX IF NOT EXISTS idx_commodity_records_date ON commodity_records(record_date);

CREATE INDEX IF NOT EXISTS idx_stock_history_community_unit ON commodity_stock_history(community_unit_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_commodity ON commodity_stock_history(commodity_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_date ON commodity_stock_history(record_date);

-- Create views for common queries
CREATE OR REPLACE VIEW community_units_with_location AS
SELECT 
    cu.*,
    c.name as county_name,
    sc.name as sub_county_name,
    w.name as ward_name,
    f.name as facility_name,
    f.facility_code
FROM community_units cu
JOIN counties c ON cu.county_id = c.id
JOIN sub_counties sc ON cu.sub_county_id = sc.id
JOIN wards w ON cu.ward_id = w.id
JOIN facilities f ON cu.link_facility_id = f.id;

CREATE OR REPLACE VIEW current_stock_levels AS
SELECT 
    cr.community_unit_id,
    cr.commodity_id,
    cu.community_unit_name,
    co.name as commodity_name,
    cc.name as category_name,
    cr.stock_on_hand,
    cr.closing_balance,
    cr.last_restock_date,
    cr.stock_out_date,
    cr.record_date
FROM commodity_records cr
JOIN community_units cu ON cr.community_unit_id = cu.id
JOIN commodities co ON cr.commodity_id = co.id
JOIN commodity_categories cc ON co.category_id = cc.id
WHERE cr.record_date = (
    SELECT MAX(record_date) 
    FROM commodity_records cr2 
    WHERE cr2.community_unit_id = cr.community_unit_id 
    AND cr2.commodity_id = cr.commodity_id
);
