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

const productSchema = new mongoose.Schema({
    title: {type: String, required: true},
    slug: {type: String, unique: true, lowercase: true},
    description: {type: String, required: true},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
    images: {type: [imageSchema], required: true, validate: { validator: function(val) { return val.length <= 10; }, message: "You can't put 10 images from one product" } },
    variants: {type: [variantSchema], required: true},
    basePriceInCents: {type: Number, required: true, min: 0}
},
{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

productSchema.pre('validate', function(next) {
    if (this.title){
        this.slug = this.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-').replace(/[^\w\s-]/g, '');
    }
    next();
})

productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ slug: 1 });

productSchema.virtual('isOutOfStock').get(function() {
    return this.variants.reduce((acc, variant) => acc + variant.stock, 0) === 0;
  });

productSchema.set('toJSON', {
    transform: function (doc,ret){

        ret.variants = ret.variants.map(variant => {
            const v = {...variant}
            delete v.stock
            delete v.__v
            return v;
        })
        delete ret.__v
        return ret;
    }
  });

export const Product = mongoose.model('Product', productSchema);