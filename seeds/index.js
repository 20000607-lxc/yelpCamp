const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/yelp', {
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
const cities = require('./cities')
const { places, descriptors } = require('./seedhelpers')

const CampGround = require('../models/campground')


const sample = (array) => array[Math.floor(Math.random() * array.length)]


const seedDB = async () => {
    await CampGround.deleteMany({})
    // const c = new CampGround({title:'purple field'});
    // await c.save();
    for (let i = 0; i < 50; i++) {
        const price = Math.floor(Math.random() * 20) + 10;
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new CampGround({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city},${cities[random1000].state} `,
            // images: 'https://source.unsplash.com/collection/483251',
            images: [
                {
                    url: 'https://res.cloudinary.com/dfnstrxxw/image/upload/v1672256913/yelpCamp/zunbfz9sow7vxpz8ofxc.jpg',
                    filename: 'yelpCamp/zunbfz9sow7vxpz8ofxc'
                },
                {
                    url: 'https://res.cloudinary.com/dfnstrxxw/image/upload/v1672255116/yelpCamp/ffgchqciyejcfa6cuxwt.jpg',
                    filename: 'yelpCamp/ffgchqciyejcfa6cuxwt',
                }
            ],
            author: "63ab998fc29c6a85d238d249",
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique porro expedita, harum adipisci culpa fugit laborum, saepe nihil eaque animi cumque vel cum dicta quidem quia? Id aliquam omnis est.',
            price: price,
            geometry:{
                type:'Point',
                coordinates:[-113.13, 47,02]
            }
        })
        await camp.save();

    }
}
seedDB().then(() => {
    mongoose.connection.close(); // after creating the data, stop connection 
})