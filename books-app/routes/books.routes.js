const express = require('express');
const router = express.Router();

const Book = require('../models/Book.model');

const { isLoggedIn, checkRoles } = require('../middlewares/route-guard');
const { formatDate } = require('../utils/date-utils');


// Books list
router.get('/listado', (req, res) => {

  // role based rendering
  const userRoles = {
    isAdmin: req.session.currentUser?.role === 'ADMIN',
    isEditor: req.session.currentUser?.role === 'EDITOR'
  }

  Book
    .find()
    .then(books => res.render('books/list', { books, userRoles }))
    .catch(err => console.log(err))
})


// Owned books list
router.get('/mis-libros', isLoggedIn, (req, res) => {

  const { _id: owner } = req.session.currentUser

  Book
    .find({ owner })
    .then(books => res.render('books/list', { books }))
    .catch(err => console.log(err))
})


// Book detail
router.get('/detalles/:book_id', (req, res) => {

  const { book_id } = req.params

  Book
    .findById(book_id)
    .then(book => {
      book.formattedDate = formatDate(book.createdAt)     // uso de función utilitaria
      res.render('books/details', book)
    })
    .catch(err => console.log(err))
})


// New book form (render)
router.get("/crear", isLoggedIn, (req, res) => {
  res.render("books/create")
})


// New book form (handler)
router.post("/crear", isLoggedIn, (req, res) => {

  const { title, description, author, rating } = req.body
  const { _id: owner } = req.session.currentUser

  Book
    .create({ title, description, author, rating, owner })
    .then(book => res.redirect(`/libros/detalles/${book._id}`))
    .catch(err => console.log(err))
})


// Edit book form (render)
router.get("/editar/:book_id", isLoggedIn, checkRoles('ADMIN', 'EDITOR'), (req, res) => {

  const { book_id } = req.params

  Book
    .findById(book_id)
    .then(book => res.render("books/edit", book))
    .catch(err => console.log(err))
})


// Edit book form (handler)
router.post('/editar/:book_id', isLoggedIn, (req, res) => {

  const { book_id } = req.params
  const { title, description, author, rating } = req.body

  Book
    .findByIdAndUpdate(book_id, { title, description, author, rating })
    .then(book => res.redirect(`/libros/detalles/${book._id}`))
    .catch(err => console.log(err))
})


// Delete book
router.post('/eliminar/:book_id', isLoggedIn, (req, res) => {

  const { book_id } = req.params

  Book
    .findByIdAndDelete(book_id)
    .then(() => res.redirect(`/libros/listado`))
    .catch(err => console.log(err))
})


module.exports = router