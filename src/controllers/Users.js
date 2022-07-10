import Users from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Path from 'path';
import fs from 'fs';

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ['id', 'name', 'email', 'image'],
    });
    res.json({
      status: 'Berhasil Menampilkan Data User',
      users,
    });
  } catch (error) {
    console.log(error);
  }
};

export const Register = async (req, res) => {
  const { name, email, password, confPassword } = req.body;
  if (password !== confPassword) {
    return res.status(400).json({ msg: 'Passwords dan Confirm Pass Tidak Cocok' });
  }
  // cek email di database
  const user = await Users.findOne({
    where: {
      email,
    },
  });
  // jika email sudah ada
  if (user) {
    return res.status(400).json({ msg: 'Email sudah terdaftar' });
  }
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    await Users.create({
      name: name,
      email: email,
      password: hashPassword,
    });
    res.json({ msg: 'Register Berhasil' });
  } catch (error) {
    console.log(error);
  }
};

export const Login = async (req, res) => {
  try {
    const user = await Users.findAll({
      where: {
        email: req.body.email,
      },
    });
    const match = await bcrypt.compare(req.body.password, user[0].password);
    if (!match) return res.status(400).json({ msg: 'Wrong Password' });
    if (!user) {
      return res.status(400).json({ msg: 'Email tidak terdaftar' });
    }
    const userId = user[0].id;
    const name = user[0].name;
    const email = user[0].email;
    const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '20s',
    });
    const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '1d',
    });
    await Users.update({ refresh_token: refreshToken }, { where: { id: userId } });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    res.status(400).json({ msg: 'Server Error' });
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  // validasi jika tidak ada token
  if (!refreshToken) return res.sendStatus(204);
  const user = await Users.findAll({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].id;
  await Users.update(
    { refresh_token: null },
    {
      where: {
        id: userId,
      },
    }
  );
  res.clearCookie('refreshToken');
  return res.sendStatus(200);
};

export const addImages = async (req, res) => {
  const users = await Users.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!users) return res.status(404).json({ msg: 'Data tidak ditemukan' });

  // jika sudah ada foto tidak bisa upload lagi
  if (users.image) {
    return res.status(400).json({ msg: 'Tidak bisa upload, Foto sudah ada' });
  } else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = Path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get('host')}/images/users/${fileName}`;
    const allowedTypes = ['.jpg', '.jpeg', '.png'];

    // cek file type
    if (!allowedTypes.includes(ext.toLowerCase()))
      return res.status(422).json({
        msg: 'Jenis file tidak diizinkan',
      });
    // cek file size
    if (fileSize > 5000000)
      return res.status(422).json({
        msg: 'Ukuran file setidaknya kurang dari 5MB',
      });
    // input image ke folder public/images/users
    file.mv(`./public/images/users/${fileName}`, async (err) => {
      if (err) return res.status(500).json({ msg: err.message });
      try {
        await Users.update(
          { image: url },
          {
            where: {
              id: req.params.id,
            },
          }
        );
        res.status(201).json({
          msg: 'Berhasil menambahkan gambar',
        });
      } catch (error) {
        console.log(error.message);
      }
    });
  }
};

export const updateImages = async (req, res) => {
  const users = await Users.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!users) return res.status(404).json({ msg: 'Data tidak ditemukan' });
  let fileName = '';
  if (users.image && req.files === null) {
    fileName = users.image.split('/images/users/')[1];
  } else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = Path.extname(file.name);
    fileName = file.md5 + ext;
    const allowedTypes = ['.jpg', '.jpeg', '.png'];

    // cek file type
    if (!allowedTypes.includes(ext.toLowerCase()))
      return res.status(422).json({
        msg: 'Jenis file tidak diizinkan',
      });
    // cek file size
    if (fileSize > 5000000)
      return res.status(422).json({
        msg: 'Ukuran file setidaknya kurang dari 5MB',
      });

    // hapus file lama
    const filepath = `./public/images/users/${users.image.split('/images/users/')[1]}`;
    fs.unlinkSync(filepath);

    // simpan file baru
    file.mv(`./public/images/users/${fileName}`, async (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });
  }
  const url = `${req.protocol}://${req.get('host')}/images/users/${fileName}`;
  try {
    await Users.update(
      {
        image: url,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json({
      msg: 'Berhasil mengubah foto profile',
    });
  } catch (error) {
    console.log(error.message);
  }
};
