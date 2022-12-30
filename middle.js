const {campSchema, reviewSchema} = require('./validate')
const ExpressError = require('./utils/expressError')
const CampGround = require('./models/campground');
const Review = require('./models/reviews')
module.exports.isLoggedIn = (req, res, next) => {
    // console.log('req.user', req.user)
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash('error', 'you must sign in first')
        return res.redirect('/login')
    }
    next();
}


module.exports.isAuthor = async (req,res,next) => {
    const { id } = req.params;
    const camp = await CampGround.findById(id);
    if (!camp.author.equals(req.user._id)) {
        req.flash('error', 'you are not allowed to do that!')
        res.redirect(`/campgrounds/${id}`)
    }
    next()
}
module.exports.isReviewAuthor = async (req,res,next) => {
    const { id, rid } = req.params; // get the review id
    const review = await Review.findById(rid);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'you are not allowed to do that!')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.validateCamp = (req, res, next) => {
    console.log(req.body)
    const result = campSchema.validate(req.body);
    //result.error.details is an object, we just want the message out of it 
    if (result.error) {
        console.log(result.error)
        const message = result.error.details.map(el => el.message).join(',')
        throw new ExpressError(message, 400)
    }else{
        next();
    }
    // console.log(result);

}

module.exports.validateReview = (req, res, next) => {
    // console.log(req)
    const result = reviewSchema.validate(req.body);
    if (result.error) {
        const message = result.error.details.map(el => el.message).join(',')
        throw new ExpressError(message, 400)
    }else{
        next();
    }
    // console.log(result);
}