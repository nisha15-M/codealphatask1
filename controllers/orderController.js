const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// @desc   Buyer requests a product (buy / claim free item / propose exchange)
// @route  POST /api/orders
// @access Private
const createOrder = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    if (product.status !== "active") {
      res.status(400);
      throw new Error("This listing is no longer available");
    }
    if (product.seller.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("You cannot request your own listing");
    }

    const order = await Order.create({
      product: product._id,
      buyer: req.user._id,
      seller: product.seller,
      listingType: product.listingType,
      price: product.price,
      meetupPoint: product.meetupPoint,
    });

    // Mark the product reserved so it doesn't get double-requested
    product.status = "reserved";
    await product.save();

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc   Seller accepts or rejects a pending order
// @route  PUT /api/orders/:id/respond
// @access Private
const respondToOrder = async (req, res, next) => {
  try {
    const { action } = req.body; // "accept" or "reject"
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (order.seller.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to respond to this order");
    }
    if (order.status !== "pending") {
      res.status(400);
      throw new Error("This order has already been responded to");
    }

    const product = await Product.findById(order.product);

    if (action === "accept") {
      order.status = "accepted";
      if (product) {
        product.status = "reserved";
        await product.save();
      }
    } else {
      order.status = "cancelled";
      if (product) {
        product.status = "active"; // release the listing back
        await product.save();
      }
    }

    await order.save();
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc   Mark an order completed and rate the seller (feeds trustScore)
// @route  PUT /api/orders/:id/complete
// @access Private
const completeOrder = async (req, res, next) => {
  try {
    const { sellerRating } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    if (order.buyer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Only the buyer can mark this order complete");
    }
    if (order.status !== "accepted") {
      res.status(400);
      throw new Error("Order must be accepted before it can be completed");
    }

    order.status = "completed";
    if (sellerRating) order.sellerRating = sellerRating;
    await order.save();

    const product = await Product.findById(order.product);
    if (product) {
      product.status = "sold";
      await product.save();
    }

    // Update seller's trust score: weighted average of ratings, nudged toward 50 baseline
    if (sellerRating) {
      const seller = await User.findById(order.seller);
      seller.ratingsSum += sellerRating;
      seller.ratingsCount += 1;
      const avgRating = seller.ratingsSum / seller.ratingsCount; // 1-5 scale
      seller.trustScore = Math.round((avgRating / 5) * 100);
      await seller.save();
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc   Get orders where the logged-in user is the buyer
// @route  GET /api/orders/purchases
// @access Private
const getMyPurchases = async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("product", "title images price listingType")
      .populate("seller", "name trustScore")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc   Get orders where the logged-in user is the seller
// @route  GET /api/orders/sales
// @access Private
const getMySales = async (req, res, next) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate("product", "title images price listingType")
      .populate("buyer", "name trustScore")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  respondToOrder,
  completeOrder,
  getMyPurchases,
  getMySales,
};
