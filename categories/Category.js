const { DataTypes, Sequelize } = require('sequelize');
const conn = require('../database/database.js');

const Category = conn.define('categories', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [2, 200],
                msg: 'The title must be between 2 and 200 characters'
            }
        }
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