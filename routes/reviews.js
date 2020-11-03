const express 										= require('express');
const router 										= express.Router({mergeParams:true});
const Review 										= require('../models/review');
const reviews										= require('../controllers/reviews');
const Space 										= require('../models/space');
const ExpressError									= require('../utils/ExpressError');
const catchAsync 									= require('../utils/catchAsync');
const {isLoggedIn, isReviewAuthor, validateReview}	= require('../middleware');

//create review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

//export line
module.exports = router;