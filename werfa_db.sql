CREATE TYPE ticket_status AS ENUM (
'waiting',
'serving',
'done'
);

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE students(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fullname TEXT NOT NULL,
    university_id VARCHAR(20) NOT NULL UNIQUE,
    email TEXT  NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    fullname TEXT NOT NULL,

    email TEXT UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL,

    ticket_number TEXT UNIQUE NOT NULL,
    queue_position INTEGER NOT NULL,

    status ticket_status NOT NULL DEFAULT 'waiting',

    estimated_wait INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY(student_id)
        REFERENCES students(id)
        ON DELETE CASCADE
);

--Indexes

CREATE INDEX idx_queue_position ON tickets(queue_position);
CREATE INDEX idx_student_id ON tickets(student_id);
CREATE INDEX idx_ticket_status ON tickets(status);

-- updated_at Trigger function

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--Triggers

CREATE TRIGGER update_ticket_timestamp
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_students_timestamp
BEFORE UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_admins_timestamp
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();