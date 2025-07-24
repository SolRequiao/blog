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



app.get('/', (req, res) => {
    res.render('index' ,
        {
            page_title : 'Home',
        });
});

app.get('/error', (req, res) => {
    res.render('error',
        {
            page_title: 'Error',
            msgError: req.query.msgError
        });
});

app.use('/', categoriesController);

app.use('/', articlesController);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});