const express = require('express');
const router = express.Router();
const Category = require('./Category');
const slugify = require('slugify');
const Article = require('../articles/Article');


router.get('/admin/categories/new', (req, res) => {
    let errors = [];
    if (req.query.state) {
        const { errors: e = [] } = JSON.parse(req.query.state);
        errors = e;
    }
    res.render('admin/categories/new', {
        page_title: 'New Category',
        errors
    });
});

router.get('/admin/categories/:num', (req, res) => {
    let { num } = req.params
    let offset = 0
    if (isNaN(offset) || offset === 1) {
        offset = 0
    } else {
        offset = parseInt(num) * 20
    }
    Category.findAndCountAll({
        limit: 20,
        offset: offset,
        order: [['updatedAt', 'DESC']]
    }).then(categories => {
        let next = true ? offset + 20 < categories.count : false;
        res.render('admin/categories',
            {
                page_title: 'Categories',
                categories: categories,
                next: next,
                num: parseInt(num)
            })
    }).catch(e => {
        console.error('Error finding Category data:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error finding Category data!')}`);
    });
});

router.post('/category/save', (req, res) => {
    const { title } = req.body;
    Category.create({
        title,
        slug: slugify(title, { lower: true })
    })
    .then(() => {
        res.redirect('/admin/categories/0');
    })
    .catch(e => {
        if (e.name === 'SequelizeValidationError' || e.name === 'SequelizeUniqueConstraintError') {
            const errors = e.errors.map(x => ({
                //field: x.path,
                //rule: x.validatorKey,
                message: x.message
            }));
            const msgError = { errors, formData: { title } };
            const state = encodeURIComponent(JSON.stringify(msgError));
            return res.redirect(`/admin/categories/new?state=${state}`);
        }
        console.error('Error saving Category:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error saving Category!')}`);
    });
});

router.get('/admin/categories/delete/:id', (req, res) => {
    const { id } = req.params;
    Category.findOne({
        where: {
            id: id
        }
    }).then((category) => {
        if (id != category.id) {
            return res.redirect(`/error?msgError=${encodeURIComponent('Error finding Category data')}`);
        }
        res.render('admin/categories/delete', {
            page_title: 'Delete Category',
            category: category,
            msgError: req.query.msgError
        });
    }).catch(e => {
        console.error('Error finding category data:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error finding category data')}`);
    });
});

router.post('/category/delete', (req, res) => {
    const { id } = req.body;
    Article.count({ where: { categoryId: id } }).then(count => {
        if (count > 0) {
            return res.redirect(`/admin/categories/delete/${id}?msgError=${encodeURIComponent('This category cannot be deleted because it has articles associated with it')}`);
        }
        Category.destroy({ where: { id } }).then(() => {
            res.redirect('/admin/categories/0');
        }).catch(e => {
            console.error('Error deleting Category data:', e);
            res.redirect(`/error?msgError=${encodeURIComponent('Error deleting Category data')}`);
        });
    }).catch(e => {
        console.error('Error counting articles in category:', e);
        return res.redirect(`/error?msgError=${encodeURIComponent('Error counting articles in category')}`);
    });
});

router.get('/admin/categories/edit/:id', (req, res) => {
    const { id } = req.params;
    let errors = [];
    Category.findOne({
        where: {
            id: id
        }
    }).then((category) => {
        if (id != category.id) {
            return res.redirect(`/error?msgError=${encodeURIComponent('Error finding Category data')}`);
        }
        if (req.query.state) {
            const { errors: e = [] } = JSON.parse(req.query.state);
            errors = e;
        }
        res.render('admin/categories/edit',
            {
                page_title: 'Edit Category',
                category: category,
                errors
            });
    }).catch(e => {
        console.error('Error finding Category data:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error finding Category data')}`)
    });
});

router.post('/category/edit', (req, res) => {
    const { id, title } = req.body;
    Category.update({
        title: title,
        slug: slugify(title, {
            lower: true
        })
    },
        {
            where: {
                id: id
            }
    }).then(() => {
        res.redirect('/admin/categories/0');
    }).catch(e => {
        if (e.name === 'SequelizeValidationError' || e.name === 'SequelizeUniqueConstraintError') {
        const errors = e.errors.map(x => ({
            //field: x.path,
            //rule: x.validatorKey,
            message: x.message
        }));
        const msgError = { errors, formData: { title, id } };
        const state = encodeURIComponent(JSON.stringify(msgError));
        return res.redirect(`/admin/categories/edit/${id}?state=${state}`);
    }
    console.error('Error saving Category:', e);
    res.redirect(`/error?msgError=${encodeURIComponent('Error saving Category!')}`);
    });
});

router.get('/admin/categories/info/:id', (req, res) => {
    const { id } = req.params;
    Category.findOne({
        where: {
            id: id
        }
    }).then((category) => {
        if (id != category.id) {
            return res.redirect(`/error?msgError=${encodeURIComponent('Error finding Category data')}`);
        }
        res.render('admin/categories/info',
            {
                page_title: 'Info Category',
                category: category,
                msgError: req.query.msgError
            });
    }).catch(e => {
        console.error('Error finding Category data:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error finding Category data')}`)
    });
});

module.exports = router;