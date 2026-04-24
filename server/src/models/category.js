import mongoose from 'mongoose'


const categorySchema = new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      slug: { type: String, required: true, unique: true, lowercase: true },
      parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
      },
      imageUrl: String,
      isActive: { type: Boolean, default: true },
      order: { type: Number, default: 0 }, // para ordenação manual no menu
    },
    { timestamps: true }
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

categorySchema.index({ parent: 1, isActive: 1, order: 1 });

export const Category = mongoose.model('Category',categorySchema);