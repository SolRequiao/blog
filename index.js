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
const { where } = require('sequelize');

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
    res.render('error',
        {
            page_title: 'Error',
            msgError: req.query.msgError
        });
});

app.get('/', (req, res) => {

    Article.findAll({
        include: [{
            model: Category, as: 'category',
            required: true,
            attributes: ['id', 'title']
        }],
        order: [['id', 'DESC']],
        limit: 4,
        where: {
            published: true
        }
    }).then(articles => {
        res.render('index', {
            page_title: 'Home',
            articles: articles,
        });
    }).catch(error => {
        console.error('Error fetching articles:', error);
        res.redirect('/error?msgError=Failed to load articles.');
    });
});



app.use('/', categoriesController);

app.use('/', articlesController);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});