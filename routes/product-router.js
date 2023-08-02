const express = require("express");
const {createProduct, getAllProducts, getProduct} = require("../controllers/product-controller");
const protect = require("../middleware/authMiddlware");
const {upload} = require("../utils/fileUpload");
const router = express.Router();

router.post("/", protect, upload.single("image"), createProduct);
router.get("/", protect, getAllProducts);
router.get("/:id", protect, getProduct);


module.exports = router;
