const express = require('express');
const router = express.Router();
const Category = require('../categories/Category');
const Article = require('../articles/Article');

router.get('/more/articles', (req, res) => {
    Article.findAll({
        order: [['id', 'DESC']],
        where: {
            published: true
        },
        include: [{
            model: Category, as: 'category',
            required: true,
            attributes: ['id', 'title']
        }]
    }).then(articles => {
        Category.findAll({
            order: [['id', 'DESC']]
        }).then(categories => {
            res.render('more/articles', {
                page_title: 'More Articles',
                articles: articles,
                categories: categories
            });
        }).catch(error => {
            console.error('Error fetching categories:', error);
            res.redirect('/error?msgError=Failed to load categories.');
        });
    }).catch(error => {
        console.error('Error fetching more articles:', error);
        res.redirect('/error?msgError=Failed to load more articles.');
    });
});

router.get('/more/category/:slug', (req, res) => {
    const { slug } = req.params;
    Category.findOne({
        where: {
            slug: slug
        }
    }).then(category => {
        if (!category) {
            return res.redirect('/error?msgError=Category not found.');
        }
        Article.findAll({
            where: { 
                categoryId: category.id,
                published: true 
            },
            order: [['id', 'DESC']],
            include: [{
                model: Category, as: 'category',
                required: true,
                attributes: ['id', 'title']
            }]
        }).then(articles => {
            res.render('more/category', {
                page_title: `Category: ${category.title}`,
                category: category,
                articles: articles
            });
        }).catch(error => {
            console.error('Error fetching articles for category:', error);
            res.redirect('/error?msgError=Failed to load articles for category.');
        });
    }).catch(error => {
        console.error('Error fetching category:', error);
        res.redirect('/error?msgError=Failed to load category.');
    });
});

router.get('/more/article/:slug', (req, res) => {
    const { slug } = req.params;
    Article.findOne({
        where: {
            slug: slug,
            published: true
        },
        include: [{
            model: Category, as: 'category',
            required: true,
            attributes: ['id', 'title']
        }]
    }).then(article => {
        if (article) {
            res.render('more/article', {
                page_title: `Article: ${article.title}`,
                article: article
            });
        } else {
            res.redirect('/error?msgError=Article not found.');
        }
    }).catch(error => {
        console.error('Error fetching article:', error);
        res.redirect('/error?msgError=Failed to load article.');
    });
});

module.exports = router;