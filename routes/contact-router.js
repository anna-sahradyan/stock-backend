const express = require("express");
const protect = require("../middleware/authMiddlware");
const {contactUs} = require("../controllers/contact-controller");
const router = express.Router();

router.post("/", protect, contactUs);

module.exports = router;
