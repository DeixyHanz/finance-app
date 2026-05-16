import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Kita panggil amunisi sapu bersih dari chart.js
import { Chart, registerables } from 'chart.js';

// Daftarkan SEMUA komponen grafik secara global sekaligus!
Chart.register(...registerables);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);