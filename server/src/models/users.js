import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const refreshTokenSchema = new mongoose.Schema(
    {
        token: {type: String, required: true},
        family: {type: String, required: true},
        expiredAt: {type: Date, required: true},
        createdByIp: { type: String },
        userAgent: {type: String,required: true}
    },
    {
        _id: false
    }
)

const userSchema = new mongoose.Schema(
    {
        name: {type: String, required: true, trim: true, maxlength: 100},
        email: {type: String, required: true, trim: true, lowercase: true, unique: true},
        username: {type: String, required: true, lowercase: true, trim: true, minlength: 3},
        passwordHash: {type: String, required: true, select: false},
        role: {type: String, enum: ['customer', 'admin'], default: 'customer'},
        isActive: {type: Boolean, default: true},
        refreshTokens: {
            type: [refreshTokenSchema],
            default: [],
            validate: [arr => arr.length <= 3, 'Não é possível abrir mais de 3 sessões.']
        },
        passwordChangedAt: {type: Date}
    },
    {timestamps: true}
)

userSchema.pre('save', async function (next){
    if (!this.isModified('passwordHash')) return next();
    this.passwordHash = await bcrypt.hash(this.passwordHash,12);
    this.passwordChangedAt = new Date(Date.now() - 1000); 
    next();
});

userSchema.methods.comparePassword = function (candidate){
    return bcrypt.compare(candidate,this.passwordHash);
}

userSchema.methods.checkIfActive = function (){
    return this.isActive;    
}

userSchema.methods.toJSON = function (){
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.refreshTokens;
    delete obj.__v;
    return obj;
}

export const User = mongoose.model('User',userSchema);