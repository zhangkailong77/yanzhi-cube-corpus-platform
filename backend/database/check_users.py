"""
检查数据库中的用户
"""
import pymysql

def main():
    conn = pymysql.connect(
        host='192.168.31.11',
        port=3306,
        user='root',
        password='123456',
        database='corpus_management'
    )

    cursor = conn.cursor()
    cursor.execute("SELECT id, username, role FROM users")
    users = cursor.fetchall()
    print("Users:", users)

    if not users:
        print("No users found. Inserting admin...")
        cursor.execute("""
            INSERT INTO users (username, password_hash, email, role)
            VALUES (%s, %s, %s, %s)
        """, ("admin", "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7xT8aH4q6u", "admin@yanzhi.com", "admin"))
        conn.commit()
        print("Admin user created!")
    else:
        print("Users already exist.")

    cursor.close()
    conn.close()


if __name__ == "__main__":
    main()
