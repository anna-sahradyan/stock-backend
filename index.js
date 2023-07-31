const express = require("express");
const PORT = process.env.PORT || 5000;
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errorMiddleware");
dotenv.config();
const cors = require("cors");
const connectDB = require("./config/connectDB");
const bodyParser = require("body-parser");
const userRouter = require("./routes/user-router");
const productRouter = require("./routes/product-router");
const contactRouter = require("./routes/contact-router");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();


//?middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(cors({origin: true}));
app.use(express.urlencoded({extended: false}));
app.use("/uploads",express.static(path.join(__dirname,"uploads")))

//?Router middleware
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/contactus", contactRouter);
//?DEPLOYMENT CODE
app.get("/", (req, res) => {
    res.send("Home page")
})
//?errorMiddleware
app.use(errorHandler);

connectDB();


app.listen(PORT, () => {
    console.log(` Server is running in http://localhost:${PORT}`)
})

