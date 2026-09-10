const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Product = require("./models/Product");

dotenv.config();

// ===============================
// DEMO PRODUCTS
// ===============================

const products = [
  {
    title: "Engineering Mathematics Books",
    description:
      "Engineering Mathematics textbooks useful for college students.",
    category: "Books",
    listingType: "sell",
    price: 450,
    condition: "Like New",
    meetupPoint: "Library",
    urgent: false,
  },

  {
    title: "Scientific Calculator",
    description:
      "Scientific calculator suitable for engineering mathematics and exams.",
    category: "Electronics",
    listingType: "sell",
    price: 650,
    condition: "Used",
    meetupPoint: "Main Gate",
    urgent: false,
  },

  {
    title: "DBMS Textbook Exchange",
    description:
      "DBMS textbook available for exchange with another useful technical book.",
    category: "Books",
    listingType: "exchange",
    price: 0,
    exchangeFor: "Operating Systems or Java book",
    condition: "Used",
    meetupPoint: "Academic Block",
    urgent: false,
  },

  {
    title: "Study Lamp",
    description:
      "Working study lamp. Free for students who need it.",
    category: "Furniture",
    listingType: "free",
    price: 0,
    condition: "Used",
    meetupPoint: "Hostel Block A",
    urgent: false,
  },

  {
    title: "College Backpack",
    description:
      "College backpack with enough space for books and laptop.",
    category: "Clothing",
    listingType: "sell",
    price: 550,
    condition: "Like New",
    meetupPoint: "Canteen",
    urgent: false,
  },

  {
    title: "Lab Coat",
    description:
      "Clean lab coat suitable for engineering and science laboratory sessions.",
    category: "Clothing",
    listingType: "free",
    price: 0,
    condition: "Used",
    meetupPoint: "Academic Block",
    urgent: false,
  },

  {
    title: "Data Structures Textbook",
    description:
      "Data Structures textbook covering arrays, linked lists, stacks, queues and trees.",
    category: "Books",
    listingType: "sell",
    price: 380,
    condition: "Used",
    meetupPoint: "Library",
    urgent: false,
  },

  {
    title: "Python Programming Book",
    description:
      "Beginner-friendly Python programming book for students.",
    category: "Books",
    listingType: "sell",
    price: 420,
    condition: "Like New",
    meetupPoint: "Library",
    urgent: false,
  },

  {
    title: "Wireless Mouse",
    description:
      "Wireless mouse suitable for laptop and desktop use.",
    category: "Electronics",
    listingType: "sell",
    price: 300,
    condition: "Used",
    meetupPoint: "Main Gate",
    urgent: false,
  },

  {
    title: "USB Keyboard",
    description:
      "USB keyboard in good working condition.",
    category: "Electronics",
    listingType: "sell",
    price: 450,
    condition: "Like New",
    meetupPoint: "Academic Block",
    urgent: false,
  },

  {
    title: "College Hoodie",
    description:
      "Comfortable college hoodie suitable for campus wear.",
    category: "Clothing",
    listingType: "sell",
    price: 700,
    condition: "Like New",
    meetupPoint: "Canteen",
    urgent: false,
  },

  {
    title: "Hostel Table Fan",
    description:
      "Table fan suitable for hostel rooms.",
    category: "Electronics",
    listingType: "sell",
    price: 550,
    condition: "Used",
    meetupPoint: "Hostel Block A",
    urgent: false,
  },

  {
    title: "Drawing Sheet Pack",
    description:
      "Drawing sheets useful for engineering graphics and college assignments.",
    category: "Stationery",
    listingType: "free",
    price: 0,
    condition: "New",
    meetupPoint: "Academic Block",
    urgent: false,
  },

  {
    title: "Operating Systems Book",
    description:
      "Operating Systems textbook for engineering students.",
    category: "Books",
    listingType: "sell",
    price: 350,
    condition: "Used",
    meetupPoint: "Library",
    urgent: false,
  },

  {
    title: "Arduino Project Kit",
    description:
      "Arduino project kit for college mini projects and learning.",
    category: "Electronics",
    listingType: "sell",
    price: 800,
    condition: "Like New",
    meetupPoint: "Academic Block",
    urgent: true,
  },

  {
    title: "College Shoes",
    description:
      "Comfortable college shoes in good condition.",
    category: "Clothing",
    listingType: "sell",
    price: 600,
    condition: "Like New",
    meetupPoint: "Main Gate",
    urgent: false,
  },

  {
    title: "Hostel Mattress",
    description:
      "Used hostel mattress available for free.",
    category: "Furniture",
    listingType: "free",
    price: 0,
    condition: "Used",
    meetupPoint: "Hostel Block B",
    urgent: false,
  },

  {
    title: "Java Programming Notes",
    description:
      "Java programming notes useful for placement preparation.",
    category: "Books",
    listingType: "sell",
    price: 150,
    condition: "Used",
    meetupPoint: "Library",
    urgent: false,
  },
];

// ===============================
// SEED DATABASE
// ===============================

const seedDatabase = async () => {
  try {
    // Connect MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    // ===============================
    // CREATE DEMO USER
    // ===============================

    let demoUser = await User.findOne({
      email: "campuscart.demo@gmail.com",
    });

    if (!demoUser) {
      const hashedPassword = await bcrypt.hash(
        "Demo@12345",
        10
      );

      demoUser = await User.create({
        name: "CampusCart Demo Seller",
        email: "campuscart.demo@gmail.com",
        password: hashedPassword,
        college: "KSR College of Engineering",
        role: "student",
        trustScore: 96,
        ratingsSum: 480,
        ratingsCount: 5,
        isVerified: true,
      });

      console.log("Demo seller created");
    } else {
      console.log("Demo seller already exists");
    }

    // ===============================
    // REMOVE OLD DEMO PRODUCTS
    // ===============================

    await Product.deleteMany({
      seller: demoUser._id,
    });

    console.log("Old demo products removed");

    // ===============================
    // ADD SELLER + COMMON DATA
    // ===============================

    const productsToInsert = products.map((product) => ({
      ...product,

      seller: demoUser._id,

      college: "KSR College of Engineering",

      status: "active",

      semesterTag: "Fall2026",

      images: [],
    }));

    // ===============================
    // INSERT PRODUCTS
    // ===============================

    const createdProducts = await Product.insertMany(
      productsToInsert
    );

    console.log(
      `${createdProducts.length} demo products inserted`
    );

    // ===============================
    // SUCCESS MESSAGE
    // ===============================

    console.log("");
    console.log("======================================");
    console.log("       CAMPUSCART SEED COMPLETE");
    console.log("======================================");
    console.log("");
    console.log("Demo Login:");
    console.log("Email: campuscart.demo@gmail.com");
    console.log("Password: Demo@12345");
    console.log("");
    console.log(
      "Products added:",
      createdProducts.length
    );
    console.log("");
    console.log("You can now login from the frontend.");
    console.log("");

    // Close database
    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("SEED ERROR:");
    console.error(error.message);
    console.error("");

    process.exit(1);
  }
};

seedDatabase();