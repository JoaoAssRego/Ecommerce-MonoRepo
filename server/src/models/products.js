import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
    url: {type: String, required: true},
    publicId: {type: String, required: true},
    alt: {type: String, default: ''},
    isPrimary: {type: Boolean, default: false}
},
    {_id: false}
);

const variantSchema = new mongoose.Schema({
    sku: {type: String, required: true},
    attributes: {type: Map, of: String},
    priceInCents: {type: Number, required: true, min: 0},
    stock: {type: Number, required: true, min: 0, default: 0},
    discountPriceInCents: {
        type: Number, 
        validate: { validator: function(val) { return val <= this.priceInCents; }, message: "The discount can't be higher than Price" }, 
        default: 0
    }
},
    {_id: true}
);