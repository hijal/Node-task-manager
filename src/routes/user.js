const router = require("express").Router();
const User = require("../models/users");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { welcomeEmail } = require("../emails/account");

const upload = multer({
    dest: "avatar",
    limits: {
        fileSize: 1024 * 1024 * 1,
    },
    fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            return callback(
                new Error("Please upload an image with jpg or png or jpeg")
            );
        }
        callback(undefined, true);
    },
});

router.post("/users", async (req, res, next) => {
    const existEmail = await User.findOne({ email: req.body.email });
    if (existEmail) {
        return res.status(400).send({
            error: "E-mail already exists!",
        });
    }

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });
    try {
        await user.save();
        const token = await user.generateToken();
        welcomeEmail(user.email, user.name);
        res.status(201).send({
            user,
            token,
        });
    } catch (e) {
        res.status(400).send({
            error: e.message,
        });
    }
});

router.post("/users/login", async (req, res, next) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.generateToken();
        res.status(200).send({
            user,
            token,
        });
    } catch (e) {
        res.status(401).send({
            error: "login failed!",
        });
    }
});

router.post("/users/logout", auth, async (req, res, next) => {
    try {
        req.user.tokens = req.user.tokens.filter(
            (token) => token.token !== req.token
        );
        await req.user.save();
        res.status(200).send({
            success: "Logout successfully!",
        });
    } catch (e) {
        res.status(401).send({
            success: "Logout Successfully",
        });
    }
});

router.post("/users/logoutAll", auth, async (req, res, next) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send({
            success: "Logout from all Successfully",
        });
    } catch (e) {
        res.status(500).send({
            success: "Logout from all Successfully",
        });
    }
});

router.get("/users/me", auth, async (req, res, next) => {
    res.status(200).send(req.user);
});

router.post(
    "/users/me/avatar",
    auth,
    upload.single("image"),
    async (req, res) => {
        const buffer = await sharp(req.file.filename)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);

router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set("Content-Type", "image/png");
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
});

router.patch("/users/me", auth, async (req, res, next) => {
    const updates = Object.keys(req.body);
    const allowUpdates = ["name", "email", "password"];
    isValidUser = updates.every((update) => allowUpdates.includes(update));

    if (!isValidUser) {
        return res.status(400).send({
            error: "Invalid update!",
        });
    }

    try {
        updates.forEach((update) => (req.user[update] = req.body[update]));
        await req.user.save();
        res.send(req.user);
    } catch (e) {
        res.status(400).send({
            error: "Update failed!",
        });
    }
});

router.delete("/users/me", auth, async (req, res, next) => {
    try {
        await req.user.remove();
        res.status(200).send({
            success: "Deleted user successfully",
        });
    } catch (e) {
        res.status(400).send({
            error: "delete failed!",
        });
    }
});

module.exports = router;
