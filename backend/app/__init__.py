from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import pymysql.cursors
import os
import urllib.parse

def get_db():
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        parsed = urllib.parse.urlparse(database_url)
        return pymysql.connect(
            host=parsed.hostname,
            user=parsed.username,
            password=parsed.password,
            database=parsed.path[1:],
            port=parsed.port or 3306,
            cursorclass=pymysql.cursors.DictCursor
        )
    else:
        return pymysql.connect(
            host='127.0.0.1',
            user='root',
            password='',
            database='db_finance',
            cursorclass=pymysql.cursors.DictCursor
        )

def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.route('/api/transactions', methods=['GET'])
    def get_transactions():
        try:
            con = get_db()
            with con.cursor() as cur:
                cur.execute("SELECT id, date, description, category, amount FROM transactions ORDER BY date DESC")
                rows = cur.fetchall()
            con.close()
            
            transactions = []
            for row in rows:
                transactions.append({
                    'id': row['id'],
                    'date': str(row['date']),
                    'description': row['description'],
                    'category': row['category'],
                    'amount': float(row['amount'])
                })
            return jsonify(transactions), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/transactions', methods=['POST'])
    def create_transaction():
        try:
            data = request.json
            con = get_db()
            with con.cursor() as cur:
                cur.execute(
                    "INSERT INTO transactions (date, description, category, amount) VALUES (%s, %s, %s, %s)",
                    (data.get('date'), data.get('description'), data.get('category'), data.get('amount'))
                )
            con.commit()
            con.close()
            return jsonify({'message': 'Sukses!'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return app