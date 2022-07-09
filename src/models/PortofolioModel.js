import { Sequelize } from 'sequelize';
import db from '../config/Database.js';

const { DataTypes } = Sequelize;

const Portofolio = db.define(
  'portofolios',
  {
    name: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    category: {
      type: DataTypes.STRING,
    },
    link: {
      type: DataTypes.STRING,
    },
    image: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Portofolio;

// Migration Portofolio Table
// (async () => {
//   await Portofolio.sync();
// })();
