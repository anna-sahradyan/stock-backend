const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const {fileSizeFormatter} = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;
cloudinary.config(process.env.CLOUDINARY_URL);
const createProduct = asyncHandler(async (req, res, next) => {
    const {name, category, quantity, price, description} = req.body;
    if (!name || !quantity || !price || !description || !category) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }
//? Handle  Image upload
    let fileData = {};
    if (req.file) {
        //?Save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                folder: "stock server",
                resource_type: "image"
            })
        } catch (err) {
            res.status(500);
            throw new Error("Image could not be uploaded")
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size),
        }
    }

// ?Create product
    const product = await Product.create({
        user: req.user.id,
        name,
        category,
        quantity,
        price,
        description,
        image: fileData

    })
    console.log(product)
    res.status(201).json(product)

});
//?Get all products
const getAllProducts = asyncHandler(async (req, res, next) => {
    const products = await Product.find({user: req.user.id}).sort("-createdAt");
    res.status(200).json(products);
})
module.exports = {
    createProduct,
    getAllProducts
}
