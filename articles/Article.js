const { DataTypes, Sequelize } = require('sequelize');
const conn  = require('../database/database.js');
const Category = require('../categories/Category.js');

const Article = conn.define('articles', {
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
        type: DataTypes.STRING,
        allowNull: false
    }, body: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {msg: 'The Article Body field must be filled'}
        }
    }, published: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: {msg: 'The Category field must be selected'}
        }
    }
});

Category.hasMany(Article, { foreignKey: 'categoryId', as: 'articles' }); //1xN relationship
Article.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' }); //1x1 relationship

Article.sync().then(() => {
    console.log('Articles table OK');
}).catch(e => {
    console.error('Error creating Articles table:', e);
});

module.exports = Article;