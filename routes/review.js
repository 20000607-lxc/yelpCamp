const express = require('express');
const catchAsync = require('../utils/catchAsync')
const CampGround = require('../models/campground');
const Review = require('../models/reviews')
const router = express.Router({mergeParams:true});
// so that the params in app.use('/campgrounds/:id/reviews', reviewRoutes)
// ie the id, will be merged into the router
const {isLoggedIn, isReviewAuthor,validateReview} = require('../middle')




router.delete('/:rid', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { rid } = req.params;
    const { id } = req.params;
    await Review.findByIdAndDelete(rid);
    const result = await CampGround.findByIdAndUpdate(id, {$pull:{reviews:rid}}) // remove the review from cmap 
    // console.log(result)
    req.flash('success', 'successfully delete a review')
    res.redirect(`/campgrounds/${id}`)
}))

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res, next) =>{
    const camp = await CampGround.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    console.log('successfully reviewed! ')
    req.flash('success', 'successfully make a new review')
    res.redirect(`/campgrounds/${camp._id}`)

}))

module.exports = router