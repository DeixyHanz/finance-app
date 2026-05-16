import { useState, useEffect, useRef, useCallback } from "react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import {
  LayoutDashboard, ArrowLeftRight, BarChart2, Wallet, Settings,
  TrendingUp, TrendingDown, Sparkles, Plus, RotateCcw,
  ChevronUp, ChevronDown, ChevronsUpDown, CircleDollarSign, X
} from "lucide-react";

// Import fungsi komunikasi Axios ke Flask Backend kamu
import { getTransactions, createTransaction } from "./services/api";

Chart.register(ArcElement, Tooltip, Legend);

const ACCENT = "#F59E0B";
const CAT_COLORS = {
  makanan: "#F59E0B", transport: "#06B6D4", hiburan: "#8B5CF6",
  perumahan: "#3B82F6", belanja: "#EC4899", kesehatan: "#10B981", income: "#22C55E",
};
const CAT_LABELS = {
  makanan: "Makanan", transport: "Transportasi", hiburan: "Hiburan",
  perumahan: "Perumahan", belanja: "Belanja", kesehatan: "Kesehatan", income: "Pemasukan",
};

const fmtIDR = (n) => {
  const abs = Math.abs(n);
  const s = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(abs);
  return (n < 0 ? "- " : "") + s;
};
const fmtDate = (d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
:root { --acc: ${ACCENT}; }
.pf-wrap { display: flex; min-height: 780px; background: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.pf-sidebar { width: 216px; min-width: 216px; background: #1e293b; border-right: 0.5px solid #334155; display: flex; flex-direction: column; padding: 1.25rem 0; position: sticky; top: 0; height: 780px; overflow: hidden; }
.pf-main { flex: 1; min-width: 0; padding: 1.75rem; overflow-y: auto; background: #0f172a; }
.nav-item { display: flex; align-items: center; gap: 9px; padding: 0.55rem 1.1rem; cursor: pointer; font-size: 13.5px; color: #94a3b8; border-left: 2px solid transparent; transition: all 0.15s; }
.nav-item:hover { background: #334155; color: #fff; }
.nav-item.act { border-left: 2px solid var(--acc); background: #334155; color: #fff; font-weight: 500; }
.card { background: #1e293b; border: 0.5px solid #334155; border-radius: 12px; padding: 1.2rem; color: #fff; }
.badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 500; }
.pf-input { padding: 0.5rem 0.75rem; border: 0.5px solid #334155; border-radius: 6px; background: #0f172a; color: #fff; font-size: 13px; outline: none; }
.pf-input:focus { border-color: var(--acc); box-shadow: 0 0 0 2px #F59E0B33; }
.pf-select { padding: 0.5rem 0.75rem; border: 0.5px solid #334155; border-radius: 6px; background: #0f172a; color: #fff; font-size: 13px; outline: none; cursor: pointer; color-scheme: dark; }
.btn { padding: 0.45rem 0.9rem; border-radius: 6px; border: 0.5px solid #334155; background: #1e293b; color: #fff; font-size: 12.5px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; transition: background 0.15s; }
.btn:hover { background: #334155; }
.btn.prime { background: var(--acc); border-color: var(--acc); color: #000; font-weight: 600; }
.btn.prime:hover { filter: brightness(0.92); }
.tbl { width: 100%; border-collapse: collapse; }
.tbl th { padding: 0.65rem 1rem; text-align: left; font-size: 11.5px; font-weight: 500; color: #94a3b8; border-bottom: 0.5px solid #334155; cursor: pointer; user-select: none; white-space: nowrap; }
.tbl th:hover { color: #fff; }
.tbl td { padding: 0.7rem 1rem; font-size: 13px; border-bottom: 0.5px solid #334155; color: #e2e8f0; }
.tbl tr:last-child td { border-bottom: none; }
.tbl tbody tr:hover td { background: #334155/50; }
.shimmer { background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
.fade-in { animation: fadein 0.25s ease; }
@keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  /* ===== MOBILE RESPONSIVE ===== */
  @media (max-width: 768px) {
    .pf-wrap { flex-direction: column; min-height: 100dvh; }
    
    /* Sembunyikan sidebar, ganti jadi bottom nav */
    .pf-sidebar { 
      width: 100%; height: auto; min-width: unset;
      position: fixed; bottom: 0; left: 0; right: 0;
      flex-direction: row; padding: 0;
      border-right: none; border-top: 0.5px solid #334155;
      z-index: 100; height: 60px;
    }
    
    /* Sembunyikan elemen sidebar yang tidak perlu di HP */
    .sidebar-logo, .sidebar-ratio, .sidebar-user, .nav-label { display: none !important; }
    
    /* Nav jadi horizontal */
    .pf-sidebar nav { 
      display: flex; flex-direction: row; 
      width: 100%; padding: 0; 
    }
    .nav-item { 
      flex: 1; flex-direction: column; justify-content: center;
      padding: 8px 4px; font-size: 10px; gap: 4px;
      border-left: none; border-top: 2px solid transparent;
    }
    .nav-item.act { 
      border-left: none; border-top: 2px solid #F59E0B;
    }
    
    /* Main content beri padding bawah supaya tidak ketutup bottom nav */
    .pf-main { padding: 1rem; padding-bottom: 80px; }
    
    /* Cards jadi 1 kolom */
    .grid-3 { grid-template-columns: 1fr !important; }
    .grid-2 { grid-template-columns: 1fr !important; }
    
    /* Tabel bisa scroll horizontal */
    .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    
    /* Tombol filter lebih kecil */
    .filter-bar { flex-wrap: wrap; gap: 6px !important; }
    .pf-input, .pf-select { font-size: 16px !important; } /* Cegah zoom otomatis iOS */
  }
    
`;

function Sidebar({ page, setPage, transactions }) {
  transactions = transactions || []; // <-- SELIPIN INI DI SINI!

  const items = [
    { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard" },
    { id: "transactions", Icon: ArrowLeftRight, label: "Transaksi" },
    { id: "reports", Icon: BarChart2, label: "Laporan" },
    { id: "budget", Icon: Wallet, label: "Anggaran" },
    { id: "settings", Icon: Settings, label: "Pengaturan" },
  ];
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const pct = income > 0 ? Math.min(Math.round((expense / income) * 100), 100) : 0;

  return (
    <aside className="pf-sidebar">
      <div style={{ padding: "0 1.1rem 1.25rem", borderBottom: "0.5px solid #334155" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircleDollarSign size={17} color="#000" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>FinanceAI</div>
            <div style={{ fontSize: 10.5, color: "#94a3b8" }}>Batam · Live DB</div>
          </div>
        </div>
      </div>

      <nav style={{ padding: "0.85rem 0", flex: 1 }}>
        <div style={{ padding: "0 1.1rem 0.5rem", fontSize: 10, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Menu</div>
        {items.map(({ id, Icon, label }) => (
          <div key={id} className={`nav-item${page === id ? " act" : ""}`} onClick={() => setPage(id)}>
            <Icon size={15} strokeWidth={1.8} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      <div style={{ padding: "0.85rem 1.1rem", borderTop: "0.5px solid #334155" }}>
        <div style={{ fontSize: 10.5, color: "#94a3b8", marginBottom: 6 }}>Rasio Pengeluaran</div>
        <div style={{ height: 5, background: "#0f172a", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: pct > 80 ? "#EF4444" : pct > 60 ? ACCENT : "#10B981", borderRadius: 99, transition: "width 0.5s" }} />
        </div>
        <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 5 }}>{pct}% dari pemasukan</div>
      </div>

      <div style={{ padding: "0.75rem 1.1rem", borderTop: "0.5px solid #334155" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: ACCENT + "28", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: ACCENT }}>U</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: "#fff" }}>Raihan</div>
            <div style={{ fontSize: 10.5, color: "#94a3b8" }}>ardiansyahraihan23@gmail.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SummaryCard({ label, amount, change, pos, Icon, color }) {
  return (
    <div className="card fade-in">
      <div style={{ display: "flex", justifycontent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "auto" }}>
          <Icon size={14} color={color} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.8px", marginBottom: 6 }}>{fmtIDR(amount)}</div>
      <div style={{ fontSize: 11.5, color: pos ? "#10B981" : "#EF4444", display: "flex", alignItems: "center", gap: 3 }}>
        {pos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{change} vs bulan lalu</span>
      </div>
    </div>
  );
}

function DonutChart({ data }) {
  const ref = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;
    if (chart.current) chart.current.destroy();
    chart.current = new Chart(ref.current, {
      type: "doughnut",
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.color),
          borderColor: "#1e293b",
          borderWidth: 3,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "74%",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ` ${c.label}: ${fmtIDR(c.raw)}` } },
        },
      },
    });
    return () => { if (chart.current) { chart.current.destroy(); chart.current = null; } };
  }, [data]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative", height: 188 }}>
        <canvas ref={ref}>Distribusi pengeluaran per kategori</canvas>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>TOTAL</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", marginTop: 2 }}>{fmtIDR(total)}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 14 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
            <div style={{ width: 7, height: 7, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ color: "#94a3b8" }}>{d.label}</span>
            <span style={{ color: "#64748b" }}>({total > 0 ? Math.round((d.value / total) * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIInsights({ transactions }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const run = useCallback(async () => {
    setLoading(true); setErr(""); setText("");
    try {
      const exp = transactions.filter(t => t.amount < 0).reduce((a, t) => {
        a[t.category || t.cat] = (a[t.category || t.cat] || 0) + Math.abs(t.amount); return a;
      }, {});
      const totalIn = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

      const prompt = `Analisis data keuangan personal berikut (IDR):
Pemasukan: Rp ${totalIn.toLocaleString("id-ID")}
Pengeluaran: Rp ${totalOut.toLocaleString("id-ID")} (${totalIn > 0 ? Math.round((totalOut/totalIn)*100) : 0}% dari pemasukan)
Per kategori: ${Object.entries(exp).map(([k,v]) => `${CAT_LABELS[k] || k} Rp ${v.toLocaleString("id-ID")}`).join(", ")}

Berikan tepat 3 insight keuangan yang spesifik dan actionable dalam bahasa Indonesia. Format setiap poin dengan emoji relevan di awal. Singkat, maksimal 120 kata total.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      setText(data.content?.map(c => c.type === "text" ? c.text : "").join("") || "Tidak ada data.");
    } catch {
      setErr("Gagal terhubung ke AI. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [transactions]);

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: "#fff" }}>
            <Sparkles size={14} color={ACCENT} />
            AI Insights
          </div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 3 }}>Analisis cerdas keuangan Anda</div>
        </div>
        <button className="btn prime" onClick={run} disabled={loading} style={{ fontSize: 12 }}>
          <Sparkles size={12} />
          {loading ? "Memproses..." : "Analisis"}
        </button>
      </div>

      {loading && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
          {[85, 72, 90, 60].map((w, i) => (
            <div key={i} className="shimmer" style={{ height: 11, width: `${w}%` }} />
          ))}
        </div>
      )}

      {!loading && !text && !err && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#94a3b8", paddingBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: ACCENT + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} color={ACCENT} />
          </div>
          <div style={{ textAlign: "center", fontSize: 12.5, lineHeight: 1.6 }}>
            Klik <strong style={{ color: "#fff" }}>Analisis</strong> untuk mendapatkan<br />rekomendasi keuangan AI
          </div>
        </div>
      )}

      {err && <div style={{ color: "#EF4444", fontSize: 13 }}>{err}</div>}

      {text && (
        <div className="fade-in" style={{ fontSize: 13, lineHeight: 1.75, color: "#fff", whiteSpace: "pre-wrap", flex: 1 }}>
          {text}
        </div>
      )}
    </div>
  );
}

function DashboardPage({ transactions }) {
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const balance = income - expense;

  const donutData = Object.entries(
    transactions.filter(t => t.amount < 0).reduce((a, t) => { 
      const categoryKey = t.category || t.cat;
      a[categoryKey] = (a[categoryKey] || 0) + Math.abs(t.amount); return a; 
    }, {})
  ).map(([cat, value]) => ({ label: CAT_LABELS[cat] || cat, value, color: CAT_COLORS[cat] || "#64748b" })).sort((a, b) => b.value - a.value);

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 21, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 3 }}>Ringkasan keuangan asli dari database MySQL/Flask</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 18 }}>
<SummaryCard label="Total Pemasukan" amount={income} change="" pos={true} Icon={TrendingUp} color="#10B981" />
<SummaryCard label="Total Pengeluaran" amount={expense} change="" pos={false} Icon={TrendingDown} color="#EF4444" />
<SummaryCard label="Saldo Bersih" amount={balance} change="" pos={true} Icon={CircleDollarSign} color={ACCENT} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <div className="card">
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", marginBottom: 2 }}>Distribusi Pengeluaran</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginBottom: 14 }}>Per kategori · live data</div>
          <DonutChart data={donutData} />
        </div>
        <AIInsights transactions={transactions} />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "0.9rem 1.1rem", borderBottom: "0.5px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>Transaksi Terbaru</span>
          <span style={{ fontSize: 11.5, color: "#94a3b8" }}>5 terakhir</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th>Kategori</th>
              <th style={{ textAlign: "right" }}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t, idx) => (
              <tr key={t.id || idx}>
                <td style={{ color: "#94a3b8", whiteSpace: "nowrap", fontSize: 12 }}>{fmtDate(t.date)}</td>
                <td style={{ maxWidth: 180 }}>{t.description || t.desc}</td>
                <td><span className="badge" style={{ background: (CAT_COLORS[t.category || t.cat] || "#64748b") + "22", color: CAT_COLORS[t.category || t.cat] || "#fff" }}>{CAT_LABELS[t.category || t.cat] || t.category}</span></td>
                <td style={{ textAlign: "right", fontWeight: 600, color: t.amount > 0 ? "#10B981" : "#EF4444", fontVariantNumeric: "tabular-nums" }}>
                  {t.amount > 0 ? "+" : ""}{fmtIDR(t.amount)}
                </td>
              </tr>
            ))}
            {!recent.length && (
              <tr><td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransactionsPage({ transactions, onRefreshData }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sk, setSk] = useState("date");
  const [sd, setSd] = useState("desc");

  // State untuk form input popup modal transaksi baru
  const [showForm, setShowForm] = useState(false);
  const [isExpense, setIsExpense] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'makanan',
    amount: ''
  });

  const sort = (key) => { if (sk === key) setSd(d => d === "asc" ? "desc" : "asc"); else { setSk(key); setSd("desc"); } };

  const rows = transactions
    .filter(t => cat === "all" || (t.category || t.cat) === cat)
    .filter(t => (t.description || t.desc || "").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      let va = a[sk], vb = b[sk];
      if (sk === "date") { va = new Date(va); vb = new Date(vb); }
      if (sk === "amount") { va = Math.abs(va); vb = Math.abs(vb); }
      return sd === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
  e.preventDefault();
  if (!formData.description || !formData.amount) {
    alert("Deskripsi dan nominal tidak boleh kosong!");
    return;
  }
  setLoading(true);
  try {
    const amt = parseFloat(formData.amount);
    const finalAmount = isExpense ? -Math.abs(amt) : Math.abs(amt);

    await createTransaction({
      date: formData.date,
      description: formData.description,
      category: formData.category,
      amount: finalAmount,
    });

    // ✅ Tunggu data baru selesai di-fetch dulu, BARU tutup form
    if (onRefreshData) await onRefreshData();

    // Reset form & tutup modal (hanya sekali, setelah data fresh)
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "makanan",
      amount: "",
    });
    setShowForm(false);

  } catch (err) {
    console.error(err);
    alert("Gagal konek database backend.");
  } finally {
    setLoading(false);
  }
};
  const SortIco = ({ k }) => {
    if (sk !== k) return <ChevronsUpDown size={11} style={{ opacity: 0.4, verticalAlign: "middle", marginLeft: 3 }} />;
    return sd === "asc"
      ? <ChevronUp size={11} style={{ verticalAlign: "middle", marginLeft: 3, color: ACCENT }} />
      : <ChevronDown size={11} style={{ verticalAlign: "middle", marginLeft: 3, color: ACCENT }} />;
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 21, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>Transaksi</h1>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 3 }}>Riwayat semua transaksi keuangan asli database</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <input className="pf-input" placeholder="🔍  Cari transaksi..." value={q} onChange={e => setQ(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
        <select className="pf-select" value={cat} onChange={e => setCat(e.target.value)}>
          <option value="all">Semua Kategori</option>
          {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn" onClick={() => { setQ(""); setCat("all"); }}><RotateCcw size={13} /> Reset</button>
        {/* AKTIFKAN TOMBOL TAMBAH TRANSAKSI DI SINI */}
        <button className="btn prime" onClick={() => setShowForm(true)}><Plus size={13} /> Tambah</button>
      </div>

      {/* POPUP MODAL FORM TRANSAKSI BARU */}
      {showForm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "#000000a0", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
          <div className="card fade-in" style={{ width: "100%", maxWidth: 420, padding: "1.5rem", position: "relative", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)" }}>
            <button style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }} onClick={() => setShowForm(false)}>
              <X size={18} />
            </button>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: "1rem" }}>Tambah Transaksi Baru</h3>
            
            {/* TABS TOGGLE PEMASUKAN/PENGELUARAN */}
            <div style={{ display: "flex", background: "#0f172a", padding: 3, borderRadius: 8, marginBottom: 16, border: "0.5px solid #334155" }}>
              <button type="button" onClick={() => setIsExpense(false)} style={{ flex: 1, padding: "6px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: !isExpense ? "#10B981" : "transparent", color: !isExpense ? "#000" : "#94a3b8" }}>Pemasukan</button>
              <button type="button" onClick={() => setIsExpense(true)} style={{ flex: 1, padding: "6px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: isExpense ? "#EF4444" : "transparent", color: isExpense ? "#fff" : "#94a3b8" }}>Pengeluaran</button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, color: "#94a3b8" }}>Jumlah Uang (Rp)</label>
                <input type="number" name="amount" className="pf-input" placeholder="Contoh: 50000" value={formData.amount} onChange={handleInputChange} required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, color: "#94a3b8" }}>Kategori</label>
                <select name="category" className="pf-select" value={formData.category} onChange={handleInputChange}>
                  {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, color: "#94a3b8" }}>Deskripsi Keterangan</label>
                <input type="text" name="description" className="pf-input" placeholder="Contoh: Makan siang Padang" value={formData.description} onChange={handleInputChange} required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, color: "#94a3b8" }}>Tanggal</label>
                <input type="date" name="date" className="pf-input" value={formData.date} onChange={handleInputChange} required />
              </div>
              <button type="submit" disabled={loading} className="btn prime" style={{ marginTop: 8, justifyContent: "center", padding: "0.6rem" }}>
                {loading ? "Menyimpan ke MySQL..." : "Simpan Transaksi"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "0.75rem 1.1rem", borderBottom: "0.5px solid #334155", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{rows.length} transaksi ditemukan</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11.5, color: "#10B981", fontWeight: 500 }}>
            ↑ {fmtIDR(rows.filter(t => t.amount > 0).reduce((s,t)=>s+t.amount,0))}
          </span>
          <span style={{ fontSize: 11.5, color: "#EF4444", fontWeight: 500 }}>
            ↓ {fmtIDR(rows.filter(t => t.amount < 0).reduce((s,t)=>s+Math.abs(t.amount),0))}
          </span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th onClick={() => sort("date")}>Tanggal <SortIco k="date" /></th>
              <th onClick={() => sort("desc")}>Keterangan <SortIco k="desc" /></th>
              <th>Kategori</th>
              <th onClick={() => sort("amount")} style={{ textAlign: "right" }}>Jumlah <SortIco k="amount" /></th>
              <th style={{ textAlign: "right" }}>Tipe</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t, idx) => {
              const currentCat = t.category || t.cat;
              return (
                <tr key={t.id || idx}>
                  <td style={{ color: "#94a3b8", fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(t.date)}</td>
                  <td>{t.description || t.desc}</td>
                  <td><span className="badge" style={{ background: (CAT_COLORS[currentCat] || "#64748b") + "22", color: CAT_COLORS[currentCat] || "#fff" }}>{CAT_LABELS[currentCat] || currentCat}</span></td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: t.amount > 0 ? "#10B981" : "#EF4444", fontVariantNumeric: "tabular-nums" }}>
                    {t.amount > 0 ? "+" : ""}{fmtIDR(t.amount)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="badge" style={{ background: t.amount > 0 ? "#10B98120" : "#EF444420", color: t.amount > 0 ? "#10B981" : "#EF4444" }}>
                      {t.amount > 0 ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </td>
                </tr>
              )
            })}
            {!rows.length && (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "2.5rem", color: "#64748b", fontSize: 13 }}>Tidak ada transaksi ditemukan</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Placeholder({ title, Icon }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 10, color: "#64748b" }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} strokeWidth={1.5} color={ACCENT} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 500, color: "#94a3b8" }}>{title}</div>
      <div style={{ fontSize: 12.5 }}>Fitur ini segera hadir</div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  // State global untuk menampung data live dari Flask Database
  const [dbTransactions, setDbTransactions] = useState([]);

  // Fungsi penarik data dari Flask API
// Di App.jsx — sudah benar, tidak perlu diubah
const refreshDatabaseData = async () => {
    try {
      const response = await getTransactions();
      
      // KARENA HASIL LOG LU MENUNJUKKAN DATA LANGSUNG KELUAR DI 'response' (BUKAN 'response.data')
      // MAKA KITA LANGSUNG SET VARIABEL RESPONSE-NYA, CHIEF!
      const dataAmbil = response.data || response; 
      
      console.log("Data siap dimasukkan ke state:", dataAmbil);
      setDbTransactions(Array.isArray(dataAmbil) ? dataAmbil : []);
    } catch (err) {
      console.error("Gagal sinkronisasi data Flask backend:", err);
    }
  };

  // Jalankan penarikan data live pas aplikasi pertama dibuka
  useEffect(() => {
    refreshDatabaseData();
  }, []);

  const content = {
    dashboard: <DashboardPage transactions={dbTransactions} />,
    transactions: <TransactionsPage 
  transactions={dbTransactions} 
  onRefreshData={refreshDatabaseData} // <-- TAMBAHIN KABEL COLOKAN INI!
/>,
    reports: <Placeholder title="Laporan" Icon={BarChart2} />,
    budget: <Placeholder title="Anggaran" Icon={Wallet} />,
    settings: <Placeholder title="Pengaturan" Icon={Settings} />,
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="pf-wrap">
        <Sidebar page={page} setPage={setPage} transactions={dbTransactions} />
        <main className="pf-main">{content[page]}</main>
      </div>
    </>
  );
}