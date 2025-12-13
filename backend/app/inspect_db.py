
import sqlite3
import os

def inspect_db():
    # Only look at the one we found
    db_path = "/app/app/keystone_banana.db"
    
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found inside container")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print(f"Tables found in {db_path}:")
    for table in tables:
        t_name = table[0]
        cursor.execute(f"SELECT COUNT(*) FROM {t_name}")
        count = cursor.fetchone()[0]
        print(f"- {t_name}: {count} rows")
        
        if count > 0 and count < 5:
            # Show the data to see if it's my seed data
            print(f"  Data sample ({t_name}):")
            cursor.execute(f"SELECT * FROM {t_name}")
            rows = cursor.fetchall()
            for row in rows:
                print(f"    {row}")

    conn.close()

if __name__ == "__main__":
    inspect_db()
