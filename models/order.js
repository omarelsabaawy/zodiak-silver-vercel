const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    town: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    otherInfo: {
        type: String,
        required: false
    },
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }]

});

module.exports = mongoose.model('Order', orderSchema);