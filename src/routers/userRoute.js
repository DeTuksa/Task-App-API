const express = require('express')
const router = new express.Router();
const User = require('../models/user');

const auth = require('../middleware/auth');

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

/** Route to get a single user */
router.get('/users/:id', async (req, res) => {
    const  _id = req.params.id

    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(400).send()
        }
        res.send(user)
    } catch (error) {
        res.status(500).send(error)
    }
})

/** Route to update a user's object */
router.patch('/users/:', async (req, res) => {

    const _id = req.params.id

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) =>
     allowedUpdates.includes(update))

     if (!isValidOperation) {
         return res.status(400).send({error: 'Invalid operation'})
     }

    try {
        const user = await User.findById(_id)
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        // const user = await User.findByIdAndUpdate(_id, req.body, {
        //     new: true, runValidators: true
        // })
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

/** Route to delete a user */
router.delete('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findByIdAndDelete(_id)
        if (!user) {
            return res.status(404).send
        }
        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router