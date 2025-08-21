require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT;
const conn = require('./database/database.js');
const bodyParser = require('body-parser');
const session = require('express-session');
const adminAuth = require('./middlewares/adminAuth');
const bcrypt = require('bcryptjs');


//contorller imports
const categoriesController = require('./categories/CategoriesController.js');
const articlesController = require('./articles/ArticlesController.js');
const moreController = require('./more/MoreController.js');
const usersController = require('./user/UserController.js');

//Model imports
const Article = require('./articles/Article.js');
const User = require('./user/User.js')

// Sessions
app.use(session({
    secret: "sessions-secret",
    cookie: {
        maxAge: 7200000
    }
}));

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
    const userName = 'Admin';
    const email = 'admin@mail.com';
    const password = 'admin123!@#';
    const confirmPassword = password;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    User.findOrCreate({
        where: { email: email.toLowerCase() },
        defaults: {
            username: userName,
            email: email.toLowerCase(),
            passwordV: password,
            confirmPasswordV: confirmPassword,
            password: hash
        }
    }).then(() => {
        return Article.findAll({
            order: [['id', 'DESC']],
            limit: 4,
            where: { published: true }
        });
    }).then(articles => {
        res.render('index', {
            page_title: 'Home',
            articles: articles,
            msgFail: null,
        });
    }).catch(error => {
        console.error('Error fetching data:', error);
        res.render('index', {
            page_title: 'Home',
            msgFail: 'Articles not avlailable at the moment.',
        });
    });
});


app.use('/', usersController)

app.use('/', moreController);

app.use('/', adminAuth, categoriesController);

app.use('/', adminAuth, articlesController);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});