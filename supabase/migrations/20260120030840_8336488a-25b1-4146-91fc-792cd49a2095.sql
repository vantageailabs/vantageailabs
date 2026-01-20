-- Add review_request_sent_at column to clients table
ALTER TABLE clients 
ADD COLUMN review_request_sent_at TIMESTAMPTZ DEFAULT NULL;