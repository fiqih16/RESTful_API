import Users from '../models/UserModel.js';
import jwt from 'jsonwebtoken';

export const refreshToken = async (req, res) => {
  try {
    // Mengambil value dari token
    const refreshToken = req.cookies.refreshToken;
    // validasi jika tidak ada token
    if (!refreshToken) return res.sendStatus(401);
    // validasi jika dapat token dan samakan dengan token yang ada di database
    const user = await Users.findAll({
      where: {
        refresh_token: refreshToken,
      },
    });
    // validasi jika tidak ada token yang sama dengan token yang ada di database
    // memanggil index 0 karena hanya single data
    if (!user[0]) return res.sendStatus(403);
    // verifikasi token jika sama dengan yang ada di database
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      // jika error
      if (err) return res.sendStatus(403);
      // jika berhasil, ambil value dari id, name, email dari variabel user
      const userId = user[0].id;
      const name = user[0].name;
      const email = user[0].email;
      // buat access token baru
      const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15s',
      });
      // kirim access token ke client
      res.json({ accessToken });
    });
  } catch (error) {
    console.log(error);
  }
};
