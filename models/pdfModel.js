const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'pdf_crawler',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'your password',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
    }
  );

const PDF = sequelize.define('PDF', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  downloadDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

sequelize.sync()
  .then(() => console.log('Database & tables created!'));

module.exports = { PDF, sequelize };
