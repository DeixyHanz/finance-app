import axios from 'axios';

// Ini alamat URL jembatan menuju Flask Backend kamu
const API_URL = 'http://localhost:5000/api';

// 1. Fungsi untuk mengambil semua data transaksi dari MySQL
export const getTransactions = async () => {
    try {
        const response = await axios.get(`${API_URL}/transactions`);
        return response.data;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
};

// 2. Fungsi untuk mengirim/menyimpan transaksi baru ke MySQL
export const createTransaction = async (transactionData) => {
    try {
        const response = await axios.post(`${API_URL}/transactions`, transactionData);
        return response.data;
    } catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
    }
};