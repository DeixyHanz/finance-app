from flask import Blueprint, jsonify

# Membuat blueprint untuk rute AI
ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/api/ai', methods=['POST'])
def get_ai_insight():
    # Ini teks tiruan (mock) sebelum kita hubungkan ke API Gemini/Claude sungguhan nanti
    sample_insight = (
        "💡 Pengeluaran untuk Makanan adalah yang tertinggi bulan ini (Rp 407.000). "
        "Disarankan untuk mengurangi frekuensi GrabFood.\n\n"
        "📈 Saldo bersih Anda positif sebesar Rp 6.820.094. "
        "Pertimbangkan untuk mengalokasikan 10% ke tabungan darurat.\n\n"
        "🎯 Anggaran hiburan seperti Netflix dan Spotify masih aman di bawah batas wajar."
    )
    return jsonify({"insight": sample_insight})