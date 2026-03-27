-- Schema + seed data for local development
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. CREACION DE TABLAS
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  role text NOT NULL,
  bio text NOT NULL,
  avatar_url text,
  cover_url text,
  status text NOT NULL DEFAULT 'ACTIVO' CHECK (status IN ('ACTIVO','INACTIVO')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  role text NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  profile_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('PUBLICADO','BORRADOR')),
  tags text[] NOT NULL DEFAULT '{}',
  repository_url text,
  live_url text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Técnica','Blanda')),
  level text NOT NULL CHECK (level IN ('Básico','Intermedio','Avanzado','Experto')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  start_date text NOT NULL,
  end_date text,
  is_current boolean NOT NULL DEFAULT false,
  description text NOT NULL,
  skills text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. SEED DATA

-- Perfil del Usuario normal
INSERT INTO profiles (full_name, role, bio, avatar_url, status)
SELECT 'Alex Developer', 'Full Stack Software Engineer', 'Apasionado por crear soluciones...', '/api/placeholder/150/150', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE full_name = 'Alex Developer');

-- Perfil del Usuario normal2
INSERT INTO profiles (full_name, role, bio, avatar_url, status)
SELECT 'Aliza Developer', 'Full Stack Software Engineer', 'Apasionado por crear soluciones...', '/api/placeholder/150/150', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE full_name = 'Aliza Developer');

-- Perfil del Administrador
INSERT INTO profiles (full_name, role, bio, status)
SELECT 'Alex Admin', 'Administrador del Sistema', 'Cuenta de administración del sistema NOWER.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE full_name = 'Alex Admin');

-- Perfil del Administrador2
INSERT INTO profiles (full_name, role, bio, status)
SELECT 'Diana Admin', 'Administrador del Sistema', 'Cuenta de administración del sistema NOWER.', 'ACTIVO'
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE full_name = 'Diana Admin');

-- Usuario normal (Password: 123)
INSERT INTO users (email, password_hash, role, profile_id)
SELECT 'user@gmail.com', crypt('123', gen_salt('bf')), 'USER', id
FROM profiles WHERE full_name = 'Alex Developer'
ON CONFLICT (email) DO NOTHING;

-- Usuario normal2 (Password: 123)
INSERT INTO users (email, password_hash, role, profile_id)
SELECT 'user2@gmail.com', crypt('123', gen_salt('bf')), 'USER', id
FROM profiles WHERE full_name = 'Aliza Developer'
ON CONFLICT (email) DO NOTHING;

-- Usuario admin (Password: 123)
INSERT INTO users (email, password_hash, role, profile_id)
SELECT 'admin@gmail.com', crypt('123', gen_salt('bf')), 'ADMIN', id
FROM profiles WHERE full_name = 'Alex Admin'
ON CONFLICT (email) DO NOTHING;

-- Usuario admin2 (Password: 123)
INSERT INTO users (email, password_hash, role, profile_id)
SELECT 'admin2@gmail.com', crypt('123', gen_salt('bf')), 'ADMIN', id
FROM profiles WHERE full_name = 'Diana Admin'
ON CONFLICT (email) DO NOTHING;

-- Proyectos (vinculados al usuario normal)
INSERT INTO projects (profile_id, title, description, status, tags, repository_url, created_at)
SELECT id, 'E-commerce API', 'Microservicio de pagos', 'PUBLICADO', ARRAY['NODE.JS','POSTGRES'], 'https://github.com/alexdev/api', now()
FROM profiles WHERE full_name = 'Alex Developer'
AND NOT EXISTS (SELECT 1 FROM projects WHERE title = 'E-commerce API');

INSERT INTO projects (profile_id, title, description, status, tags, created_at)
SELECT id, 'Dashboard Analítico', 'Panel en tiempo real', 'BORRADOR', ARRAY['REACT','SOCKET.IO'], now()
FROM profiles WHERE full_name = 'Alex Developer'
AND NOT EXISTS (SELECT 1 FROM projects WHERE title = 'Dashboard Analítico');

-- Skills (vinculadas al usuario normal)
INSERT INTO skills (profile_id, name, category, level)
SELECT id, 'React / Next.js', 'Técnica', 'Avanzado' FROM profiles WHERE full_name = 'Alex Developer'
AND NOT EXISTS (SELECT 1 FROM skills WHERE name = 'React / Next.js');

INSERT INTO skills (profile_id, name, category, level)
SELECT id, 'Node.js', 'Técnica', 'Avanzado' FROM profiles WHERE full_name = 'Alex Developer'
AND NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Node.js');

-- Experiencia (vinculada al usuario normal)
INSERT INTO experiences (profile_id, role, company, location, start_date, is_current, description)
SELECT id, 'Senior Frontend Developer', 'NOWER Enterprise', 'Remoto', 'Ene 2024', true, 'Liderando arquitectura frontend'
FROM profiles WHERE full_name = 'Alex Developer'
AND NOT EXISTS (SELECT 1 FROM experiences WHERE company = 'NOWER Enterprise');