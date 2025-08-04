require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT;
const conn = require('./database/database.js');
const bodyParser = require('body-parser');


//contorller imports
const categoriesController = require('./categories/CategoriesController.js');
const articlesController = require('./articles/ArticlesController.js');

//Model imports
const Category = require('./categories/Category.js');
const Article = require('./articles/Article.js');
const { or } = require('sequelize');


conn.authenticate().then(() => {
    console.log('Database conn OK');
}).catch(error => {
    console.error('Database conn error:', error);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.get('/error', (req, res) => {
    res.render('error', {
        page_title: 'Error',
        msgError: req.query.msgError || 'An unexpected error occurred.'
    });
});

app.get('/', (req, res) => {

    Article.findAll({
        order: [['id', 'DESC']],
        limit: 4,
        where: {
            published: true
        }
    }).then(articles => {
        Category.findAll({
            order: [['id', 'DESC']]
        }).then(categories => {
            res.render('index', {
                page_title: 'Home',
                articles: articles,
                categories: categories,

            });
        }).catch(error => {
            console.error('Error fetching categories:', error);
            res.redirect('/error?msgError=Failed to load categories.');
        });
    }).catch(error => {
        console.error('Error fetching articles:', error);
        res.redirect('/error?msgError=Failed to load articles.');
    });
});

app.get('/:slug', (req, res) => {
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
            Category.findAll({
                order: [['id', 'DESC']]
            }).then(categories => {
                res.render('article', {
                    page_title: `Article: ${article.title}`,
                    article: article,
                    categories: categories
                });
            }).catch(error => {
                console.error('Error fetching categories:', error);
                res.redirect('/error?msgError=Failed to load categories.');
            });
        } else {
            res.redirect('/error?msgError=Article not found.');
        }
    }).catch(error => {
        console.error('Error fetching article:', error);
        res.redirect('/error?msgError=Failed to load article.');
    });
});

app.get('/category/:slug', (req, res) => {
    const { slug } = req.params;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{
            model: Article, as: 'articles',
            required: true,
            where: { published: true },
            order: [['id', 'DESC']]
        }]
    }).then(category => {
        if (category) {
            Category.findAll({
                order: [['id', 'DESC']]
            }).then(categories => {
                res.render('index', {
                    page_title: `Category: ${category.title}`,
                    category: category,
                    articles: category.articles,
                    categories: categories
                });
            }).catch(error => {
                console.error('Error fetching categories:', error);
                res.redirect('/error?msgError=Failed to load categories.');
            });
        } else {
            res.redirect('/error?msgError=Category not found.');
        }
    }).catch(error => {
        console.error('Error fetching category:', error);
        res.redirect('/error?msgError=Failed to load category.');
    });
});

app.get('/article/more', (req, res) => {
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
        }).then(categories => {
            res.render('article/more', {
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

app.use('/', categoriesController);

app.use('/', articlesController);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});