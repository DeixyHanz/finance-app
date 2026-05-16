import React from 'react';
import { Doughnut } from 'react-chartjs-2';
// Nah, amunisi ini yang wajib kita panggil langsung dari chart.js bawaannya
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Daftarkan komponen lingkaran agar mesin Chart.js tahu cara menggambarnya
ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = () => {
  // Data dummy untuk mengetes grafik dashboard keuangan kamu
  const data = {
    labels: ['Makanan', 'Transportasi', 'Hiburan', 'Investasi'],
    datasets: [
      {
        label: ' Pengeluaran (Rupiah)',
        data: [1200000, 500000, 300000, 1000000],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',  // Merah (Tailwind red-500)
          'rgba(59, 130, 246, 0.8)', // Biru (Tailwind blue-500)
          'rgba(234, 179, 8, 0.8)',  // Kuning (Tailwind yellow-500)
          'rgba(34, 197, 94, 0.8)',  // Hijau (Tailwind green-500)
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff' // Biar teks legenda warna putih cocok dengan tema gelap
        }
      }
    }
  };

  return (
    <div class="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 max-w-md mx-auto">
      <h3 class="text-lg font-semibold text-white mb-4 text-center">Alokasi Pengeluaran</h3>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DonutChart;