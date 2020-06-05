const router = require("express").Router();
const Task = require("../models/tasks");
const auth = require("../middleware/auth");

router.post("/tasks", auth, (req, res, next) => {
    const tasks = new Task({
        ...req.body,
        creator: req.user._id,
    });
    tasks
        .save()
        .then((result) => {
            res.status(201).send(result);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

router.get("/tasks", auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === "true";
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        console.log(parts);
        sort[parts[0]] = parts[1] === ("DESC" || "desc ") ? -1 : 1;
    }

    try {
        await req.user
            .populate({
                path: "tasks",
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort,
                },
            })
            .execPopulate();
        res.status(200).send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
});

router.get("/tasks/:id", auth, (req, res, next) => {
    const id = req.params.id;
    Task.findOne({
        _id: id,
        creator: req.user._id,
    })
        .then((task) => {
            if (!task) {
                return res.status(404).send();
            }
            res.status(200).send(task);
        })
        .catch((err) => res.status(500).send());
});

router.patch("/tasks/:id", auth, async (req, res, next) => {
    const id = req.params.id;
    const updates = Object.keys(req.body);
    const allowUpdates = ["description", "completed"];
    isValid = updates.every((update) => allowUpdates.includes(update));
    if (!isValid) {
        return res.status(400).send({
            error: "Invalid update!",
        });
    }

    try {
        const task = await Task.findOne({
            _id: id,
            creator: req.user._id,
        });

        if (!task) {
            return res.status(400).send();
        }

        updates.forEach((update) => (task[update] = req.body[update]));
        await task.save();

        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete("/tasks/:id", auth, async (req, res, next) => {
    const id = req.params.id;

    const task = await Task.findOneAndDelete({
        _id: id,
        creator: req.user._id,
    });
    if (!task) {
        return res.status(400).send();
    }
    res.status(200).send("Task Deleted");
});

module.exports = router;
