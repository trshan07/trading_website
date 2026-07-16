-- database/update.sql
DO $$ 
BEGIN
    BEGIN
        ALTER TABLE accounts ADD COLUMN credit DECIMAL(15,2) DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column credit already exists in accounts.';
    END;

    BEGIN
        ALTER TABLE accounts ADD COLUMN leverage INTEGER DEFAULT 10;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column leverage already exists in accounts.';
    END;
END $$;

ALTER TABLE accounts ALTER COLUMN leverage SET DEFAULT 10;

DO $$
BEGIN
    BEGIN
        ALTER TABLE positions ADD COLUMN side VARCHAR(10);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column side already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN amount DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column amount already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN quantity DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column quantity already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN entry_price DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column entry_price already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN close_price DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column close_price already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN gross_pnl DECIMAL(15,8) DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column gross_pnl already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN commission DECIMAL(15,8) DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column commission already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN swap DECIMAL(15,8) DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column swap already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN pnl DECIMAL(15,8) DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column pnl already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN margin DECIMAL(15,8) DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column margin already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN leverage INTEGER;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column leverage already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN take_profit DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column take_profit already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN stop_loss DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column stop_loss already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column created_at already exists in positions.';
    END;

    BEGIN
        ALTER TABLE positions ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column updated_at already exists in positions.';
    END;
END $$;

DO $$
BEGIN
    BEGIN
        ALTER TABLE instruments ADD COLUMN spread DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column spread already exists in instruments.';
    END;

    BEGIN
        ALTER TABLE instruments ADD COLUMN contract_size DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column contract_size already exists in instruments.';
    END;

    BEGIN
        ALTER TABLE instruments ADD COLUMN lot_step DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column lot_step already exists in instruments.';
    END;

    BEGIN
        ALTER TABLE instruments ADD COLUMN min_lot DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column min_lot already exists in instruments.';
    END;

    BEGIN
        ALTER TABLE instruments ADD COLUMN quantity_label VARCHAR(50);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column quantity_label already exists in instruments.';
    END;

    BEGIN
        ALTER TABLE instruments ADD COLUMN commission_rate DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column commission_rate already exists in instruments.';
    END;

    BEGIN
        ALTER TABLE instruments ADD COLUMN commission_per_lot_side DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column commission_per_lot_side already exists in instruments.';
    END;

    BEGIN
        ALTER TABLE instruments ADD COLUMN commission_min DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column commission_min already exists in instruments.';
    END;

    BEGIN
        ALTER TABLE instruments ADD COLUMN swap_long_per_lot_day DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column swap_long_per_lot_day already exists in instruments.';
    END;

    BEGIN
        ALTER TABLE instruments ADD COLUMN swap_short_per_lot_day DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column swap_short_per_lot_day already exists in instruments.';
    END;

    BEGIN
        ALTER TABLE instruments ADD COLUMN swap_long_rate DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column swap_long_rate already exists in instruments.';
    END;

    BEGIN
        ALTER TABLE instruments ADD COLUMN swap_short_rate DECIMAL(15,8);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column swap_short_rate already exists in instruments.';
    END;

    BEGIN
        ALTER TABLE instruments ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column updated_at already exists in instruments.';
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

CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    label VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS label VARCHAR(255);

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'activity_logs'
          AND column_name = 'details'
    ) THEN
        UPDATE activity_logs
        SET label = LEFT(COALESCE(label, details, action, 'Activity'), 255)
        WHERE label IS NULL;
    ELSE
        UPDATE activity_logs
        SET label = LEFT(COALESCE(label, action, 'Activity'), 255)
        WHERE label IS NULL;
    END IF;
END $$;

ALTER TABLE activity_logs
ALTER COLUMN label SET NOT NULL;

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

CREATE TABLE IF NOT EXISTS credit_grants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    remaining_amount DECIMAL(15,2) NOT NULL,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    source_transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
    expired_transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

UPDATE positions p
SET leverage = a.leverage,
    margin = COALESCE(p.amount, 0) / a.leverage,
    updated_at = CURRENT_TIMESTAMP
FROM accounts a
WHERE p.account_id = a.id
  AND p.status = 'open'
  AND a.leverage > 0;
