
-- Sample Data for Community Health Supply Management System
-- This script inserts sample data for testing and development

-- Insert sample counties
INSERT INTO counties (id, name, code) VALUES
('11111111-1111-1111-1111-111111111111', 'Nairobi', 'NBI'),
('22222222-2222-2222-2222-222222222222', 'Mombasa', 'MSA'),
('33333333-3333-3333-3333-333333333333', 'Kisumu', 'KSM'),
('44444444-4444-4444-4444-444444444444', 'Nakuru', 'NKR')
ON CONFLICT (name) DO NOTHING;

-- Insert sample sub-counties
INSERT INTO sub_counties (id, name, county_id) VALUES
('11111111-1111-1111-1111-111111111112', 'Kibera', '11111111-1111-1111-1111-111111111111'),
('11111111-1111-1111-1111-111111111113', 'Mathare', '11111111-1111-1111-1111-111111111111'),
('11111111-1111-1111-1111-111111111114', 'Kasarani', '11111111-1111-1111-1111-111111111111'),
('11111111-1111-1111-1111-111111111115', 'Westlands', '11111111-1111-1111-1111-111111111111'),
('22222222-2222-2222-2222-222222222223', 'Changamwe', '22222222-2222-2222-2222-222222222222'),
('22222222-2222-2222-2222-222222222224', 'Nyali', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (name, county_id) DO NOTHING;

-- Insert sample wards
INSERT INTO wards (id, name, sub_county_id) VALUES
('11111111-1111-1111-1111-111111111116', 'Kibera East', '11111111-1111-1111-1111-111111111112'),
('11111111-1111-1111-1111-111111111117', 'Kibera West', '11111111-1111-1111-1111-111111111112'),
('11111111-1111-1111-1111-111111111118', 'Mathare North', '11111111-1111-1111-1111-111111111113'),
('11111111-1111-1111-1111-111111111119', 'Mathare South', '11111111-1111-1111-1111-111111111113'),
('11111111-1111-1111-1111-11111111111A', 'Kasarani Central', '11111111-1111-1111-1111-111111111114'),
('11111111-1111-1111-1111-11111111111B', 'Westlands Central', '11111111-1111-1111-1111-111111111115')
ON CONFLICT (name, sub_county_id) DO NOTHING;

-- Insert sample facilities
INSERT INTO facilities (id, name, ward_id, facility_code, type) VALUES
('11111111-1111-1111-1111-11111111111C', 'Kibera Health Center', '11111111-1111-1111-1111-111111111116', 'KHC001', 'Health Center'),
('11111111-1111-1111-1111-11111111111D', 'Mathare Health Center', '11111111-1111-1111-1111-111111111118', 'MHC001', 'Health Center'),
('11111111-1111-1111-1111-11111111111E', 'Kasarani Hospital', '11111111-1111-1111-1111-11111111111A', 'KAS001', 'Hospital'),
('11111111-1111-1111-1111-11111111111F', 'Westlands Clinic', '11111111-1111-1111-1111-11111111111B', 'WCL001', 'Clinic')
ON CONFLICT (facility_code) DO NOTHING;

-- Insert sample commodity categories
INSERT INTO commodity_categories (id, name, description) VALUES
('AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA', 'Antimalarials', 'Medicines used to treat malaria'),
('BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB', 'Antibiotics', 'Medicines used to treat bacterial infections'),
('CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCCC', 'ORS & Fluids', 'Oral rehydration solutions and IV fluids'),
('DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD', 'Family Planning', 'Contraceptives and family planning supplies'),
('EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEEEEEE', 'Vitamins & Supplements', 'Nutritional supplements and vitamins')
ON CONFLICT (name) DO NOTHING;

-- Insert sample commodities
INSERT INTO commodities (id, name, category_id, unit_of_measure, description) VALUES
('AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAB', 'AL 6s (Artemether-Lumefantrine)', 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA', 'Tablets', 'First-line treatment for uncomplicated malaria'),
('AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAC', 'AL 12s (Artemether-Lumefantrine)', 'AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA', 'Tablets', 'First-line treatment for uncomplicated malaria'),
('BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBB2', 'Amoxicillin 250mg', 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB', 'Capsules', 'Antibiotic for bacterial infections'),
('BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBB3', 'Cotrimoxazole 480mg', 'BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB', 'Tablets', 'Antibiotic combination'),
('CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCC2', 'ORS Sachets', 'CCCCCCCC-CCCC-CCCC-CCCC-CCCCCCCCCCCC', 'Sachets', 'Oral rehydration solution'),
('DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDD2', 'Male Condoms', 'DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD', 'Pieces', 'Male contraceptives'),
('DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDD3', 'Combined Oral Contraceptives', 'DDDDDDDD-DDDD-DDDD-DDDD-DDDDDDDDDDDD', 'Cycles', 'Birth control pills'),
('EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEEEEE2', 'Iron Folate Tablets', 'EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEEEEEE', 'Tablets', 'Iron and folic acid supplements'),
('EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEEEEE3', 'Vitamin A Capsules', 'EEEEEEEE-EEEE-EEEE-EEEE-EEEEEEEEEEEE', 'Capsules', 'Vitamin A supplements')
ON CONFLICT (name) DO NOTHING;

-- Insert sample admin user (password should be hashed in real implementation)
INSERT INTO users (id, username, email, password_hash, role) VALUES
('99999999-9999-9999-9999-999999999999', 'admin', 'admin@example.com', '$2b$10$hashedpassword', 'admin')
ON CONFLICT (username) DO NOTHING;
