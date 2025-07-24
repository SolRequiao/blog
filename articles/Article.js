const Sequelize = require('sequelize');
const conn  = require('../database/database.js');
const Category = require('../categories/Category.js');

const Article = conn.define('articles', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    }, slug: {
        type: Sequelize.STRING,
        allowNull: false
    }, body: {
        type: Sequelize.TEXT,
        allowNull: false
    }, published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
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