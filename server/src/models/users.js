import mongoose from 'mongoose';

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
        isActive: {type: Boolean, default: true}
    },
    {timestamps: true}
)