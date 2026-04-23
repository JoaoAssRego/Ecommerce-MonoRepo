import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true, unique: true},
    slug: {type: String, unique: true, lowercase: true},
    parent: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null},
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}}
);

categorySchema.pre('validate', function (next){
    if (this.parent && this.parent.equals(this._id)){
        next(new Error('Uma categoria não pode ser sua própria categoria pai!'))
    }
    if (this.isModified('name')){
        this.slug = this.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\s-]/g, '');
    }
    next();
});

categorySchema.set('toJSON', {
    transform: function (doc,ret){
        delete ret.__v;
        return ret;
    }
});

categorySchema.virtual('isSubCategory').get(function(){ return this.parent !== null; });

export const Category = mongoose.model('Category',categorySchema);