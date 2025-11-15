import sqlite3
from pathlib import Path
import time

DB_PATH = Path("database.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        picture TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        user_id TEXT,
        expires_at INTEGER
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        sender TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)

    conn.commit()
    conn.close()


def save_chat_message(user_id, message, sender):
    """Save a chat message to the history table"""
    conn = get_db()
    timestamp = int(time.time())
    conn.execute(
        """
        INSERT INTO chat_history (user_id, message, sender, timestamp)
        VALUES (?, ?, ?, ?)
        """,
        (user_id, message, sender, timestamp),
    )
    conn.commit()
    conn.close()


def get_chat_history(user_id, limit=100):
    """Retrieve chat history for a user"""
    conn = get_db()
    cursor = conn.execute(
        """
        SELECT id, message, sender, timestamp
        FROM chat_history
        WHERE user_id = ?
        ORDER BY timestamp ASC
        LIMIT ?
        """,
        (user_id, limit),
    )
    messages = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return messages


def delete_chat_history(user_id):
    """Delete all chat history for a user"""
    conn = get_db()
    conn.execute(
        """
        DELETE FROM chat_history
        WHERE user_id = ?
        """,
        (user_id,),
    )
    conn.commit()
    conn.close()
