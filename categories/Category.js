const Sequelize = require('sequelize');
const conn  = require('../database/database.js');

const Category = conn.define('categories', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    }, slug: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

Category.sync().then(() => {
    console.log('Categories table OK');
}).catch(e => {
    console.error('Error creating Articles table:', e);
});

module.exports = Category;