const express = require('express');
const router = express.Router();
const Category = require('../categories/Category');
const Article = require('../articles/Article');

router.get('/more/articles/:num', (req, res) => {

    let { num } = req.params;
    let offset = 0;
    if (isNaN(num) || num === 1) {
        offset = 0;
    } else {
        offset = parseInt(num) * 5;
    }

    Article.findAndCountAll({
        order: [['updatedAt', 'DESC']],
        limit: 5,
        offset: offset,
        include: [{
            model: Category, as: 'category',
            required: true,
            attributes: ['id', 'title']
        }]
    }).then(articles => {
        let next;
        next = true ? offset + 5 < articles.count : false;
        Category.findAll({
            order: [['id', 'DESC']]
        }).then(categories => {
            res.render('more/articles', {
                page_title: 'More Articles',
                next: next,
                num: parseInt(num),
                articles: articles,
                categories: categories
            });
        }).catch(e => {
            console.error('Error fetching categories:', e);
            res.redirect(`/error?msgError=${encodeURIComponent('Error fetching categories')}`);
        });
    }).catch(e => {
        console.error('Error fetching articles for pagination:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error fetching articles for pagination')}`);
    });


});

router.get('/more/category/:slug', (req, res) => {
    const { slug } = req.params;
    let { num } = req.query || 0;
    let offset = 0;
    if (isNaN(num) || num === 1) {
        offset = 0;
    } else {
        offset = parseInt(num) * 5;
    }

    Category.findOne({
        where: {
            slug: slug
        },
    }).then(category => {
        if (!category) {
            return res.redirect('/error?msgError=Category not found.');
        }
        Article.findAndCountAll({
            where: {
                categoryId: category.id,
                published: true
            },
            offset: offset,
            limit: 5,
            order: [['id', 'DESC']],
            include: [{
                model: Category, as: 'category',
                required: true,
                attributes: ['id', 'title']
            }]
        }).then(articles => {

            let next;
            next = true ? offset + 5 < articles.count : false;


            res.render('more/category', {
                page_title: `Category: ${category.title}`,
                category: category,

                articles: articles,
                num: parseInt(num),
                next: next
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