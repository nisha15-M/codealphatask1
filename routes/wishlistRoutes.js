const express = require("express");
const router = express.Router();
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

router.route("/").get(protect, getWishlist).post(protect, addToWishlist);
router.delete("/:productId", protect, removeFromWishlist);

module.exports = router;
