const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./tasks");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Email is invalid");
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: [6, "length must be at least 6 characters"],
            validate(value) {
                if (value.toLowerCase().includes("password")) {
                    throw new Error("password doesn't contain password!");
                }
            },
        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        avatar: {
            type: Buffer,
        },
    },
    {
        timestamps: true,
    }
);

UserSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "creator",
});

UserSchema.methods.toJSON = function () {
    const user = this;
    const object = user.toObject();
    delete object.password;
    delete object.tokens;
    return object;
};

UserSchema.methods.generateToken = async function () {
    const user = this;
    const token = jwt.sign(
        {
            _id: user._id.toString(),
        },
        process.env.JWT_SECRET
    );

    user.tokens = user.tokens.concat({
        token,
    });
    await user.save();
    return token;
};

UserSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({
        email,
    });
    if (!user) {
        throw new Error("Unable to login");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Unable to login");
    }

    return user;
};

UserSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

UserSchema.pre("remove", async function (next) {
    const user = this;
    await Task.deleteMany({
        creator: user._id,
    });
    next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
