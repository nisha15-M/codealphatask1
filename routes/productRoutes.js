const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");

router.get("/mine", protect, getMyProducts);
router.route("/").get(protect, getProducts).post(protect, createProduct);
router
  .route("/:id")
  .get(protect, getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

module.exports = router;
