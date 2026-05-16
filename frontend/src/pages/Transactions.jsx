import React, { useState, useEffect } from 'react';
// Import fungsi Axios untuk kirim data ke Flask backend
import { getTransactions, createTransaction } from '../services/api';

const Transactions = () => {
  // State untuk menampung riwayat transaksi dari database
  const [transactions, setTransactions] = useState([]);
  
  // State untuk melacak tipe transaksi (Pemasukan / Pengeluaran)
  const [isExpense, setIsExpense] = useState(true);

  // State utama untuk menangkap input data form secara realtime
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Default tanggal hari ini
    description: '',
    category: 'Hiburan', // Default kategori sesuai gambar kamu
    amount: ''
  });

  // State tambahan untuk proses loading & menampilkan pesan error/sukses
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // 1. Ambil riwayat transaksi dari backend Flask saat halaman dibuka
  const fetchTransactions = async () => {
    try {
      const response = await getTransactions();
      setTransactions(response.data);
    } catch (err) {
      console.error('Gagal mengambil data transaksi:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 2. Fungsi pembaca inputan form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Fungsi eksekusi tombol "+ Tambah" saat diklik
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Validasi dasar agar inputan tidak kosong
    if (!formData.description || !formData.amount) {
      setMessage({ text: 'Deskripsi dan Jumlah uang tidak boleh kosong!', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      // Sesuai rules backend: Nilai pengeluaran dikonversi jadi minus (-), pemasukan jadi positif (+)
      const parsedAmount = parseFloat(formData.amount);
      const finalAmount = isExpense ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);

      const payload = {
        date: formData.date,
        description: formData.description,
        category: formData.category,
        amount: finalAmount // Format angka valid (float/int) untuk backend Flask
      };

      // Kirim data ke Flask (POST /api/transactions)
      await createTransaction(payload);
      
      // Kasih notifikasi sukses
      setMessage({ text: 'Transaksi berhasil disimpan!', type: 'success' });

      // Reset form input jadi kosong lagi
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'Hiburan',
        amount: ''
      });

      // Tarik data terbaru agar tabel riwayat langsung ter-update otomatis
      fetchTransactions();
    } catch (err) {
      console.error('Gagal menyimpan transaksi:', err);
      setMessage({ 
        text: err.response?.data?.error || 'Gagal tersambung ke server backend.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#0f172a] min-h-screen text-white flex flex-col items-center">
      <div className="w-full max-w-xl bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-gray-800">
        
        {/* HEADER & TOGGLE TYPE */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold tracking-wide">Transaksi Baru</h2>
          <div className="flex bg-[#0f172a] p-1 rounded-xl border border-gray-800">
            <button 
              type="button"
              onClick={() => setIsExpense(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${!isExpense ? 'bg-green-600 text-white' : 'text-gray-400'}`}
            >
              Pemasukan
            </button>
            <button 
              type="button"
              onClick={() => setIsExpense(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${isExpense ? 'bg-red-600 text-white' : 'text-gray-400'}`}
            >
              Pengeluaran
            </button>
          </div>
        </div>

        {/* NOTIFIKASI ERROR / SUKSES */}
        {message.text && (
          <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
            {message.text}
          </div>
        )}

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* KOLOM JUMLAH UANG */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Jumlah</label>
            <div className="relative flex items-center">
              <span className={`absolute left-4 font-bold text-lg ${isExpense ? 'text-red-400' : 'text-green-400'}`}>
                {isExpense ? '- Rp' : '+ Rp'}
              </span>
              <input 
                type="number" 
                name="amount"
                placeholder="2.500.000"
                value={formData.amount}
                onChange={handleChange}
                className="w-full bg-[#0f172a] text-white pl-16 pr-4 py-3 rounded-xl border border-gray-800 text-lg font-bold focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* KOLOM KATEGORI (FIXED TEXT & BACKGROUND COCOK UNTUK DARK MODE) */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Kategori</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-[#0f172a] text-white px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500 transition appearance-none cursor-pointer"
              style={{ colorScheme: 'dark' }} // Trik CSS ampuh biar drop-down pilihan di Windows/Chrome ikut jadi item gelap
            >
              <option value="Hiburan" className="bg-[#0f172a] text-white">Hiburan</option>
              <option value="Makanan" className="bg-[#0f172a] text-white">Makanan & Minuman</option>
              <option value="Transportasi" className="bg-[#0f172a] text-white">Transportasi / Bensin</option>
              <option value="Perumahan" className="bg-[#0f172a] text-white">Perumahan & Tagihan</option>
              <option value="Investasi" className="bg-[#0f172a] text-white">Investasi</option>
            </select>
          </div>

          {/* KOLOM DESKRIPSI KETERANGAN */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Deskripsi Keterangan</label>
            <input 
              type="text" 
              name="description"
              placeholder="Contoh: Beli tiket bioskop atau ganti oli Beat"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-[#0f172a] text-white px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500 transition text-sm"
            />
          </div>

          {/* KOLOM TANGGAL TRANSAKSI */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tanggal</label>
            <input 
              type="date" 
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-[#0f172a] text-white px-4 py-3 rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500 transition text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* TOMBOL AKSI TAMBAH DATA */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold py-3.5 rounded-xl transition duration-200 flex justify-center items-center shadow-lg shadow-amber-500/10 active:scale-[0.99]"
          >
            {loading ? (
              <span className="text-sm font-medium animate-pulse">Memproses database...</span>
            ) : (
              <span className="text-base font-bold">+ Tambah Transaksi</span>
            )}
          </button>

        </form>
      </div>

      {/* MINI RIWAYAT DI BAWAH FORM UNTUK CEK APAKAH DATA BERHASIL MASUK */}
      <div className="w-full max-w-xl mt-6 bg-[#1e293b] p-4 rounded-2xl border border-gray-800 text-xs">
        <h3 className="font-semibold text-gray-400 mb-2">Log Validasi Masuk Database (Top 3 Terakhir):</h3>
        <div className="space-y-1.5">
          {transactions.slice(0, 3).map((t, idx) => (
            <div key={idx} className="flex justify-between bg-[#0f172a] p-2 rounded-lg border border-gray-800/50">
              <span className="text-gray-400">{t.date} | {t.description} ({t.category})</span>
              <span className={t.amount < 0 ? "text-red-400 font-bold" : "text-green-400 font-bold"}>
                Rp {Math.abs(t.amount).toLocaleString('id-ID')}
              </span>
            </div>
          ))}
          {transactions.length === 0 && <p className="text-gray-500 text-center py-2">Belum ada data transaksi tersimpan.</p>}
        </div>
      </div>
    </div>
  );
};

export default Transactions;