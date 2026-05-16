from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
import os          # ← TAMBAH baris ini
import urllib.parse  # ← TAMBAH baris ini

mysql = MySQL()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # ← TAMBAH BLOK INI (letaknya sebelum config MYSQL_HOST)
    # Baca DATABASE_URL dari Railway kalau ada
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        # Railway kasih format: mysql://user:password@host:port/dbname
        parsed = urllib.parse.urlparse(database_url)
        app.config['MYSQL_HOST']     = parsed.hostname
        app.config['MYSQL_USER']     = parsed.username
        app.config['MYSQL_PASSWORD'] = parsed.password
        app.config['MYSQL_DB']       = parsed.path[1:]  # hapus slash di depan
        app.config['MYSQL_PORT']     = parsed.port or 3306
    else:
        # Kalau tidak ada DATABASE_URL, pakai lokal XAMPP seperti biasa
        app.config['MYSQL_HOST']     = '127.0.0.1'   # ← sama seperti punyamu
        app.config['MYSQL_USER']     = 'root'         # ← sama seperti punyamu
        app.config['MYSQL_PASSWORD'] = ''             # ← sama seperti punyamu
        app.config['MYSQL_DB']       = 'db_finance'   # ← sama seperti punyamu
    # ← SAMPAI SINI blok tambahannya

    # Hapus / komen 4 baris config lama kamu ini karena sudah dipindah ke atas
    # app.config['MYSQL_HOST'] = '127.0.0.1'     ← HAPUS
    # app.config['MYSQL_USER'] = 'root'           ← HAPUS
    # app.config['MYSQL_PASSWORD'] = ''           ← HAPUS
    # app.config['MYSQL_DB'] = 'db_finance'       ← HAPUS

    mysql.init_app(app)

    # --- route GET dan POST kamu tidak perlu diubah sama sekali ---
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