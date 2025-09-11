-- Initialize database extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create development user with all privileges
-- This is only for development environment
CREATE USER miguelsoro_dev WITH PASSWORD 'dev123';
GRANT ALL PRIVILEGES ON DATABASE miguelsoro TO miguelsoro_dev;
GRANT ALL ON SCHEMA public TO miguelsoro_dev;