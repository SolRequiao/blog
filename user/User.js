const { DataTypes, Sequelize } = require('sequelize');
const conn = require("../database/database.js");
const bcrypt = require('bcryptjs');

const User = conn.define('users', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAtLeastThree(value) {
                if (value.length < 3) {
                    throw new Error('The Name must have at least 3 characters');
                }
            },
            upToTwoHundred(value) {
                if (value.length > 200) {
                    throw new Error('The Name must have at most 200 characters')
                }
            }
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: 'The E-mail alredy exists'
        },
        validate: {
            isEmail: {
                msg: 'Please enter a valid E-mail address'
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    passwordV: {
        type: DataTypes.VIRTUAL,
        allowNull: false,
        validate: {
            isAtLeastSix(value) {
                if (value.length < 6) {
                    throw new Error('The Password must have at least 6 characters');
                }
            },
            upToOneHundred(value) {
                if (value.length > 100) {
                    throw new Error('The Password must have at most 100 characters')
                }
            }
        }
    },
    confirmPasswordV: {
        type: DataTypes.VIRTUAL,
        allowNull: false,
        validate: {
            matchesPassword(value) {
                if (value !== this.passwordV) {
                    throw new Error('Password does not match Confirm Password');
                }
            }
        }
    }
});

User.sync().then(() => {
    console.log('Users table OK');
}).catch(e => {
    console.error('Error creating Users table:', e);
});

module.exports = User;