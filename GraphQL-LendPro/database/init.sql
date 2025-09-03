-- Mortgage Platform Database Schema
-- PostgreSQL initialization script

-- Create database (run this separately if needed)
-- CREATE DATABASE mortgage_platform;

-- Connect to the database
\c mortgage_platform;

-- Create Users table
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" SERIAL PRIMARY KEY,
    "FirstName" VARCHAR(100) NOT NULL,
    "LastName" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(255) NOT NULL UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "Role" VARCHAR(20) NOT NULL DEFAULT 'User',
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Properties table
CREATE TABLE IF NOT EXISTS "Properties" (
    "Id" SERIAL PRIMARY KEY,
    "Address" VARCHAR(500) NOT NULL,
    "City" VARCHAR(100) NOT NULL,
    "State" VARCHAR(100) NOT NULL,
    "ZipCode" VARCHAR(10) NOT NULL,
    "Price" DECIMAL(18,2) NOT NULL,
    "Bedrooms" INTEGER NOT NULL DEFAULT 0,
    "Bathrooms" INTEGER NOT NULL DEFAULT 0,
    "SquareFeet" INTEGER NOT NULL DEFAULT 0,
    "PropertyType" VARCHAR(50),
    "Description" TEXT,
    "ImageUrl" VARCHAR(500),
    "ListedDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IsActive" BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create LoanApplications table
CREATE TABLE IF NOT EXISTS "LoanApplications" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id"),
    "LoanAmount" DECIMAL(18,2) NOT NULL,
    "PropertyValue" DECIMAL(18,2) NOT NULL,
    "DownPayment" DECIMAL(18,2) NOT NULL,
    "InterestRate" DECIMAL(5,4) NOT NULL,
    "LoanTermYears" INTEGER NOT NULL,
    "AnnualIncome" DECIMAL(18,2) NOT NULL,
    "EmploymentStatus" VARCHAR(50),
    "Employer" VARCHAR(100),
    "Status" VARCHAR(50) NOT NULL DEFAULT 'Pending',
    "Notes" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Documents table
CREATE TABLE IF NOT EXISTS "Documents" (
    "Id" SERIAL PRIMARY KEY,
    "LoanApplicationId" INTEGER NOT NULL REFERENCES "LoanApplications"("Id"),
    "FileName" VARCHAR(255) NOT NULL,
    "FilePath" VARCHAR(500) NOT NULL,
    "DocumentType" VARCHAR(100) NOT NULL,
    "FileSize" BIGINT NOT NULL DEFAULT 0,
    "ContentType" VARCHAR(100),
    "UploadedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Payments table
CREATE TABLE IF NOT EXISTS "Payments" (
    "Id" SERIAL PRIMARY KEY,
    "LoanApplicationId" INTEGER NOT NULL REFERENCES "LoanApplications"("Id"),
    "Amount" DECIMAL(18,2) NOT NULL,
    "PaymentDate" TIMESTAMP NOT NULL,
    "DueDate" TIMESTAMP NOT NULL,
    "Status" VARCHAR(50) NOT NULL,
    "PaymentMethod" VARCHAR(50),
    "TransactionId" VARCHAR(100),
    "PrincipalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "InterestAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "RemainingBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "Notes" VARCHAR(500),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create FavoriteProperties table
CREATE TABLE IF NOT EXISTS "FavoriteProperties" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INTEGER NOT NULL REFERENCES "Users"("Id"),
    "PropertyId" INTEGER NOT NULL REFERENCES "Properties"("Id"),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("UserId", "PropertyId")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users"("Email");
CREATE INDEX IF NOT EXISTS "IX_Properties_City_State" ON "Properties"("City", "State");
CREATE INDEX IF NOT EXISTS "IX_Properties_Price" ON "Properties"("Price");
CREATE INDEX IF NOT EXISTS "IX_LoanApplications_UserId" ON "LoanApplications"("UserId");
CREATE INDEX IF NOT EXISTS "IX_LoanApplications_Status" ON "LoanApplications"("Status");
CREATE INDEX IF NOT EXISTS "IX_Documents_LoanApplicationId" ON "Documents"("LoanApplicationId");
CREATE INDEX IF NOT EXISTS "IX_Payments_LoanApplicationId" ON "Payments"("LoanApplicationId");
CREATE INDEX IF NOT EXISTS "IX_FavoriteProperties_UserId" ON "FavoriteProperties"("UserId");
CREATE INDEX IF NOT EXISTS "IX_FavoriteProperties_PropertyId" ON "FavoriteProperties"("PropertyId");

-- Insert seed data

-- Insert admin user (password: admin123)
INSERT INTO "Users" ("FirstName", "LastName", "Email", "PasswordHash", "Role") VALUES 
('Admin', 'User', 'admin@mortgageplatform.com', '$2b$11$CuF4GnaCBwgjwUVeiPt5w.y3N3fiJ4NCaFo/4GdAEbNPqeY.v9Iuy', 'Admin')
ON CONFLICT ("Email") DO NOTHING;

-- Insert sample user (password: user123)
INSERT INTO "Users" ("FirstName", "LastName", "Email", "PasswordHash", "Role") VALUES 
('John', 'Doe', 'john.doe@email.com', '$2b$11$Ae31W4QJJjPRdV3VHTn6Uu3WpOXLElZj46QkBqIvdwDJYbJqljThm', 'User')
ON CONFLICT ("Email") DO NOTHING;

-- Insert sample properties
INSERT INTO "Properties" ("Address", "City", "State", "ZipCode", "Price", "Bedrooms", "Bathrooms", "SquareFeet", "PropertyType", "Description", "ImageUrl") VALUES 
-- Austin Properties (expanded from 3 to 12)
('123 Main St', 'Austin', 'TX', '78701', 450000.00, 3, 2, 1800, 'Single Family', 'Beautiful home in downtown Austin with modern amenities', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994'),
('456 Oak Ave', 'Austin', 'TX', '78702', 325000.00, 2, 2, 1200, 'Condo', 'Modern condo with city views', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'),
('987 Cedar Blvd', 'Austin', 'TX', '78703', 675000.00, 4, 3, 2800, 'Single Family', 'Luxury home with pool and modern finishes', 'https://images.unsplash.com/photo-1613977257363-707ba9348227'),
('741 Ash Dr', 'Austin', 'TX', '78704', 550000.00, 3, 3, 2200, 'Single Family', 'Updated home with energy-efficient features', 'https://images.unsplash.com/photo-1582407947304-fd86f028f716'),
('852 Congress Ave', 'Austin', 'TX', '78701', 485000.00, 3, 2, 1850, 'Condo', 'High-rise condo in the heart of downtown Austin', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00'),
('963 South Lamar', 'Austin', 'TX', '78704', 395000.00, 2, 2, 1400, 'Townhouse', 'Trendy townhouse in South Austin', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'),
('159 Zilker Rd', 'Austin', 'TX', '78704', 525000.00, 3, 2, 2000, 'Single Family', 'Charming home near Zilker Park', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c'),
('357 Rainey St', 'Austin', 'TX', '78701', 410000.00, 2, 2, 1350, 'Condo', 'Modern condo in historic Rainey Street district', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea'),
('246 East Austin', 'Austin', 'TX', '78702', 365000.00, 3, 2, 1650, 'Single Family', 'Renovated bungalow in East Austin', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'),
('468 Mueller Blvd', 'Austin', 'TX', '78723', 445000.00, 3, 2, 1900, 'Townhouse', 'Modern townhouse in Mueller development', 'https://images.unsplash.com/photo-1600607687644-c7171b42498b'),
('579 West Lake', 'Austin', 'TX', '78746', 750000.00, 4, 3, 3200, 'Single Family', 'Stunning lakefront property with dock', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea'),
('680 Barton Creek', 'Austin', 'TX', '78735', 825000.00, 5, 4, 3600, 'Single Family', 'Luxury estate in Barton Creek', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3'),

-- Houston Properties (expanded from 2 to 8)
('789 Pine St', 'Houston', 'TX', '77001', 520000.00, 4, 3, 2400, 'Single Family', 'Spacious family home with large yard', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'),
('147 Birch Way', 'Houston', 'TX', '77002', 425000.00, 3, 2, 1900, 'Single Family', 'Charming home near downtown', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'),
('321 Heights Blvd', 'Houston', 'TX', '77008', 465000.00, 3, 2, 1950, 'Single Family', 'Historic Heights home with character', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d'),
('654 Memorial Dr', 'Houston', 'TX', '77007', 385000.00, 2, 2, 1500, 'Condo', 'Upscale condo near Memorial Park', 'https://images.unsplash.com/photo-1600585154084-fb1fee4b5b4c'),
('987 River Oaks', 'Houston', 'TX', '77019', 950000.00, 5, 4, 4200, 'Single Family', 'Prestigious River Oaks mansion', 'https://images.unsplash.com/photo-1600566752734-18113f31b118'),
('159 Montrose Blvd', 'Houston', 'TX', '77006', 340000.00, 2, 1, 1200, 'Townhouse', 'Artsy Montrose district townhouse', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea'),
('246 Sugar Land', 'Houston', 'TX', '77479', 495000.00, 4, 3, 2600, 'Single Family', 'Family home in Sugar Land suburbs', 'https://images.unsplash.com/photo-1600566752190-17f0baa2a6c4'),
('357 Galleria Area', 'Houston', 'TX', '77056', 425000.00, 2, 2, 1400, 'Condo', 'Modern high-rise near Galleria', 'https://images.unsplash.com/photo-1600566752734-18113f31b119'),

-- Dallas Properties (expanded from 2 to 6)
('321 Elm Dr', 'Dallas', 'TX', '75201', 380000.00, 3, 2, 1600, 'Townhouse', 'Modern townhouse in great neighborhood', 'https://images.unsplash.com/photo-1605146769289-440113cc3d00'),
('258 Spruce St', 'Dallas', 'TX', '75202', 340000.00, 2, 2, 1300, 'Condo', 'Contemporary condo with amenities', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13'),
('468 Deep Ellum', 'Dallas', 'TX', '75226', 395000.00, 2, 2, 1450, 'Loft', 'Industrial loft in trendy Deep Ellum', 'https://images.unsplash.com/photo-1600566752355-35792bedcfeb'),
('579 Bishop Arts', 'Dallas', 'TX', '75208', 420000.00, 3, 2, 1750, 'Single Family', 'Charming home near Bishop Arts District', 'https://images.unsplash.com/photo-1600566752190-17f0baa2a6c5'),
('680 Uptown Dr', 'Dallas', 'TX', '75201', 525000.00, 3, 2, 1900, 'Condo', 'Luxury uptown high-rise condo', 'https://images.unsplash.com/photo-1600566752734-18113f31b120'),
('791 Preston Hollow', 'Dallas', 'TX', '75230', 785000.00, 5, 4, 3800, 'Single Family', 'Executive home in Preston Hollow', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3eb'),

-- San Antonio Properties (expanded from 2 to 6)
('654 Maple Ln', 'San Antonio', 'TX', '78201', 295000.00, 2, 1, 1000, 'Condo', 'Cozy condo perfect for first-time buyers', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'),
('369 Willow Ave', 'San Antonio', 'TX', '78202', 275000.00, 2, 1, 950, 'Townhouse', 'Affordable townhouse in quiet area', 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c'),
('147 Riverwalk Dr', 'San Antonio', 'TX', '78205', 385000.00, 2, 2, 1350, 'Condo', 'Downtown condo near the Riverwalk', 'https://images.unsplash.com/photo-1600566752355-35792bedcfec'),
('258 Alamo Heights', 'San Antonio', 'TX', '78209', 545000.00, 4, 3, 2500, 'Single Family', 'Beautiful home in historic Alamo Heights', 'https://images.unsplash.com/photo-1600566752190-17f0baa2a6c6'),
('369 Stone Oak', 'San Antonio', 'TX', '78258', 425000.00, 3, 2, 2100, 'Single Family', 'Modern home in Stone Oak community', 'https://images.unsplash.com/photo-1600566752734-18113f31b121'),
('480 Southtown', 'San Antonio', 'TX', '78204', 315000.00, 2, 2, 1250, 'Townhouse', 'Hip townhouse in trendy Southtown', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ec')

ON CONFLICT DO NOTHING;

-- Insert sample loan application
INSERT INTO "LoanApplications" ("UserId", "LoanAmount", "PropertyValue", "DownPayment", "InterestRate", "LoanTermYears", "AnnualIncome", "EmploymentStatus", "Employer", "Status", "Notes") VALUES 
(2, 360000.00, 450000.00, 90000.00, 6.5000, 30, 85000.00, 'Full-time', 'Tech Corp', 'Under Review', 'Initial application submitted');

-- Function to update UpdatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update UpdatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_applications_updated_at BEFORE UPDATE ON "LoanApplications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mortgage_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mortgage_user;