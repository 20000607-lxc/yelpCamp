const express = require('express');
const catchAsync = require('../utils/catchAsync')
const CampGround = require('../models/campground');
const router = express.Router();
const { isLoggedIn, isAuthor, validateCamp } = require('../middle')
const multer = require('multer')
// const upload = multer({ dest: 'uploads/' })
const { cloudinary, storage } = require('../cloud')
const upload = multer({ storage });
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
// notice the package name: we want the geocoding service!
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mbxToken })


router.get('/', catchAsync(async (req, res) => {
    const camps = await CampGround.find({});
    // console.log(camps)
    res.render('campgrounds/index', { camps })
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
})
// validateCamp will run first, and if success, will call next to get into the async funtion, 
// else the error thrown will be caught 

router.post('/', isLoggedIn, upload.array('image'), validateCamp, catchAsync(async (req, res, next) => {
    // console.log(req.body)
    // { campground: { title: 'cs', price: '2', location: 'dd' } }
    // map each file into one object 
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1 // will return an array
      }).send()
    const geo = geodata.body.features[0].geometry;
    console.log(geo)
    // it is latitude(纬度) then longitude（经度） [ 2.3483915, 48.8534951 ]
    const files = req.files.map(f => ({ url: f.path, filename: f.filename }))
    const p = new CampGround(req.body.campground);
    p.geometry = geo;
    p.author = req.user._id;
    p.images = files;
    await p.save();
    req.flash('success', 'successfully make a new camp')
    res.redirect('/campgrounds/')
}))

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await CampGround.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    // console.log(camp)
    if (!camp) {
        req.flash('error', 'can not find the camp')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp })


}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await CampGround.findById(id);
    if (!camp) {
        req.flash('error', 'can not find the camp')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { camp })

}))

router.route('/:id').put(isLoggedIn, isAuthor, upload.array('image'), validateCamp, catchAsync(async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('file', req.files)
        console.log('body', req.body)
        const camp = await CampGround.findByIdAndUpdate(id, req.body.campground, { runValidators: true, new: true }).populate('author').populate('reviews');
        const files = req.files.map(f => ({ url: f.path, filename: f.filename }))
        camp.images.push(...files); // add new images, should not directly add an array, only use ... to take all the items out
        if (req.body.deleteImages) {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
        }
        await camp.save()
        req.flash('success', 'successfully update the camp')
        res.render('campgrounds/show', { camp })
    } catch (e) {
        next(e)
    }

}))


router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await CampGround.findByIdAndDelete(id);
    req.flash('success', 'successfully delete the camp')
    res.redirect('/campgrounds')
}))


module.exports = router