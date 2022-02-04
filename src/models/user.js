const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
    {
        'name': {
            type: String,
            required: true,
            trim: true
        },
        'age': {
            type: Number,
        },
        'email': {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if(!validator.isEmail(value)) {
                    throw new Error('Email is invalid');
                }
            }
        },
        'password': {
            type: String,
            required: true,
            minLength: 7,
            trim: true,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error('Password not right with me')
                }
            }
        },
        'tokens': [{
            token: {
                type: String,
                required: true
            }
        }]
    }
)

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'khalifasarkinturawa', {expiresIn: '2 hours'})

    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('User does not exist')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Invalid email or password')
    }

    return user;
}

//Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    console.log('Just before saving')

    next()
})

const User = mongoose.model('User', userSchema);

module.exports = User