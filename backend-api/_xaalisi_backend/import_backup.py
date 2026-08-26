"""
Script to import PostgreSQL backup data into local SQLite database.
Reads the pg_dump SQL file and converts INSERT statements to SQLite-compatible format.
"""
import re
import sqlite3
import os

BACKUP_FILE = os.path.join(os.path.dirname(__file__), '..', 'database', 'xaalisi_backup.sql')
DB_FILE = os.path.join(os.path.dirname(__file__), 'xaalisi.db')

def clean_value(val):
    """Clean PostgreSQL-specific values for SQLite compatibility."""
    val = val.strip()
    if val == 'true':
        return '1'
    if val == 'false':
        return '0'
    return val

def import_data():
    if not os.path.exists(BACKUP_FILE):
        print(f"ERROR: Backup file not found: {BACKUP_FILE}")
        return
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Read the backup file
    with open(BACKUP_FILE, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    # Find all COPY blocks (PostgreSQL bulk insert format)
    # Format: COPY public.table_name (col1, col2, ...) FROM stdin;
    # data rows separated by tabs
    # \.
    
    copy_pattern = re.compile(
        r'COPY public\.(\w+)\s*\(([^)]+)\)\s*FROM stdin;\n(.*?)\n\\\.', 
        re.DOTALL
    )
    
    matches = copy_pattern.findall(content)
    
    total_rows = 0
    tables_imported = []
    
    for table_name, columns, data_block in matches:
        col_list = [c.strip() for c in columns.split(',')]
        col_names = ', '.join(col_list)
        placeholders = ', '.join(['?' for _ in col_list])
        
        rows = data_block.strip().split('\n')
        if not rows or rows[0] == '':
            continue
            
        insert_sql = f"INSERT OR IGNORE INTO {table_name} ({col_names}) VALUES ({placeholders})"
        
        row_count = 0
        for row in rows:
            if row.strip() == '' or row.strip() == '\\.':
                continue
            values = row.split('\t')
            # Clean values
            cleaned = []
            for v in values:
                if v == '\\N':
                    cleaned.append(None)
                elif v == 't':
                    cleaned.append(1)
                elif v == 'f':
                    cleaned.append(0)
                else:
                    cleaned.append(v)
            
            if len(cleaned) == len(col_list):
                try:
                    cursor.execute(insert_sql, cleaned)
                    row_count += 1
                except Exception as e:
                    # Skip rows that don't match (e.g., table doesn't exist in SQLite)
                    pass
        
        if row_count > 0:
            tables_imported.append(f"  [OK] {table_name}: {row_count} rows")
            total_rows += row_count
    
    conn.commit()
    conn.close()
    
    print(f"\n{'='*50}")
    print(f"  DATABASE IMPORT COMPLETE")
    print(f"{'='*50}")
    print(f"\nTables imported:")
    for t in tables_imported:
        print(t)
    print(f"\nTotal: {total_rows} rows imported into {DB_FILE}")
    print(f"{'='*50}\n")

if __name__ == '__main__':
    import_data()
