import Portofolio from '../models/PortofolioModel.js';
import Path from 'path';
import fs from 'fs';

export const getPortofolios = async (req, res) => {
  try {
    const response = await Portofolio.findAll();
    res.json({
      status: 'Berhasil Menampilkan Data Portofolio',
      response,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getPortofolioById = async (req, res) => {
  try {
    const response = await Portofolio.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.json({
      status: 'Berhasil Menampilkan Data Portofolio Berdasarkan Id',
      response,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getPortofolioByUserId = async (req, res) => {};

export const savePortofolio = async (req, res) => {
  if (req.files === null) return res.status(400).json({ msg: 'No file uploaded' });
  const name = req.body.name;
  const description = req.body.description;
  const category = req.body.category;
  const link = req.body.link;
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = Path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get('host')}/images/portofolio/${fileName}`;
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
  // input image ke folder public/images
  file.mv(`./public/images/portofolio/${fileName}`, async (err) => {
    if (err) return res.status(500).json({ msg: err.message });
    try {
      await Portofolio.create({
        name: name,
        description: description,
        category: category,
        link: link,
        image: fileName,
        url: url,
      });
      res.status(201).json({ msg: 'Portofolio Berhasil Ditambahkan' });
    } catch (error) {
      console.log(error.message);
    }
  });
};

export const updatePortofolio = async (req, res) => {
  const portofolio = await Portofolio.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!portofolio) return res.status(404).json({ msg: 'Data tidak ditemukan' });
  let fileName = '';
  if (req.files === null) {
    fileName = portofolio.image;
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

    // hapus file image lama
    const filepath = `./public/images/portofolio/${portofolio.image}`;
    fs.unlinkSync(filepath);

    // simpan file image baru
    file.mv(`./public/images/portofolio/${fileName}`, (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });
  }
  const name = req.body.name;
  const description = req.body.description;
  const category = req.body.category;
  const link = req.body.link;
  const url = `${req.protocol}://${req.get('host')}/images/portofolio/${fileName}`;
  try {
    await Portofolio.update(
      {
        name: name,
        description: description,
        category: category,
        link: link,
        image: fileName,
        url: url,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json({
      msg: 'Berhasil Mengubah Data Portofolio',
    });
  } catch (error) {
    console.log(error.message);
  }
};

export const deletePortofolio = async (req, res) => {
  const portofolio = await Portofolio.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!portofolio) return res.status(404).json({ msg: 'Data tidak ditemukan' });
  try {
    const filepath = `./public/images/portofolio/${portofolio.image}`;
    fs.unlinkSync(filepath);
    await Portofolio.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: 'Portofolio Berhasil Dihapus' });
  } catch (error) {
    console.log(error);
  }
};
