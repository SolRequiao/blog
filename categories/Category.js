const { DataTypes, Sequelize } = require('sequelize');
const conn = require('../database/database.js');

const Category = conn.define('categories', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAtLeastThree(value) {
                if (value.length < 2) {
                    throw new Error('The Title must have at least 2 characters');
                }
            },
            upToTwoHundred(value) {
                if (value.length > 200) {
                    throw new Error('The Title must have at most 200 characters')
                }
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