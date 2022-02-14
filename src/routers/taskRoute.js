const express = require('express');
const router = new express.Router();
const Task = require('../models/task');

const auth = require('../middleware/auth');

router.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        user: req.user._id
    })

    try {
        await task.save(),
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.next),
                sort
            }
        }).execPopulate()
        res.send({status: true, message: 'task retrieved successfully', tasks: req.user.tasks})
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const  _id = req.params.id

    try {
        //const task = await Task.findById(_id)
        const task = await Task.findOne({_id, user: req.user._id})
        if(!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) =>
     allowedUpdates.includes(update))

     if (!isValidOperation) {
         return res.status(400).send({error: 'Invalid operation'})
     }

     try {

        const task = await Task.findOne({_id, user: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOneAndDelete({_id, user: req.user._id})
        if (!task) {
            return res.status(404).send
        }
        res.send({message: 'Task deleted successfully'})
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router;