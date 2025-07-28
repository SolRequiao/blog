const express = require('express');
const router = express.Router();
const Category = require('./Category');
const slugify = require('slugify');
const { where } = require('sequelize');

router.get('/admin/categories/new', (req, res) => {
    res.render('admin/categories/new',
        {
            page_title: 'New Category',
            msgError: req.query.msgError
        });
});

router.get('/admin/categories', (req, res) =>{
    
    Category.findAll({
        order: [['id', 'DESC']]
    }).then(categories => {
        res.render('admin/categories',
        {
            page_title: 'Categories',
            categories: categories,
        })
    }).catch(e => {
        console.error('Error finding Category data:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error finding Category data!')}`);
    });
});

router.post('/category/save', (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.redirect(`/admin/categories/new?msgError=${encodeURIComponent('The title field must not be blank')}`);
    }
    Category.create({
        title: title,
        slug: slugify(title, {
            lower: true
        })
    }).then(() => {
        res.redirect('/admin/categories');
    }).catch(e => {
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
        res.render('admin/categories/delete',
            {
                page_title: 'Delete Category',
                category: category
            });
    }).catch(e => {
        console.error('Error finding category data:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error finding category data')}`);
    });

});

router.post('/category/delete', (req, res) => {
    const { id } = req.body;
    Category.destroy({ where: {id}}).then( () => {
        res.redirect('/admin/categories');
    }).catch(e => {
        console.error('Error deleting Category data:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error deleting Category data')}`);
    });
});

router.get('/admin/categories/edit/:id', (req, res) => {
    const { id } = req.params;

    Category.findOne({
        where: {
            id: id
        }
    }).then((category) => {
        if (id != category.id) {
            return res.redirect(`/error?msgError=${encodeURIComponent('Error finding Category data')}`);
        }
        res.render('admin/categories/edit',
        {
            page_title: 'Edit Category',
            category: category,
            msgError: req.query.msgError
        });
    }).catch(e =>{
        console.error('Error finding Category data:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error finding Category data!')}`)
    });
});

router.post('/category/edit', (req, res) => {
    const { id, title } = req.body;

    if (!title) {
        return res.redirect(`/admin/categories/edit/${id}?msgError=${encodeURIComponent('The title field must not be blank!')}`)
    }

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
    }).then(() =>{
        res.redirect('/admin/categories');
    }).catch(e => {
        console.error('Erro ->', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error saving category!')}`)
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
    }).catch(e =>{
        console.error('Error finding Category data:', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Error finding Category data!')}`)
    });
});

module.exports = router;