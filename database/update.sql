-- database/update.sql
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE accounts ADD COLUMN credit DECIMAL(15,2) DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column credit already exists in accounts.';
    END;

    BEGIN
        ALTER TABLE accounts ADD COLUMN leverage INTEGER DEFAULT 50;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column leverage already exists in accounts.';
    END;
END $$;

-- Create kyc_submissions table
CREATE TABLE IF NOT EXISTS kyc_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100),
    file_path TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified', 'rejected')),
    rejection_reason TEXT,
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$ BEGIN
    CREATE TRIGGER update_kyc_submissions_updated_at
        BEFORE UPDATE ON kyc_submissions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create funding_requests table
CREATE TABLE IF NOT EXISTS funding_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    amount DECIMAL(15,2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    proof_file TEXT,
    bank_reference VARCHAR(100),
    rejection_reason TEXT,
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DO $$ BEGIN
    CREATE TRIGGER update_funding_requests_updated_at
        BEFORE UPDATE ON funding_requests
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create transactions table (account ledger)
-- We need to check if table exists and drop or we rely on IF NOT EXISTS
-- But if transactions exists without account_id, we should alter it
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
        BEGIN
            ALTER TABLE transactions ADD COLUMN account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE;
        EXCEPTION WHEN duplicate_column THEN null; END;
        BEGIN
            ALTER TABLE transactions DROP COLUMN status;
        EXCEPTION WHEN undefined_column THEN null; END;
        BEGIN
            ALTER TABLE transactions DROP COLUMN reference_type;
        EXCEPTION WHEN undefined_column THEN null; END;
    ELSE
        CREATE TABLE transactions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            balance_before DECIMAL(15,2) NOT NULL,
            balance_after DECIMAL(15,2) NOT NULL,
            reference_id INTEGER,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_id INTEGER,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
