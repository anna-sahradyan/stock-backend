const express = require("express");
const {createProduct, getAllProducts, getProduct, deleteProduct} = require("../controllers/product-controller");
const protect = require("../middleware/authMiddlware");
const {upload} = require("../utils/fileUpload");
const router = express.Router();

router.post("/", protect, upload.single("image"), createProduct);
router.get("/", protect, getAllProducts);
router.get("/:id", protect, getProduct);
router.delete("/:id", protect, deleteProduct);


module.exports = router;
