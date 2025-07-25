const express = require('express');
const router = express.Router();
const Category = require('../categories/Category');
const Article = require('./Article');
const slugify = require('slugify');

router.get('/admin/articles/new', (req, res) => {
    Category.findAll({}).then(categories => {
        res.render('admin/articles/new', {
            page_title: 'New Article',
            categories: categories,
            msgError: req.query.msgError
        });
    }).catch(e => {
        console.error('Error fetching categories for new article:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error fetching categories for new article!')}`);
    });
});

router.post('/article/save', (req, res) => {
    const { title, body, published, category } = req.body;

    if (published === 'on') {
        publiushed = true;
    } else {
        publiushed = false;
    }

    if (!title) {
        return res.redirect(`/admin/articles/new?msgError=${encodeURIComponent('The Title field must not be blank')}`);
    }
    if (!body) {
        return res.redirect(`/admin/articles/new?msgError=${encodeURIComponent('The Body field must be filled')}`);
    }
    if (!category) {
        return res.redirect(`/admin/articles/new?msgError=${encodeURIComponent('The Category field must be selected')}`);
    }
    Article.create({
        title: title,
        slug: slugify(title, {
            lower: true 
        }),
        body: body,
        published: publiushed,
        categoryId: category
    }).then(() => {
        res.redirect('/');
    }).catch(e => {
        console.error('Error ->', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error saving Article!')}`);
    });
});

module.exports = router;
