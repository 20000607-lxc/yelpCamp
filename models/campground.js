const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Review = require('./reviews')

const ImageSchema = new Schema({
    url: String,
    filename: String
});
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_300')
});

const CampGroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point' (the exact string!)
        },
        coordinates: {
            type: [Number],
        }
    },
    images: [ImageSchema],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})
// post middleware
// can only be triggerd by findByIdAndDelete(and findOneAndDelete) 
// (beucase findByIdAndDelete will call findOneAndDelete autoly)
// remove() can not trigger this
CampGroundSchema.post('findOneAndDelete', async function (camp) {
    console.log(camp)
    console.log("post middleware!")
    if (camp.reviews.length) {
        const res = await Review.deleteMany({ _id: { $in: camp.reviews } })
        console.log(res)
    }

})

module.exports = mongoose.model('CampGround', CampGroundSchema)