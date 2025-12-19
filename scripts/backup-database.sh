#!/bin/bash

# Database Backup Script for AI-BOS Vendor Portal
# This script creates a backup of the Supabase database

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/supabase_backup_${TIMESTAMP}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}Starting database backup...${NC}"

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo -e "${YELLOW}Warning: Supabase project not linked${NC}"
    echo "Run: supabase link --project-ref your-project-ref"
    exit 1
fi

# Create backup using Supabase CLI
echo -e "${GREEN}Creating backup: ${BACKUP_FILE}${NC}"

# Export database schema and data
supabase db dump -f "$BACKUP_FILE" || {
    echo -e "${RED}Backup failed${NC}"
    exit 1
}

# Compress backup
echo -e "${GREEN}Compressing backup...${NC}"
gzip -f "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "File: ${BACKUP_FILE}"
echo -e "Size: ${BACKUP_SIZE}"

# Optional: Upload to cloud storage (S3, etc.)
if [ -n "$BACKUP_S3_BUCKET" ]; then
    echo -e "${GREEN}Uploading to S3...${NC}"
    aws s3 cp "$BACKUP_FILE" "s3://${BACKUP_S3_BUCKET}/backups/" || {
        echo -e "${YELLOW}Warning: S3 upload failed${NC}"
    }
fi

# Clean up old backups (keep last 30 days)
echo -e "${GREEN}Cleaning up old backups...${NC}"
find "$BACKUP_DIR" -name "supabase_backup_*.sql.gz" -mtime +30 -delete

echo -e "${GREEN}Backup process completed!${NC}"
