const Space = require('../models/space');
const Review = require('../models/review');

module.exports.createReview = async (req, res)=>{
	const space = await Space.findById(req.params.id);
	const review = new Review(req.body.review);
	review.author = req.user._id;
	space.reviews.push(review);
	await review.save();
	await space.save();
	req.flash('success','Your review is posted!');
	res.redirect(`/spaces/${space._id}`);
}

module.exports.deleteReview = async(req, res, next)=>{
	const {id, reviewId} = req.params;
	await Space.findByIdAndUpdate(id, {$pull:{reviews: reviewId}});
	await Review.findByIdAndDelete(req.params.reviewId);
	req.flash('success','Successfully deleted your review!');
	res.redirect(`/spaces/${id}`);
}