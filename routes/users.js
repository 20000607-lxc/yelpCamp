const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/user')
const passport = require('passport')

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username })
        const registered = await User.register(user, password); 
        // passport does the register function (in which will hash the pw)
        console.log(registered)
        console.log(req.user)
        req.login(registered, err => {
            if(err) {
                console.log('err')
                return next(err)
            }else{
                req.flash('success', 'welcome to yelp camp!')
                res.redirect('/campgrounds')
            }
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }
})

router.get('/login', async (req, res) =>{
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', {failureFlash:true, failureRedirect:true}), async (req, res) =>{
    req.flash('success', 'welcome back to yelp camp')
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    // after we redirect, we will clean the redirect path (for it is useless now)
    res.redirect(redirectUrl)
})

router.get('/logout', (req, res) =>{
    req.logout( err => {
        if(err) {
            console.log('err')
            return next(err)
        }})
    req.flash('success', 'goodbye')
    res.redirect('/campgrounds')
})

module.exports = router