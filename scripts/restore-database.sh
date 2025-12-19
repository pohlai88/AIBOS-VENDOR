#!/bin/bash

# Database Restore Script for AI-BOS Vendor Portal
# This script restores a Supabase database from a backup

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Backup file not specified${NC}"
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

echo -e "${YELLOW}WARNING: This will overwrite the current database!${NC}"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${GREEN}Decompressing backup...${NC}"
    DECOMPRESSED_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$DECOMPRESSED_FILE"
    BACKUP_FILE="$DECOMPRESSED_FILE"
fi

echo -e "${GREEN}Restoring database from: ${BACKUP_FILE}${NC}"

# Restore database using Supabase CLI
supabase db reset --db-url "$(supabase status | grep 'DB URL' | awk '{print $3}')" < "$BACKUP_FILE" || {
    echo -e "${RED}Restore failed${NC}"
    exit 1
}

# Clean up decompressed file if we created it
if [ -f "$DECOMPRESSED_FILE" ]; then
    rm "$DECOMPRESSED_FILE"
fi

echo -e "${GREEN}Database restored successfully!${NC}"
