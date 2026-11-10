import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Debe llamarse 'db' para que coincida con tus archivos de rutas
export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345678',
  database: process.env.DB_NAME || 'tienda_aceites',
  waitForConnections: true,
  connectionLimit: 10
});

export default db;