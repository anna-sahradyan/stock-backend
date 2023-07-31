const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Token = require("../models/Token");
const sendEmail = require("../utils/sendEmail");
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"});
};
const registerUser = asyncHandler(async (req, res, next) => {
    try {
        const {name, email, password} = req.body;
        if (!name || !email || !password) {
            res.status(400);
            throw new Error("Please fill in all required fields");
        }
        if (password.length < 6) {
            res.status(400);
            throw new Error("Password must be up to 6 characters");
        }
        const userExist = await User.findOne({email});
        if (userExist) {
            res.status(400);
            throw new Error("Email has already been registered");
        }


        //?create new user
        const user = await User.create({
            name, email, password,
        });
        //? generate Token
        const token = generateToken(user._id);
        //? Send HTTP-only cookie
        res.cookie("token", token, {
            path: "/", httpOnly: true, expires: new Date(Date.now() + 1000 * 86400), //!1 day
            sameSite: "none", secure: true
        });
        if (user) {
            const {_id, name, email, photo, phone, bio} = user
            res.status(201).json({
                _id, name, email, photo, phone, bio, token

            });
        } else {
            res.status(400);
            throw new Error("Invalid user data");
        }

    } catch (err) {
        next(err);
    }
});
//?Login
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("Please add email and password");
    }
    //? Check if user exists
    const user = await User.findOne({email})
    if (!user) {
        res.status(400);
        throw new Error("User not found, please signup");
    }
    //?User exists, check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    const token = generateToken(user._id);
    //? Send HTTP-only cookie
    res.cookie("token", token, {
        path: "/", httpOnly: true, expires: new Date(Date.now() + 1000 * 86400), //!1 day
        sameSite: "none", secure: true
    });
    if (user && passwordIsCorrect) {
        const {_id, name, email, photo, phone, bio} = user
        res.status(200).json({
            _id, name, email, photo, phone, bio, token
        });
    } else {
        res.status(400);
        throw new Error("Invalid email or password");
    }
});
//?logOut
const logOut = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        path: "/", httpOnly: true, expires: new Date(0), //!1 day
        sameSite: "none", secure: true
    });
    return res.status(200).json({message: "Successfully Logged Out"})
})
//?get user
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const {_id, name, email, photo, phone, bio} = user
        res.status(200).json({
            _id, name, email, photo, phone, bio,
        });
    } else {
        res.status(400);
        throw new Error("User Not Found");
    }
});
//?Logged
const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false)
    }
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
        return res.json(true);
    }
    return res.json(false);
});
//?update user
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const {name, email, photo, phone, bio} = user;
        user.email = email;
        user.phone = req.body.phone || phone;
        user.photo = req.body.photo || photo;
        user.name = req.body.name || name;
        user.bio = req.body.bio || bio;
        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
        })
    } else {
        res.status(404);
        throw  new Error("User not found");
    }

});
//?change password
const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const {oldPassword, password} = req.body;
    if (!user) {
        res.status(400);
        throw  new Error("User not found ,please signup");
    }
    //!validate
    if (!oldPassword || !password) {
        res.status(400);
        throw  new Error("please add old and new password")
    }
    //!check if old  password matches password in DB
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);
//!save new password
    if (user && passwordIsCorrect) {
        user.password = password
        await user.save();
        res.status(200).send("Password changes successful");
    } else {
        res.status(400);
        throw new Error("Old password is incorrect")
    }
});

//?forgot password
const forgotPassword = asyncHandler(async (req, res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        res.status(404);
        throw new Error("User does not exist");
    }
    //?Delete token if it exists in DB
    let token = await
        Token.findOne({userId: user._id});
    if (token) {
        await token.deleteOne()
    }

    //?Create Rest Token
    let
        resetToken = crypto.randomBytes(32).toString("hex") + user._id;
    console.log("resetToken----------------"+resetToken)
    //?Hash token before saving to DB
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    //?Save Token to DB
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000)
    }).save();
    //?Construct reset url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    //?Reset Email
    const message = `
    <h2>Hello ${user.name}</h2>
    <p>Please use the url below to reset your password</p>
    <p>This reset link is valid for only 30 minutes</p>
 <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
 <p>Regards...</p>
 <p>Pinvent Team</p>
   `;
    console.log(message);
    const subject = "Password Reset Request";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    try {
        await sendEmail(subject, message, send_to, sent_from);
        res.status(200).json({success: true, message: "Reset Email Sent"})
    } catch (err) {
        res.status(500);
        throw  new Error("Email not sent, please try again")
    }

});
//?reset password
const resetPassword = asyncHandler(async (req, res, next) => {
    const {password} = req.body;
    const {resetToken} = req.params;
    //?hash token compare to Token in DB
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    //?find token in DB
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {$gt: Date.now()}
    })
    if (!userToken) {
        res.status(404);
        throw  new Error("Invalid or Expired Token");
    }
    //? Find user
    const user = await User.findOne({_id: userToken.userId})
    user.password = password;
    await user.save();
    res.status(200).json({
        message:"Password Reset Successful, Please Login"
    })

});
module.exports = {
    resetPassword,
    changePassword,
    forgotPassword,
    registerUser,
    loginStatus,
    updateUser,
    loginUser,
    getUser,
    logOut,


}