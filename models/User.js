const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = mongoose.Schema({
    name: {
        type: String, required: [true, "Please add a  name"]

    }, email: {
        type: String,
        required: [true, "Please add a  email"],
        unique: true,
        trim: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Please enter a valid email"]
    }, password: {
        type: String, required: [true, "Please add a  password"], minLength: [6, "Password must be up to 6 chapters"],

    }, photo: {
        type: String,
        required: [true, "Please add a  photo"],
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNB4VfQNbtkyAHAjB4oELMu2jf_3dK8u-q8A&usqp=CAU"
    }, phone: {
        type: String, default: "+374"
    }, bio: {
        type: String, maxLength: [250, "Password must not be more than 250 chapters"], default: "bio"
    }
}, {
    timestamps: true
});
//?Encrypt password before saving to DB
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    //? Hash password
    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
})
const User = mongoose.model("User", userSchema);
module.exports = User;