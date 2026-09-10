const Product = require("../models/Product");

// @desc   Create a new product listing
// @route  POST /api/products
// @access Private
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      listingType,
      price,
      exchangeFor,
      condition,
      images,
      urgent,
      meetupPoint,
      semesterTag,
    } = req.body;

    if (!title || !description || !category || !condition) {
      res.status(400);
      throw new Error("Please fill in all required fields");
    }

    const product = await Product.create({
      title,
      description,
      category,
      listingType: listingType || "sell",
      price: listingType === "sell" ? price : 0,
      exchangeFor,
      condition,
      images,
      urgent: !!urgent,
      meetupPoint,
      college: req.user.college, // listing is scoped to seller's own campus
      seller: req.user._id,
      semesterTag: semesterTag || "Fall2026",
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc   Get products (search, filter, campus-scoped)
// @route  GET /api/products
// @access Private
const getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      listingType,
      condition,
      minPrice,
      maxPrice,
      urgent,
      sameCollegeOnly,
    } = req.query;

    const filter = { status: "active" };

    if (keyword) {
      filter.$text = { $search: keyword };
    }
    if (category) filter.category = category;
    if (listingType) filter.listingType = listingType;
    if (condition) filter.condition = condition;
    if (urgent === "true") filter.urgent = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Default: only show listings from the logged-in user's own campus
    if (sameCollegeOnly !== "false" && req.user) {
      filter.college = req.user.college;
    }

    const products = await Product.find(filter)
      .populate("seller", "name trustScore ratingsCount")
      .sort({ urgent: -1, createdAt: -1 });

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc   Get single product by ID
// @route  GET /api/products/:id
// @access Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name trustScore ratingsCount college"
    );

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc   Update a product (owner only)
// @route  PUT /api/products/:id
// @access Private
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to edit this listing");
    }

    const updatable = [
      "title",
      "description",
      "category",
      "listingType",
      "price",
      "exchangeFor",
      "condition",
      "images",
      "urgent",
      "meetupPoint",
      "status",
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc   Delete a product (owner only)
// @route  DELETE /api/products/:id
// @access Private
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      throw new Error("Not authorized to delete this listing");
    }

    await product.deleteOne();
    res.json({ message: "Listing removed" });
  } catch (error) {
    next(error);
  }
};

// @desc   Get logged-in user's own listings
// @route  GET /api/products/mine
// @access Private
const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
};
