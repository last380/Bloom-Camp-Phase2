const express 										= require('express');
const router 										= express.Router();
const spaces										= require('../controllers/spaces');
const catchAsync 									= require('../utils/catchAsync');
const ExpressError									= require('../utils/ExpressError');
const Space 										= require('../models/space');
const Joi											= require('joi');
const {spaceSchema}									= require('../schemas.js');
const {isLoggedIn, isAuthor, validateSpace} 		= require('../middleware');
const multer										= require('multer');
const {storage}										= require('../cloudinary');
const upload										= multer({storage});

//index page route
router.get('/', catchAsync(spaces.index));

//space form route
router.get('/new', isLoggedIn, spaces.renderNewForm);

//space form post
router.post('/', isLoggedIn, upload.array('image'), validateSpace, catchAsync(spaces.createSpace));

//show page route
router.get('/:id', catchAsync(spaces.showSpace));

//space edit form route
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(spaces.renderEditForm));

//space edit update route
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateSpace, catchAsync(spaces.updateSpace));

//delete space route
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(spaces.deleteSpace));

//export line
module.exports = router;