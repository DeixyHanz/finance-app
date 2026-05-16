from app import create_app

app = create_app()

if __name__ == '__main__':
    # Server akan berjalan di port 5000 dengan mode debug aktif
    app.run(debug=True, port=5000)