const nodemailer = require("nodemailer");
// require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false,
    port: 25,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const welcomeEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: "mruserdonotreply@gmail.com",
            to: email,
            subject: "Sending Email using Node.js",
            text: `Welcome ${name}. Let us know how you get along with this application`,
        };
        await transporter.sendMail(mailOptions);
    } catch (e) {
        console.log(e.message);
    }
};

module.exports = {
    welcomeEmail,
};
