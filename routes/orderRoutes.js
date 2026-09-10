const express = require("express");
const router = express.Router();
const {
  createOrder,
  respondToOrder,
  completeOrder,
  getMyPurchases,
  getMySales,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

router.get("/purchases", protect, getMyPurchases);
router.get("/sales", protect, getMySales);
router.post("/", protect, createOrder);
router.put("/:id/respond", protect, respondToOrder);
router.put("/:id/complete", protect, completeOrder);

module.exports = router;
