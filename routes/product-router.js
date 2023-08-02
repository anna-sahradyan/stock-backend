const express = require("express");
const {createProduct, getAllProducts} = require("../controllers/product-controller");
const protect = require("../middleware/authMiddlware");
const {upload} = require("../utils/fileUpload");
const router = express.Router();

router.post("/", protect, upload.single("image"), createProduct);
router.get("/",protect, getAllProducts);


module.exports = router;
