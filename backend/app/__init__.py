from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS

mysql = MySQL()

def create_app():
    app = Flask(__name__)
    CORS(app)  # Izinkan frontend port 3001 masuk

    # Konfigurasi Database MySQL lu
    app.config['MYSQL_HOST'] = '127.0.0.1'
    app.config['MYSQL_USER'] = 'root'
    app.config['MYSQL_PASSWORD'] = ''
    app.config['MYSQL_DB'] = 'db_finance'

    mysql.init_app(app)

    @app.route('/api/transactions', methods=['GET'])
    def get_transactions():
        try:
            cur = mysql.connection.cursor()
            cur.execute("SELECT id, date, description, category, amount FROM transactions ORDER BY date DESC")
            rows = cur.fetchall()
            cur.close()
            transactions = []
            for row in rows:
                transactions.append({
                    'id': row[0],
                    'date': str(row[1]),
                    'description': row[2],
                    'category': row[3],
                    'amount': float(row[4])
                })
            return jsonify(transactions), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/api/transactions', methods=['POST'])
    def create_transaction():
        try:
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute("INSERT INTO transactions (date, description, category, amount) VALUES (%s, %s, %s, %s)", 
                        (data.get('date'), data.get('description'), data.get('category'), data.get('amount')))
            mysql.connection.commit()
            cur.close()
            return jsonify({'message': 'Sukses!'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return app