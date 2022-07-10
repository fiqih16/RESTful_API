import express from 'express';
import router from './routes.js';
import db from './config/Database.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import FileUpload from 'express-fileupload';
dotenv.config();

const app = express();

try {
  await db.authenticate();
  console.log('Koneksi ke database berhasil');
} catch (error) {
  console.error(error);
}
// mengubah folder public menjadi static
app.use(express.static('public'));
// file upload
app.use(FileUpload());
// akses api dari luar domain
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
// Mengunakan cookie parser sebagai middleware
app.use(cookieParser());
// Untuk Menerima data berbentuk JSON
app.use(express.json());
// Sebagai middleware untuk mengirimkan data berbentuk JSON
app.use(router);

app.listen(5000, () => console.log('Server started on port 5000'));
