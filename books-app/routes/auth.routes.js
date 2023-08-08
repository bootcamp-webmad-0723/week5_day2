const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');

const saltRounds = 10


// Signup form (render)
router.get('/registro', (req, res) => {
    res.render('auth/signup')
})

// Signup form (handler)
router.post('/registro', (req, res, next) => {

    const { username, email, plainPassword } = req.body

    bcrypt
        .genSalt(saltRounds)
        .then(salt => bcrypt.hash(plainPassword, salt))
        .then(hash => User.create({ username, email, password: hash }))
        .then(() => res.redirect('/inicio-sesion'))
        .catch(err => next(err))
})


// Login form (render)
router.get('/inicio-sesion', (req, res) => {

    // Mesnajes de error enviados como query strings en los redirects
    const { err: errorMessage } = req.query

    res.render('auth/login', { errorMessage })
})


// Login form (handler)
router.post('/inicio-sesion', (req, res, next) => {

    const { email, password } = req.body

    if (email.length === 0 || password.length === 0) {
        res.render('auth/login', { errorMessage: 'Rellena todos los campos' })
        return
    }

    User
        .findOne({ email })
        .then(foundUser => {

            if (!foundUser) {
                res.render('auth/login', { errorMessage: 'Usuari@ no reconocido' })
                return
            }

            if (!bcrypt.compareSync(password, foundUser.password)) {
                res.render('auth/login', { errorMessage: 'Contraseña incorrecta' })
                return
            }

            req.session.currentUser = foundUser // login!
            res.redirect('/')
        })
        .catch(err => next(err))
})



router.get('/cerrar-sesion', (req, res) => {
    req.session.destroy(() => res.redirect('/'))
})


module.exports = router