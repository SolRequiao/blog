const express = require('express');
const router = express.Router();
const User = require('./User.js');
const bcrypt = require('bcryptjs');

router.get('/admin/users/:num', (req, res) => {
    let { num } = req.params || 0;
    let offset = 0;
    if (isNaN(num) || num === 1){
        offset = 0;
    } else {
        offset = parseInt(num) * 20;
    }

    User.findAndCountAll({
        offset: offset,
        limit: 20,
        order: [['username', 'ASC']]
    }).then(user => {
        let next = true ? offset + 20 < user.count : false;

        res.render('admin/users', {
            page_title: 'Users',
            user: user,
            num: parseInt(num),
            next: next
        });
    })
});

router.get('/admin/users/new', (req, res) => {
    res.render('admin/users/new', {
        page_title: 'New User',
        msgError: req.query.msgError || '',
    });
});

router.post('/user/save', (req, res) => {
    const { userName, email, password, confirmPassword } = req.body;


    if (!userName) {
        return res.redirect(`/admin/users/new?msgError=${encodeURIComponent('The Name field must not be blank')}`)
    }
    if (userName.length < 3) {
        return res.redirect(`/admin/users/new?msgError=${encodeURIComponent('This Name is short, min of 6 chars')}`)
    }
    if (userName.length > 100) {
        return res.redirect(`/admin/users/new?msgError=${encodeURIComponent('This Name is large, max of 100 chars')}`)
    }
    if (!email) {
        return res.redirect(`/admin/users/new?msgError=${encodeURIComponent('The Email field must not be blank')}`)
    }
    if (email) {
        const re = /^[a-z0-9.]+@[a-z0-9]+\.[a-z]+(?:\.[a-z]+)?$/i;
        if (!re.test(email)) {
            return res.redirect(`/admin/users/new?msgError=${encodeURIComponent('Please enter a valid email address')}`);
        }
    }
    if (!password) {
        return res.redirect(`/admin/users/new?msgError=${encodeURIComponent('The Password field must not be blank')}`)
    }
    if (password.length < 6) {
        return res.redirect(`/admin/users/new?msgError=${encodeURIComponent('This Password is short, min of 6 chars')}`)
    }
    if (password.length > 100) {
        return res.redirect(`/admin/users/new?msgError=${encodeURIComponent('This Password is large, max of 100 chars')}`)
    }
    if (!confirmPassword) {
        return res.redirect(`/admin/users/new?msgError=${encodeURIComponent('The Confirm Password field must not be blank')}`)
    }
    if (password != confirmPassword) {
        return res.redirect(`/admin/users/new?msgError=${encodeURIComponent('Password does not match Confirm Password')}`);
    }

    User.findOne({
        where: {
            email: email
        }
    }).then((user) => {
        if (!user) {
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(password, salt)
            User.create({
                username: userName,
                email: email.toLowerCase(),
                password: hash
            }).then(() => {
                res.redirect('/');
            }).catch(e => {
                console.error('Erro to create new User', e)
                return res.redirect(`/admin/users/new?msgError=${encodeURIComponent('Error to create new User')}`)
            });
        } else {
            return res.redirect(`/admin/users/new?msgError=${encodeURIComponent('This email already exits')}`)
        }
    }).catch(e => {
        console.error('Error to validating if email already exists: ', e);
        res.redirect(`/error?msgError=${encodeURIComponent('Erro to validating if email already exists')}`)
    })


});

module.exports = router;