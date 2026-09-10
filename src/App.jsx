import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://localhost:5000/api";

/* =========================================================
   EXISTING CAMPUSCART DEMO PRODUCTS
   These remain visible even when MongoDB has no products.
========================================================= */
const initialProducts = [
  { id: 1, name: "Engineering Mathematics Books", price: 450, type: "Buy", category: "Books", condition: "Like New", seller: "Ananya", trust: 96, location: "Library", emoji: "📚" },
  { id: 2, name: "Scientific Calculator", price: 650, type: "Buy", category: "Electronics", condition: "Good", seller: "Rahul", trust: 92, location: "Main Block", emoji: "🧮" },
  { id: 3, name: "DBMS Textbook Exchange", price: 0, type: "Exchange", category: "Books", condition: "Good", seller: "Priya", trust: 98, location: "CSE Block", emoji: "🔄" },
  { id: 4, name: "Hostel Study Lamp", price: 0, type: "Free", category: "Hostel", condition: "Good", seller: "Karthik", trust: 100, location: "Hostel Gate", emoji: "💡" },
  { id: 5, name: "College Backpack", price: 550, type: "Buy", category: "Fashion", condition: "Like New", seller: "Meena", trust: 94, location: "Canteen", emoji: "🎒" },
  { id: 6, name: "Lab Coat", price: 0, type: "Free", category: "Lab Items", condition: "Good", seller: "Vishnu", trust: 97, location: "Science Block", emoji: "🥼" },
  { id: 7, name: "Data Structures Textbook", price: 380, type: "Buy", category: "Books", condition: "Good", seller: "Arjun", trust: 95, location: "CSE Block", emoji: "📖" },
  { id: 8, name: "Python Programming Book", price: 420, type: "Buy", category: "Books", condition: "Like New", seller: "Harini", trust: 97, location: "Library", emoji: "🐍" },
  { id: 9, name: "Wireless Mouse", price: 300, type: "Buy", category: "Electronics", condition: "Good", seller: "Sanjay", trust: 91, location: "Main Block", emoji: "🖱️" },
  { id: 10, name: "USB Keyboard", price: 450, type: "Buy", category: "Electronics", condition: "Like New", seller: "Divya", trust: 94, location: "CSE Block", emoji: "⌨️" },
  { id: 11, name: "College Hoodie", price: 700, type: "Buy", category: "Fashion", condition: "Like New", seller: "Keerthi", trust: 96, location: "Canteen", emoji: "👕" },
  { id: 12, name: "Hostel Table Fan", price: 550, type: "Buy", category: "Hostel", condition: "Good", seller: "Mohan", trust: 90, location: "Hostel Gate", emoji: "🌀" },
  { id: 13, name: "Drawing Sheet Pack", price: 0, type: "Free", category: "Lab Items", condition: "Good", seller: "Aishwarya", trust: 99, location: "Science Block", emoji: "📄" },
  { id: 14, name: "Operating Systems Book", price: 350, type: "Buy", category: "Books", condition: "Good", seller: "Vijay", trust: 93, location: "Library", emoji: "📚" },
  { id: 15, name: "Arduino Project Kit", price: 800, type: "Buy", category: "Electronics", condition: "Good", seller: "Naveen", trust: 95, location: "ECE Block", emoji: "🔧" },
  { id: 16, name: "College Shoes", price: 600, type: "Buy", category: "Fashion", condition: "Like New", seller: "Swetha", trust: 92, location: "Main Gate", emoji: "👟" },
  { id: 17, name: "Hostel Mattress", price: 0, type: "Free", category: "Hostel", condition: "Good", seller: "Dinesh", trust: 98, location: "Hostel Gate", emoji: "🛏️" },
  { id: 18, name: "Java Programming Notes", price: 150, type: "Buy", category: "Books", condition: "Good", seller: "Lavanya", trust: 96, location: "Library", emoji: "☕" },
];

/* =========================================================
   HELPERS
========================================================= */
const typeToBackend = {
  Buy: "sell",
  Free: "free",
  Exchange: "exchange",
};

const backendToType = {
  sell: "Buy",
  free: "Free",
  exchange: "Exchange",
};

const categoryToBackend = {
  Fashion: "Clothing",
  Hostel: "Furniture",
  "Lab Items": "Lab Equipment",
};

const backendToCategory = {
  Clothing: "Fashion",
  Furniture: "Hostel",
  "Lab Equipment": "Lab Items",
};

const conditionToBackend = {
  Good: "Used",
};

const locationToBackend = {
  "Main Block": "Academic Block",
  "CSE Block": "Academic Block",
  "Science Block": "Academic Block",
  "ECE Block": "Academic Block",
  "Hostel Gate": "Hostel Block A",
  "Department Block": "Academic Block",
};

const backendToLocation = {
  "Academic Block": "Academic Block",
  "Hostel Block A": "Hostel Block A",
  "Hostel Block B": "Hostel Block B",
  "Main Gate": "Main Gate",
  Library: "Library",
  Canteen: "Canteen",
  "Sports Complex": "Sports Complex",
  Other: "Other",
};

const emojiForCategory = (category = "") => {
  const value = category.toLowerCase();
  if (value.includes("book")) return "📚";
  if (value.includes("electronic")) return "💻";
  if (value.includes("clothing") || value.includes("fashion")) return "👕";
  if (value.includes("furniture") || value.includes("hostel")) return "🪑";
  if (value.includes("lab")) return "🔧";
  if (value.includes("sport")) return "⚽";
  if (value.includes("station")) return "✏️";
  return "📦";
};

const toUIProduct = (p) => ({
  ...p,
  id: p._id || p.id,
  name: p.title || p.name || "Campus Item",
  price: Number(p.price || 0),
  type: p.listingType ? backendToType[p.listingType] || "Buy" : p.type || "Buy",
  category: p.category ? backendToCategory[p.category] || p.category : "Other",
  condition: p.condition || "Used",
  seller: p.seller?.name || p.seller || "Student",
  trust: Number(p.seller?.trustScore ?? p.trust ?? 90),
  location: p.meetupPoint ? backendToLocation[p.meetupPoint] || p.meetupPoint : p.location || "Main Gate",
  emoji: p.images?.[0] ? null : p.emoji || emojiForCategory(p.category),
  image: p.images?.[0] || null,
  mongoProduct: Boolean(p._id),
});

/* =========================================================
   APP
========================================================= */
function App() {
  const [products, setProducts] = useState(initialProducts);
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modal, setModal] = useState(null);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [token, setToken] = useState(
    () => localStorage.getItem("campuscartToken") || ""
  );
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("campuscartUser") || "null");
    } catch {
      return null;
    }
  });
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const PRODUCTS_PER_PAGE = 6;

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  };

  /* =======================================================
     LOAD MONGODB PRODUCTS
     IMPORTANT: local 18 products are NEVER removed.
  ======================================================= */
  const loadProducts = async (authToken = token) => {
    if (!authToken) return;

    try {
      setLoadingProducts(true);

      const response = await fetch(`${API_BASE}/products`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("campuscartToken");
          localStorage.removeItem("campuscartUser");
          setToken("");
          setUser(null);
        }
        throw new Error("Could not load MongoDB products");
      }

      const data = await response.json();
      const mongoProducts = Array.isArray(data)
        ? data.map(toUIProduct)
        : [];

      // Keep all 18 demo products and add MongoDB products.
      setProducts([...mongoProducts, ...initialProducts]);
    } catch (error) {
      console.error(error);
      setProducts(initialProducts);
      showToast("Showing CampusCart demo products");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (token) loadProducts(token);
  }, [token]);

  /* =======================================================
     AUTH
  ======================================================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    try {
      setAuthLoading(true);

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("campuscartToken", data.token);
      localStorage.setItem("campuscartUser", JSON.stringify(data));

      setToken(data.token);
      setUser(data);
      setModal(null);
      showToast("Login successful 🎉");
    } catch (error) {
      showToast(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    try {
      setAuthLoading(true);

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          college: form.get("college"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      localStorage.setItem("campuscartToken", data.token);
      localStorage.setItem("campuscartUser", JSON.stringify(data));

      setToken(data.token);
      setUser(data);
      setModal(null);
      showToast("Account created 🎓");
    } catch (error) {
      showToast(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("campuscartToken");
    localStorage.removeItem("campuscartUser");
    setToken("");
    setUser(null);
    setCart([]);
    showToast("Logged out successfully");
  };

  /* =======================================================
     WISHLIST / CART
  ======================================================= */
  const toggleWishlist = (id) => {
    const alreadyLiked = wishlist.includes(id);

    setWishlist((current) =>
      alreadyLiked
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

    showToast(
      alreadyLiked
        ? "Removed from wishlist"
        : "Added to wishlist ❤️"
    );
  };

 const addToCart = (product) => {
  if (product.type !== "Buy") {
    showToast("Only Buy items can be added to cart");
    return;
  }

  if (!product.mongoProduct) {
    showToast("This is a demo item — list a real product to buy it");
    return;
  }

  if (!token) {
    setModal("login");
    showToast("Please login to add items to cart");
    return;
  
  }

  setCart((current) => {
    if (current.some((item) => item.id === product.id)) {
      showToast("Item already in cart 🛒");
      return current;
    }

    return [...current, product];
  });

  showToast("Added to your cart 🛒");
};

  /* =======================================================
     CHECKOUT -> POST /api/orders
  ======================================================= */
  const checkout = async () => {
    if (!token) {
      setModal("login");
      return;
    }

    if (cart.length === 0) return;

    try {
      for (const item of cart) {
        const response = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: item.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Order failed");
        }
      }

      setCart([]);
      setModal(null);
      showToast("Order placed successfully 🎉");
      await loadProducts(token);
    } catch (error) {
      console.error(error);
      showToast(error.message);
    }
  };

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */
  const filteredProducts = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;

      const matchesType =
        type === "All" || product.type === type;

      const matchesSearch =
        searchText === "" ||
        product.name.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText) ||
        product.seller.toLowerCase().includes(searchText);

      return matchesCategory && matchesType && matchesSearch;
    });
  }, [products, category, type, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, type]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  /* =======================================================
     NAVIGATION
  ======================================================= */
  const goToMarketplace = () => {
    document.getElementById("marketplace")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  /* =======================================================
     CREATE MONGODB LISTING
  ======================================================= */
  const submitListing = async (e) => {
    e.preventDefault();

    if (!token) {
      setModal("login");
      showToast("Please login before listing an item");
      return;
    }

    const form = new FormData(e.currentTarget);

    const uiType = form.get("type");
    const uiCategory = form.get("category");
    const uiCondition = form.get("condition");
    const uiLocation = form.get("location");

    try {
      const response = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.get("name"),
          description:
            form.get("description") ||
            `${form.get("name")} listed on CampusCart.`,
          category: categoryToBackend[uiCategory] || uiCategory,
          listingType: typeToBackend[uiType] || "sell",
          price:
            uiType === "Buy"
              ? Number(form.get("price")) || 0
              : 0,
          exchangeFor: form.get("exchangeFor") || "",
          condition:
            conditionToBackend[uiCondition] || uiCondition,
          images: [],
          urgent: false,
          meetupPoint:
            locationToBackend[uiLocation] || uiLocation,
          semesterTag: "Fall2026",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not publish listing");
      }

      const createdProduct = toUIProduct(data);

      setProducts((current) => [
        createdProduct,
        ...current.filter((p) => p.id !== createdProduct.id),
      ]);

      setCurrentPage(1);
      setModal(null);
      showToast("Your item is now listed in MongoDB 🎉");
    } catch (error) {
      console.error(error);
      showToast(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-white text-slate-900">
      {toast && (
        <div className="fixed right-5 top-5 z-[100] rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">
          {toast}
        </div>
      )}

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-xl shadow-lg shadow-violet-200">
              🎓
            </div>
            <div className="text-left">
              <div className="text-xl font-extrabold tracking-tight">
                CampusCart
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                THE STUDENT EXCHANGE
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            <button
              onClick={() =>
                window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="font-semibold text-violet-600"
            >
              Home
            </button>
            <button
              onClick={goToMarketplace}
              className="font-medium text-slate-600 hover:text-violet-600"
            >
              Marketplace
            </button>
            <button
              onClick={() =>
                document.getElementById("how")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
              className="font-medium text-slate-600 hover:text-violet-600"
            >
              How it works
            </button>
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={() =>
                showToast(`${wishlist.length} items saved ❤️`)
              }
              className="rounded-xl px-3 py-2 text-lg hover:bg-slate-100"
            >
              ♡
              {wishlist.length > 0 && (
                <span className="ml-1 text-xs font-bold text-violet-600">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setModal("cart")}
              className="rounded-xl px-3 py-2 text-lg hover:bg-slate-100"
            >
              🛒
              {cart.length > 0 && (
                <span className="ml-1 text-xs font-bold text-violet-600">
                  {cart.length}
                </span>
              )}
            </button>

            {user ? (
              <>
                <span className="px-3 text-sm font-bold text-slate-600">
                  Hi, {user.name}
                </span>
                <button
                  onClick={logout}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold hover:bg-slate-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setModal("login")}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold hover:bg-slate-50"
                >
                  Login
                </button>
                <button
                  onClick={() => setModal("register")}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
                >
                  Join Campus
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMenu(!menu)}
            className="rounded-xl border border-slate-200 px-3 py-2 md:hidden"
          >
            ☰
          </button>
        </div>

        {menu && (
          <div className="border-t border-slate-100 bg-white p-5 md:hidden">
            <div className="grid gap-3">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMenu(false);
                  }}
                  className="rounded-xl border p-3 font-semibold"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setModal("login");
                      setMenu(false);
                    }}
                    className="rounded-xl border p-3 font-semibold"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setModal("register");
                      setMenu(false);
                    }}
                    className="rounded-xl bg-violet-600 p-3 font-semibold text-white"
                  >
                    Join Campus
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  goToMarketplace();
                  setMenu(false);
                }}
                className="rounded-xl bg-slate-100 p-3 font-semibold"
              >
                Marketplace
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <main>
        <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
                🛡️ Verified student community
              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Don't buy new.
                <span className="block text-violet-600">
                  Find it on campus.
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
                Buy, sell, exchange or give away college essentials
                with students you can trust.
              </p>

              <div className="mt-9 flex max-w-2xl items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60">
                <span className="px-3 text-xl">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goToMarketplace();
                  }}
                  placeholder="Search books, calculators, hostel items..."
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 outline-none"
                />
                <button
                  onClick={goToMarketplace}
                  className="hidden rounded-xl bg-slate-950 px-5 py-3 font-bold text-white sm:block"
                >
                  Search
                </button>
              </div>

              {search.trim() && (
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  {filteredProducts.length} item
                  {filteredProducts.length !== 1 ? "s" : ""} found for "
                  {search}"
                </p>
              )}

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={goToMarketplace}
                  className="rounded-xl bg-violet-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
                >
                  Explore Marketplace →
                </button>
                <button
                  onClick={() => setModal("sell")}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-bold hover:bg-slate-50"
                >
                  + List an Item
                </button>
              </div>

              <div className="mt-10 flex flex-wrap gap-8">
                <div>
                  <b className="text-2xl">1,200+</b>
                  <p className="text-sm text-slate-500">Verified Students</p>
                </div>
                <div>
                  <b className="text-2xl">850+</b>
                  <p className="text-sm text-slate-500">Items Exchanged</p>
                </div>
                <div>
                  <b className="text-2xl">98%</b>
                  <p className="text-sm text-slate-500">Trust Rating</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-400">
                      LIVE ON CAMPUS
                    </p>
                    <h2 className="text-2xl font-black">Trending now</h2>
                  </div>
                  <div className="rounded-full bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                    ● 24 online
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {products.slice(0, 3).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    >
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-3xl">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          product.emoji
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{product.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {product.location} · {product.trust}% trust
                        </p>
                      </div>
                      <div className="text-right">
                        <b className="text-violet-600">
                          {product.type === "Buy"
                            ? `₹${product.price}`
                            : product.type}
                        </b>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-slate-950 p-5 text-white">
                  <p className="text-sm text-slate-400">CAMPUS TRUST SCORE</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-black">96.4%</span>
                    <span>🛡️ Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK TYPES */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-3 px-5 py-5 sm:grid-cols-4">
            {[
              ["🛍️", "Buy", "Find useful items"],
              ["🔄", "Exchange", "Trade with students"],
              ["🎁", "Free", "Give things away"],
              ["🔎", "Request", "Ask your campus"],
            ].map(([icon, title, text]) => (
              <button
                key={title}
                onClick={() => {
                  if (title === "Request") {
                    showToast("Request feature coming next 🚀");
                  } else {
                    setType(title);
                    goToMarketplace();
                  }
                }}
                className="flex items-center gap-4 rounded-2xl p-4 text-left hover:bg-slate-50"
              >
                <span className="text-3xl">{icon}</span>
                <span>
                  <b>{title}</b>
                  <small className="block text-slate-500">{text}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* MARKETPLACE */}
        <section id="marketplace" className="mx-auto max-w-7xl px-5 py-20">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="font-bold tracking-widest text-violet-600">
                CAMPUS MARKETPLACE
              </p>
              <h2 className="mt-2 text-4xl font-black">What do you need?</h2>
              <p className="mt-2 text-slate-500">
                Everything useful, already around your campus.
              </p>
              {loadingProducts && token && (
                <p className="mt-2 text-xs font-semibold text-violet-500">
                  Syncing MongoDB listings...
                </p>
              )}
            </div>

            <button
              onClick={() => setModal("sell")}
              className="w-fit rounded-xl bg-slate-950 px-5 py-3 font-bold text-white"
            >
              + Sell something
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {[
              "All",
              "Books",
              "Electronics",
              "Fashion",
              "Hostel",
              "Lab Items",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  category === item
                    ? "bg-violet-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold outline-none"
            >
              <option value="All">All types</option>
              <option value="Buy">Buy</option>
              <option value="Exchange">Exchange</option>
              <option value="Free">Free</option>
            </select>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500">
              Showing{" "}
              {filteredProducts.length === 0 ? 0 : startIndex + 1} -{" "}
              {Math.min(
                startIndex + PRODUCTS_PER_PAGE,
                filteredProducts.length
              )}{" "}
              of {filteredProducts.length} items
            </p>

            {(search || category !== "All" || type !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setType("All");
                }}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
              >
                Clear filters ✕
              </button>
            )}
          </div>

          {paginatedProducts.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative flex h-52 items-center justify-center overflow-hidden bg-slate-100 text-7xl">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      product.emoji
                    )}

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow ${
                        wishlist.includes(product.id)
                          ? "text-red-500"
                          : "text-slate-500"
                      }`}
                    >
                      {wishlist.includes(product.id) ? "♥" : "♡"}
                    </button>

                    <span
                      className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold ${
                        product.type === "Free"
                          ? "bg-green-100 text-green-700"
                          : product.type === "Exchange"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-white text-slate-700"
                      }`}
                    >
                      {product.type}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-violet-600">
                        {product.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {product.condition}
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-black">{product.name}</h3>

                    <div className="mt-3 flex items-center justify-between">
                      <b className="text-2xl text-violet-600">
                        {product.type === "Buy"
                          ? `₹${product.price}`
                          : product.type === "Free"
                          ? "FREE"
                          : "↔ Exchange"}
                      </b>
                      <span className="text-xs font-bold text-green-600">
                        🛡️ {product.trust}%
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t pt-4 text-xs text-slate-500">
                      <span>👤 {product.seller}</span>
                      <span>📍 {product.location}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="rounded-xl border border-slate-200 py-3 text-sm font-bold hover:bg-slate-50"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => {
                          if (product.type === "Buy") {
                            addToCart(product);
                          } else {
                            showToast(
                              product.type === "Exchange"
                                ? "Exchange request coming next 🔄"
                                : "Pickup request coming next 🎁"
                            );
                          }
                        }}
                        className="rounded-xl bg-slate-950 py-3 text-sm font-bold text-white hover:bg-violet-600"
                      >
                        {product.type === "Exchange"
                          ? "Exchange"
                          : product.type === "Free"
                          ? "Request"
                          : "Add to cart"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl bg-white p-16 text-center shadow-sm">
              <div className="text-5xl">🔍</div>
              <h3 className="mt-4 text-xl font-black">No items found</h3>
              <p className="mt-2 text-slate-500">
                Try another search or category.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setType("All");
                }}
                className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-bold text-white"
              >
                Show all items
              </button>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <div className="flex gap-2">
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-11 w-11 rounded-xl font-bold transition ${
                      currentPage === page
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </section>

        {/* TRUST */}
        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-5 py-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="font-bold tracking-widest text-violet-400">
                  BUILT FOR TRUST
                </p>
                <h2 className="mt-3 text-4xl font-black sm:text-5xl">
                  Your campus should feel like a community.
                </h2>
                <p className="mt-5 max-w-xl leading-8 text-slate-400">
                  CampusCart is designed around verified students,
                  transparent listings and safe campus pickup points.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["🛡️", "Verified students", "College-based accounts"],
                  ["⭐", "Trust score", "Build reputation"],
                  ["📍", "Campus pickup", "No shipping hassle"],
                  ["♻️", "Second life", "Reduce waste"],
                ].map(([icon, title, text]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                  >
                    <div className="text-3xl">{icon}</div>
                    <h3 className="mt-4 font-black">{title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="mx-auto max-w-7xl px-5 py-20">
          <div className="text-center">
            <p className="font-bold tracking-widest text-violet-600">
              SIMPLE PROCESS
            </p>
            <h2 className="mt-2 text-4xl font-black">
              From unused to useful.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["01", "List", "Post your unused books, electronics, fashion or hostel items."],
              ["02", "Connect", "Find another verified student who needs what you have."],
              ["03", "Exchange", "Meet at a safe campus pickup point and complete the exchange."],
            ].map(([number, title, text]) => (
              <div
                key={number}
                className="rounded-3xl border border-slate-200 bg-white p-8"
              >
                <span className="text-5xl font-black text-violet-100">
                  {number}
                </span>
                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 py-8 sm:flex-row">
          <div>
            <b className="text-lg">🎓 CampusCart</b>
            <p className="mt-1 text-sm text-slate-500">
              Your campus. Your marketplace.
            </p>
          </div>
          <p className="text-sm text-slate-400">
            © 2026 CampusCart · CodeAlpha Internship
          </p>
        </div>
      </footer>

      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-5">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-full bg-slate-100 px-3 py-2"
              >
                ✕
              </button>
            </div>

            <div className="flex h-40 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-7xl">
              {selectedProduct.image ? (
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                selectedProduct.emoji
              )}
            </div>

            <div className="mt-5">
              <span className="text-sm font-bold text-violet-600">
                {selectedProduct.type} · {selectedProduct.category}
              </span>

              <h2 className="mt-2 text-2xl font-black">
                {selectedProduct.name}
              </h2>

              <p className="mt-3 text-slate-500">
                Listed by <b>{selectedProduct.seller}</b> ·{" "}
                {selectedProduct.condition}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">TRUST SCORE</p>
                  <b className="text-xl text-green-600">
                    {selectedProduct.trust}%
                  </b>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">PICKUP</p>
                  <b className="text-sm">
                    📍 {selectedProduct.location}
                  </b>
                </div>
              </div>

              <button
                onClick={() => {
                  if (selectedProduct.type === "Buy") {
                    addToCart(selectedProduct);
                  } else {
                    showToast("Request sent successfully 🚀");
                  }
                  setSelectedProduct(null);
                }}
                className="mt-5 w-full rounded-xl bg-violet-600 py-3.5 font-bold text-white"
              >
                {selectedProduct.type === "Buy"
                  ? `Add to cart · ₹${selectedProduct.price}`
                  : `Request ${selectedProduct.type}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN / REGISTER */}
      {(modal === "login" || modal === "register") && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-5">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl">🎓</div>
                <h2 className="mt-3 text-2xl font-black">
                  {modal === "login"
                    ? "Welcome back"
                    : "Join your campus"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modal === "login"
                    ? "Login to continue to CampusCart."
                    : "Create your verified student account."}
                </p>
              </div>

              <button
                onClick={() => setModal(null)}
                className="rounded-full bg-slate-100 px-3 py-2"
              >
                ✕
              </button>
            </div>

            <form
              className="mt-7 space-y-4"
              onSubmit={
                modal === "login" ? handleLogin : handleRegister
              }
            >
              {modal === "register" && (
                <>
                  <input
                    required
                    name="name"
                    placeholder="Full name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
                  />

                  <input
                    required
                    name="college"
                    placeholder="College name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
                  />
                </>
              )}

              <input
                required
                name="email"
                type="email"
                placeholder="College email"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
              />

              <input
                required
                name="password"
                type="password"
                placeholder="Password"
                minLength="6"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
              />

              <button
                disabled={authLoading}
                className="w-full rounded-xl bg-violet-600 py-3.5 font-bold text-white disabled:opacity-60"
              >
                {authLoading
                  ? "Please wait..."
                  : modal === "login"
                  ? "Login"
                  : "Create Account"}
              </button>
            </form>

            <p className="mt-5 rounded-xl bg-violet-50 p-3 text-center text-xs text-violet-700">
              🛡️ College verification keeps CampusCart safe.
            </p>
          </div>
        </div>
      )}

      {/* CART */}
      {modal === "cart" && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-5">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Your Cart 🛒</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review your selected campus items.
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="rounded-full bg-slate-100 px-3 py-2"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="py-10 text-center">
                <div className="text-5xl">🛒</div>
                <h3 className="mt-4 text-lg font-bold">
                  Your cart is empty
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add MongoDB products from the marketplace to continue.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6 max-h-72 space-y-3 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-2xl">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            item.emoji
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="text-xs text-slate-500">
                            {item.category} · {item.condition}
                          </p>
                        </div>
                      </div>
                      <div className="font-black text-violet-600">
                        ₹{item.price}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-5">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-black text-violet-600">
                    ₹
                    {cart.reduce(
                      (total, item) =>
                        total + Number(item.price || 0),
                      0
                    )}
                  </span>
                </div>

                <button
                  onClick={checkout}
                  className="mt-5 w-full rounded-xl bg-violet-600 py-3.5 font-bold text-white hover:bg-violet-700"
                >
                  Proceed to Checkout 🚀
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* SELL */}
      {modal === "sell" && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-5">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">List an item</h2>
                <p className="text-sm text-slate-500">
                  Give your unused item a second life.
                </p>
              </div>
              <button
                onClick={() => setModal(null)}
                className="rounded-full bg-slate-100 px-3 py-2"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={submitListing}
              className="mt-6 space-y-3"
            >
              <input
                required
                name="name"
                placeholder="Item name"
                className="w-full rounded-xl border p-3 outline-none focus:border-violet-500"
              />

              <textarea
                name="description"
                placeholder="Description"
                className="min-h-24 w-full rounded-xl border p-3 outline-none focus:border-violet-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  name="type"
                  className="rounded-xl border p-3 outline-none"
                >
                  <option>Buy</option>
                  <option>Exchange</option>
                  <option>Free</option>
                </select>

                <select
                  name="category"
                  className="rounded-xl border p-3 outline-none"
                >
                  <option>Books</option>
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Hostel</option>
                  <option>Lab Items</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  name="price"
                  type="number"
                  min="0"
                  placeholder="Price ₹"
                  className="rounded-xl border p-3 outline-none"
                />

                <select
                  name="condition"
                  className="rounded-xl border p-3 outline-none"
                >
                  <option>Like New</option>
                  <option>Good</option>
                  <option>Used</option>
                  <option>Heavily Used</option>
                </select>
              </div>

              <input
                name="exchangeFor"
                placeholder="Exchange for (optional)"
                className="w-full rounded-xl border p-3 outline-none focus:border-violet-500"
              />

              <select
                name="location"
                className="w-full rounded-xl border p-3 outline-none"
              >
                <option>Library</option>
                <option>Main Gate</option>
                <option>Canteen</option>
                <option>Hostel Block A</option>
                <option>Hostel Block B</option>
                <option>Academic Block</option>
                <option>Sports Complex</option>
                <option>Other</option>
              </select>

              <button className="w-full rounded-xl bg-violet-600 py-3.5 font-bold text-white">
                Publish Listing 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
