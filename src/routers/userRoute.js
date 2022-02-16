const express = require('express')
const router = new express.Router();
const User = require('../models/user');

const auth = require('../middleware/auth');
const errorMiddleware = require('../middleware/error');

const multer = require('multer');
const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('Please upload valid image'))
        }
        cb(undefined, true)
        // cb(new Error('Please upload valid image'))
        // cb(undefined, true)
    }
})

/** Route to create a user */
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save();
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

/** Route to login a user */
router.post('/users/login', async (req, res) => {
    try {
       const user = await User.findByCredentials(req.body.email, req.body.password)
       const token = await user.generateAuthToken()
       res.send({user, token})
    } catch (error) {
        res.status(401).send(error)
    }
})

/** Route to logout */
router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save();
        res.send({message: 'Logged out successfully'})
    } catch (error) {
        res.status(500).send(error);
    }
})

/** Route to logout all users */
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save();
        res.send({message: 'Logged out successfully'})
    } catch (error) {
        res.status(500).send(error);
    }
})

/** Route to get all existing users */
router.get('/users/me', auth, async (req, res) => {

    try {
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})

/** Route to update a user's object */
router.patch('/users/me', auth, async (req, res) => {

    const _id = req.user.id

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) =>
     allowedUpdates.includes(update))

     if (!isValidOperation) {
         return res.status(400).send({error: 'Invalid operation'})
     }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

/**Upload user avatar */
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})    
}
)

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

/**Delete user avatar */
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send({message: 'user updated successfully', user: req.user})
})

/** Route to delete a user */
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router