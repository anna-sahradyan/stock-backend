const express = require("express");
const {createProduct} = require("../controllers/product-controller");
const protect = require("../middleware/authMiddlware");
const {upload} = require("../utils/fileUpload");
const router = express.Router();

router.post("/", protect, upload.single("image"), createProduct);


module.exports = router;
