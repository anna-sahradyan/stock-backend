const mongoose = require("mongoose");
mongoose.set("strictQuery", false)

const connectDB = async () => {

    try {

        const connect = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB connected`)
    } catch (err) {

        console.log(err);
        process.exit(1);
    }

}
module.exports = connectDB;