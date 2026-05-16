from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import pymysql.cursors
import os

def get_db():
    return pymysql.connect(
        host=os.environ.get('MYSQL_HOST', '127.0.0.1'),
        user=os.environ.get('MYSQL_USER', 'root'),
        password=os.environ.get('MYSQL_PASSWORD', ''),
        database=os.environ.get('MYSQL_DB', 'db_finance'),
        port=int(os.environ.get('MYSQL_PORT', 3306)),
        cursorclass=pymysql.cursors.DictCursor
    )

def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000", "http://localhost:3001"])

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

            # Validasi input
            if not data:
                return jsonify({'error': 'Data tidak boleh kosong'}), 400
            if not data.get('description'):
                return jsonify({'error': 'Deskripsi tidak boleh kosong'}), 400
            if data.get('amount') is None:
                return jsonify({'error': 'Amount tidak boleh kosong'}), 400

            con = get_db()
            with con.cursor() as cur:
                cur.execute(
                    "INSERT INTO transactions (date, description, category, amount) VALUES (%s, %s, %s, %s)",
                    (data.get('date'), data.get('description'), data.get('category'), float(data.get('amount')))
                )
            con.commit()
            con.close()
            return jsonify({'message': 'Sukses!'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return app