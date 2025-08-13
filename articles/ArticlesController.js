const express = require('express');
const router = express.Router();
const Category = require('../categories/Category');
const Article = require('./Article');
const slugify = require('slugify');


router.get('/admin/articles/new', (req, res) => {
    let errors = [];
    if (req.query.state) {
        const { errors: e = [] } = JSON.parse(req.query.state);
        errors = e;
    }
    Category.findAll({}).then(categories => {
        res.render('admin/articles/new', {
            page_title: 'New Article',
            categories: categories,
            errors
        });
    }).catch(e => {
        console.error('Error fetching categories for new article:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error fetching categories for new article')}`);
    });
});

router.post('/article/save', (req, res) => {
    const { title, body, published, category } = req.body;
    if (published === 'on') {
        publiushed = true;
    } else {
        publiushed = false;
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
        res.redirect('/admin/articles/0');
    }).catch(e => {
        if (e.name === 'SequelizeValidationError' || e.name === 'SequelizeUniqueConstraintError') {
            const errors = e.errors.map( x => ({
                //field: x.path,
                //rule: x.validatorKey,
                message: x.message
            }));
            const msgError = { errors, formData: { title, body, published, category }}
            const state = encodeURIComponent(JSON.stringify(msgError))
            return res.redirect(`/admin/articles/new?state=${state}`)
        }
        console.error('Error ->', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error saving Article')}`);
    });
});

router.get('/admin/articles/:num', (req, res) => {
    let { num } = req.params;
    let offset = 0;
    if (isNaN(num) || num === 1) {
        offset = 0;
    } else {
        offset = parseInt(num) * 20;
    }
    Article.findAndCountAll({
        limit: 20,
        offset: offset,
        order: [['updatedAt', 'DESC']],
        include: [{
            model: Category, as: 'category',
            required: true,
            attributes: ['id', 'title']
        }]
    }).then(articles => {
        let next = true ? offset + 20 < articles.count : false;
        res.render('admin/articles', {
            page_title: 'Articles',
            articles: articles,
            num: parseInt(num),
            next: next
        });
    }).catch(e => {
        console.error('Error fetching articles:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error fetching articles')}`);
    });
});

router.get('/admin/articles/delete/:id', (req, res) => {
    const { id } = req.params;
    Article.findOne({ where: { id: id } }).then((article) => {
        if (id != article.id) {
            return res.redirect(`/error?msgError=${encodeURIComponent('Error finding Article data')}`);
        }
        res.render('admin/articles/delete', {
            page_title: 'Delete Article',
            article: article
        });
    }).catch(e => {
        console.error('Error finding article data:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error finding article data')}`);
    });
});

router.post('/article/delete', (req, res) => {
    const { id } = req.body;
    Article.destroy({ where: { id: id } }).then(() => {
        res.redirect('/admin/articles/0');
    }).catch(e => {
        console.error('Error deleting article:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error deleting article')}`);
    });
});

router.get('/admin/articles/edit/:id', (req, res) => {
    const { id } = req.params;
    let errors = [];
    if (req.query.state) {
        const {errors: e = [] } = JSON.parse(req.query.state);
        errors = e;
    }
    Article.findOne({
        where: { id: id }
    }).then(article => {
        Category.findAll({}).then(categories => {
            res.render('admin/articles/edit', {
                page_title: 'Edit Article',
                article: article,
                categories: categories,
                errors
            });
        }).catch(e => {
            console.error('Error fetching categories for edit:', e);
            res.redirect(`/error?msgError=${encodeURIComponent('Error fetching categories for edit')}`);
        });
    }).catch(e => {
        console.error('Error finding article for edit:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error finding article for edit')}`);
    });
});

router.post('/article/edit', (req, res) => {
    let { id, title, body, published, categoryId } = req.body;
    if (published === 'on') {
        published = true;
    } else {
        published = false;
    }
    Article.update({
        title: title,
        slug: slugify(title, {
            lower: true
        }),
        body: body,
        published: published,
        categoryId: categoryId
    }, {
        where: { id: id }
    }).then(() => {
        res.redirect('/admin/articles/0');
    }).catch(e => {
        if (e.name === 'SequelizeValidationError' || e.name === 'SequelizeUniqueConstraintError') {
            const errors = e.errors.map(x => ({
                //field: x.path,
                //rule: x.validatorKey,
                message: x.message
            }));
            const msgError = { errors, formData: { title, body, published, categoryId }};
            const state = encodeURIComponent(JSON.stringify(msgError));
            return res.redirect(`/admin/articles/edit/${id}?state=${state}`)
        }
        console.error('Error saving article:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error saving article')}`);
    });
});

router.get('/admin/articles/info/:id', (req, res) => {
    const { id } = req.params;
    Article.findOne({
        where: { id: id },
        include: [{
            model: Category, as: 'category',
            required: true,
            attributes: ['id', 'title']
        }]
    }).then(article => {
        if (id != article.id) {
            return res.redirect(`/error?msgError=${encodeURIComponent('Error finding Article data')}`);
        }
        if (!article) {
            return res.redirect(`/error?msgError=${encodeURIComponent('Article not found')}`);
        }
        res.render('admin/articles/info', {
            page_title: 'Info Article',
            article: article
        });
    }).catch(e => {
        console.error('Error fetching article info:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error fetching article info')}`);
    });
});


module.exports = router;
