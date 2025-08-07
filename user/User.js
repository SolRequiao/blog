const Sequelize = require("sequelize");
const conn = require("../database/database.js");

const User = conn.define('users', {
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

User.sync().then(() => {
    console.log('Users table OK');
}).catch(e => {
    console.error('Error creating Users table:', e);
});

module.exports = User;