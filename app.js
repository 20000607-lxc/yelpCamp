if (process.env.NODE_ENV!== "production"){
    // if we are in dev mode, take the credentials in the .env file and make it accessable 
    require('dotenv').config()
}
const dbUrl = 'mongodb://localhost:27017/yelp' // process.env.DB_URL;

console.log(process.env.CLOUDINARY_KEY)
const mongoSanitize = require('express-mongo-sanitize');
const express = require('express');
const app = express();
const path = require('path')
const ExpressError = require('./utils/expressError')
const engine = require('ejs-mate');
app.engine('ejs', engine);

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const methodOverride = require('method-override')
app.use(express.static(path.join(__dirname, 'public')))
// so that the scripts inside the dir `public` can be included in the boilerplate.ejs
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true })) // use this to parse the input from the form! 
const helmet = require('helmet')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

const session = require('express-session')
const MongoDBStore = require('connect-mongo')

const store = MongoDBStore.create(
    { 
        mongoUrl:dbUrl, 
        secret:'notagoodsecret', 
        touchAfter: 24 * 3600 // only update the data in the database once every 24 hour
    } );

store.on('error', function (error) {
    console.log('Store Error!')
})

const sessionOption = {
    store:store, // use mongo to store session information 
    name:'yelp',
    // the default name is connect.sid, but we can use custom name
    secret:'notagoodsecret',
    resave:false,
    saveUninitialized:true, 
    cookie:{
        httpOnly:true,
        // the cookie can not be accessed by a client side script(java script)
        // secure:true,
        // the cookie can only be modified through https (no localhost, no js)
        expires:Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge:1000 * 60 * 60 * 24 * 7,
    },

}
app.use(session(sessionOption))

const flash = require('connect-flash')
// ******************** use flash must be after use session! ********************
app.use(flash())

app.use(passport.initialize())
app.use(passport.session()) //  keep the user loged-in, passport.session() should be used after app.use(session(sessionOption))
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())// store the users 
passport.deserializeUser(User.deserializeUser()) // remove the users 


const campRoutes = require('./routes/campground')
const reviewRoutes = require('./routes/review')
const userRoutes = require('./routes/users');

app.use(mongoSanitize());
// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.params
// - req.headers
// - req.query
// NOTICE: if the key contains $ ., it will be fully removed, the value will not be affected 

app.use((req, res, next) => {
    // console.log('query',req.query)
    // req.user is only there when we use passport, so this should 
    // be defined after use passport
    res.locals.currentUser = req.user;
    // currentUser can be accessed in every file
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    // console.log(req.session)
    next();
})
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
mongoose.connect(dbUrl, {
    // useNewUrlParser:true,
    // useCreateIndex:true,
    // useUnifiedTopology:true
    // Mongoose 6 always behaves as if useNewUrlParser, useUnifiedTopology,
    // and useCreateIndex are true
}).then(() => {
    console.log("connection open!")
})
.catch(err => {
    console.log(err)
})

app.use('/campgrounds', campRoutes)
app.use('/', userRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')

})

// match with every path that is not handled by the former handlers 
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    if (!err.message) {
        err.message = "Unknown Fault"
    }
    const { status = 500 } = err;
    console.log(err.message)
    console.log('error handler runs')
    res.status(status).render('error', { err })
    // res.status(status).send(message);
})

const port = process.env.PORT || 3000 
// if process.env.PORT is not available, will use 3000 
app.listen(port, () => {
    console.log(`serving on port ${port}`)
})