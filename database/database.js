require('dotenv').config();
const Sequelize = require('sequelize');

const conn = new Sequelize({
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST || 'localhost',
    dialect: process.env.DATABASE_DIALECT,
    port: process.env.DATABASE_PORT
})

module.exports = conn;