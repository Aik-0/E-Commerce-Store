
"use strict";

/* ==========================================
   FINORA STORE
   Front-end demo store — no real payments.
   ========================================== */

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 350,
    category: "Technology",
    rating: 4.8,
    reviews: 124,
    description: "Enjoy your favorite music with comfortable wireless headphones, clear sound, and a modern everyday design.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 650,
    category: "Technology",
    rating: 4.7,
    reviews: 98,
    description: "A stylish smartwatch for your daily routine, with useful activity features and a clean, modern look.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 3,
    name: "Cotton T-Shirt",
    price: 120,
    category: "Fashion",
    rating: 4.5,
    reviews: 76,
    description: "A versatile cotton T-shirt with a comfortable feel. An easy choice for casual outfits and everyday wear.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 4,
    name: "Waterproof Backpack",
    price: 280,
    category: "Accessories",
    rating: 4.6,
    reviews: 83,
    description: "Carry your essentials in a practical backpack with a modern design, generous storage, and a water-resistant finish.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 5,
    name: "Classic Sunglasses",
    price: 190,
    category: "Accessories",
    rating: 4.4,
    reviews: 51,
    description: "Complete your look with classic sunglasses that pair easily with casual and smart-casual outfits.",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=85"
  },
  {
    id: 6,
    name: "Running Shoes",
    price: 420,
    category: "Sports",
    rating: 4.9,
    reviews: 147,
    description: "Lightweight everyday running shoes designed for comfort while walking, training, or staying active.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85"
  }
];

const STORAGE_KEYS = {
  cart: "ecommerce_cart",
  favorites: "finora_favorites",
  theme: "store_theme"
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  searchForm: $("#search-form"),
  searchInput: $("#search-input"),
  categoryFilter: $("#category-filter"),
  priceFilter: $("#price-filter"),
  priceValue: $("#price-val"),
  sortSelect: $("#sort-select"),
  favoritesOnly: $("#favorites-only"),
  clearFilters: $("#clear-filters"),
  emptyReset: $("#empty-reset"),
  activeFilters: $("#active-filters"),
  productsGrid: $("#products-grid"),
  resultsCount: $("#results-count"),
  catalogTitle: $("#catalog-title"),
  emptyState: $("#empty-state"),
  cartToggle: $("#cart-toggle"),
  cartCount: $("#cart-count"),
  favoritesToggle: $("#favorites-toggle"),
  favoritesCount: $("#favorites-count"),
  themeToggle: $("#theme-toggle"),
  cartOverlay: $("#cart-overlay"),
  cartDrawer: $("#cart-drawer"),
  cartClose: $("#cart-close"),
  cartItems: $("#cart-items"),
  cartEmpty: $("#cart-empty"),
  cartFooter: $("#cart-footer"),
  drawerCartCount: $("#drawer-cart-count"),
  cartSubtotal: $("#cart-subtotal"),
  checkoutButton: $("#checkout-button"),
  continueShopping: $("#continue-shopping"),
  keepShopping: $("#keep-shopping"),
  productBackdrop: $("#product-modal-backdrop"),
  productModalClose: $("#product-modal-close"),
  productDetailContent: $("#product-detail-content"),
  checkoutBackdrop: $("#checkout-modal-backdrop"),
  checkoutClose: $("#checkout-close"),
  checkoutForm: $("#checkout-form"),
  checkoutItemsCount: $("#checkout-items-count"),
  checkoutSubtotal: $("#checkout-subtotal"),
  checkoutTotal: $("#checkout-total"),
  checkoutContent: $("#checkout-content"),
  orderSuccess: $("#order-success"),
  successName: $("#success-name"),
  orderReference: $("#order-reference"),
  finishOrder: $("#finish-order"),
  currentYear: $("#current-year"),
  toastContainer: $("#toast-container")
};

let cart = readStorage(STORAGE_KEYS.cart, []);
let favorites = readStorage(STORAGE_KEYS.favorites, []);
let currentTheme = readStorage(STORAGE_KEYS.theme, "light");
let showFavoritesOnly = false;
let currentProductId = null;

/* ---------- Safe local storage ---------- */

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored);
  } catch (error) {
    console.warn(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not save ${key} to local storage.`, error);
    showToast("Your browser could not save this change.", "error");
  }
}

function normalizeCart() {
  if (!Array.isArray(cart)) cart = [];

  cart = cart
    .filter(item =>
      item &&
      DEFAULT_PRODUCTS.some(product => product.id === Number(item.id))
    )
    .map(item => ({
      id: Number(item.id),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1))
    }));
}

function normalizeFavorites() {
  if (!Array.isArray(favorites)) favorites = [];

  favorites = [...new Set(
    favorites
      .map(Number)
      .filter(id => DEFAULT_PRODUCTS.some(product => product.id === id))
  )];
}

normalizeCart();
normalizeFavorites();

/* ---------- Product helpers ---------- */

function getProduct(id) {
  return DEFAULT_PRODUCTS.find(product => product.id === Number(id));
}

function money(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2
  }).format(amount);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

function totalCartQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function totalCartPrice() {
  return cart.reduce((total, item) => {
    const product = getProduct(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

/* ---------- Product listing and filters ---------- */

function getFilteredProducts() {
  const searchTerm = elements.searchInput.value.trim().toLowerCase();
  const category = elements.categoryFilter.value;
  const maximumPrice = Number(elements.priceFilter.value);
  const sortBy = elements.sortSelect.value;

  let products = DEFAULT_PRODUCTS.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);

    const matchesCategory =
      category === "all" || product.category === category;

    const matchesPrice = product.price <= maximumPrice;

    const matchesFavorite =
      !showFavoritesOnly || favorites.includes(product.id);

    return matchesSearch &&
      matchesCategory &&
      matchesPrice &&
      matchesFavorite;
  });

  switch (sortBy) {
    case "price-low":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      products.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      products.sort((a, b) => b.rating - a.rating);
      break;
    case "name":
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      // Keep the original featured order.
      break;
  }

  return products;
}

function renderProducts() {
  const products = getFilteredProducts();

  elements.resultsCount.textContent =
    `${products.length} ${products.length === 1 ? "product" : "products"}`;

  elements.catalogTitle.textContent = showFavoritesOnly
    ? "Your favorite products"
    : "Explore our products";

  elements.emptyState.classList.toggle("hidden", products.length !== 0);
  elements.productsGrid.classList.toggle("hidden", products.length === 0);

  elements.productsGrid.innerHTML = products.map(product => {
    const isFavorite = favorites.includes(product.id);

    return `
      <article class="product-card">
        <div class="product-image-wrap">
          <img
            class="product-image"
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
            data-fallback="${product.id}"
          >
          <span class="product-category">${escapeHTML(product.category)}</span>
          <button
            class="favorite-button ${isFavorite ? "is-favorite" : ""}"
            type="button"
            data-action="favorite"
            data-id="${product.id}"
            aria-label="${isFavorite ? "Remove from" : "Add to"} favorites"
            aria-pressed="${isFavorite}"
            title="${isFavorite ? "Remove from favorites" : "Add to favorites"}"
          >${isFavorite ? "♥" : "♡"}</button>
        </div>
        <div class="product-info">
          <div class="product-rating">
            <span class="star">★</span>
            <strong>${product.rating.toFixed(1)}</strong>
            <span>(${product.reviews} reviews)</span>
          </div>
          <h3 class="product-name" title="${escapeHTML(product.name)}">${escapeHTML(product.name)}</h3>
          <p class="product-description">${escapeHTML(product.description)}</p>
          <div class="product-bottom">
            <div class="product-price">
              ${money(product.price)}
              <small>Inclusive demo price</small>
            </div>
            <button class="add-button" type="button" data-action="add" data-id="${product.id}">
              <span>＋</span> Add
            </button>
          </div>
          <button class="details-link" type="button" data-action="details" data-id="${product.id}">
            View product details →
          </button>
        </div>
      </article>
    `;
  }).join("");

  renderActiveFilters();
}

function renderActiveFilters() {
  const chips = [];
  const searchTerm = elements.searchInput.value.trim();
  const category = elements.categoryFilter.value;
  const maximumPrice = Number(elements.priceFilter.value);

  if (searchTerm) {
    chips.push({ key: "search", label: `Search: ${searchTerm}` });
  }

  if (category !== "all") {
    chips.push({ key: "category", label: category });
  }

  if (maximumPrice < 5000) {
    chips.push({ key: "price", label: `Up to ${money(maximumPrice)}` });
  }

  if (showFavoritesOnly) {
    chips.push({ key: "favorites", label: "Favorites only" });
  }

  elements.activeFilters.innerHTML = chips.map(chip => `
    <span class="filter-chip">
      ${escapeHTML(chip.label)}
      <button type="button" data-clear-filter="${chip.key}" aria-label="Remove ${escapeHTML(chip.label)}">×</button>
    </span>
  `).join("");
}

function clearAllFilters() {
  elements.searchInput.value = "";
  elements.categoryFilter.value = "all";
  elements.priceFilter.value = "5000";
  elements.priceValue.textContent = money(5000);
  elements.sortSelect.value = "featured";
  elements.favoritesOnly.checked = false;
  showFavoritesOnly = false;
  renderProducts();
}

function clearOneFilter(key) {
  switch (key) {
    case "search":
      elements.searchInput.value = "";
      break;
    case "category":
      elements.categoryFilter.value = "all";
      break;
    case "price":
      elements.priceFilter.value = "5000";
      elements.priceValue.textContent = money(5000);
      break;
    case "favorites":
      showFavoritesOnly = false;
      elements.favoritesOnly.checked = false;
      break;
  }

  renderProducts();
}

/* ---------- Favorites ---------- */

function toggleFavorite(id) {
  const product = getProduct(id);
  if (!product) return;

  if (favorites.includes(product.id)) {
    favorites = favorites.filter(favoriteId => favoriteId !== product.id);
    showToast("Removed from your favorites.");
  } else {
    favorites.push(product.id);
    showToast("Added to your favorites.");
  }

  saveStorage(STORAGE_KEYS.favorites, favorites);
  updateHeaderCounts();
  renderProducts();

  if (currentProductId === product.id && !elements.productBackdrop.classList.contains("hidden")) {
    renderProductDetails(product.id);
  }
}

function showFavorites() {
  showFavoritesOnly = true;
  elements.favoritesOnly.checked = true;
  renderProducts();
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
}

/* ---------- Shopping cart ---------- */

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;

  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: product.id, quantity: 1 });
  }

  saveStorage(STORAGE_KEYS.cart, cart);
  renderCart();
  showToast(`${product.name} added to your cart.`);
}

function updateQuantity(id, change) {
  const item = cart.find(cartItem => cartItem.id === Number(id));
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(cartItem => cartItem.id !== Number(id));
  }

  saveStorage(STORAGE_KEYS.cart, cart);
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== Number(id));
  saveStorage(STORAGE_KEYS.cart, cart);
  renderCart();
  showToast("Item removed from your cart.");
}

function renderCart() {
  cart = cart.filter(item => getProduct(item.id));

  const quantity = totalCartQuantity();
  const subtotal = totalCartPrice();

  elements.cartCount.textContent = quantity;
  elements.drawerCartCount.textContent = `(${quantity})`;
  elements.cartSubtotal.textContent = money(subtotal);

  const isEmpty = cart.length === 0;
  elements.cartEmpty.classList.toggle("hidden", !isEmpty);
  elements.cartFooter.classList.toggle("hidden", isEmpty);
  elements.cartItems.classList.toggle("hidden", isEmpty);

  if (isEmpty) {
    elements.cartItems.innerHTML = "";
  } else {
    elements.cartItems.innerHTML = cart.map(item => {
      const product = getProduct(item.id);
      if (!product) return "";

      return `
        <article class="cart-item">
          <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy">
          <div>
            <h3 class="cart-item-name">${escapeHTML(product.name)}</h3>
            <div class="cart-item-price">${money(product.price * item.quantity)}</div>
            <div class="cart-item-controls">
              <div class="quantity-control" aria-label="Quantity controls">
                <button type="button" data-cart-action="decrease" data-id="${product.id}" aria-label="Decrease quantity">−</button>
                <span>${item.quantity}</span>
                <button type="button" data-cart-action="increase" data-id="${product.id}" aria-label="Increase quantity">+</button>
              </div>
              <button class="remove-item" type="button" data-cart-action="remove" data-id="${product.id}">Remove</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  updateHeaderCounts();
}

function updateHeaderCounts() {
  elements.cartCount.textContent = totalCartQuantity();
  elements.drawerCartCount.textContent = `(${totalCartQuantity()})`;
  elements.favoritesCount.textContent = favorites.length;
}

function openCart() {
  elements.cartOverlay.classList.remove("hidden");
  elements.cartDrawer.classList.add("open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  elements.cartClose.focus();
}

function closeCart() {
  elements.cartOverlay.classList.add("hidden");
  elements.cartDrawer.classList.remove("open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");

  if (elements.productBackdrop.classList.contains("hidden") &&
      elements.checkoutBackdrop.classList.contains("hidden")) {
    document.body.style.overflow = "";
  }
}

/* ---------- Product details ---------- */

function openProductDetails(id) {
  const product = getProduct(id);
  if (!product) return;

  currentProductId = product.id;
  renderProductDetails(product.id);
  elements.productBackdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  elements.productModalClose.focus();
}

function renderProductDetails(id) {
  const product = getProduct(id);
  if (!product) return;

  const isFavorite = favorites.includes(product.id);

  elements.productDetailContent.innerHTML = `
    <div class="product-detail-grid">
      <img class="detail-image" src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">
      <div class="detail-info">
        <span class="eyebrow">${escapeHTML(product.category)}</span>
        <h2 id="detail-name">${escapeHTML(product.name)}</h2>
        <div class="product-rating">
          <span class="star">★</span>
          <strong>${product.rating.toFixed(1)}</strong>
          <span>${product.reviews} customer reviews</span>
        </div>
        <p class="detail-description">${escapeHTML(product.description)}</p>
        <div class="detail-meta">
          <span>✓ Selected product</span>
          <span>✓ Easy to shop</span>
        </div>
        <div class="detail-price">${money(product.price)}</div>
        <div class="detail-actions">
          <button class="primary-button" type="button" data-detail-action="add" data-id="${product.id}">
            Add to Cart →
          </button>
          <button class="secondary-button" type="button" data-detail-action="favorite" data-id="${product.id}">
            ${isFavorite ? "♥ Saved" : "♡ Add to Favorites"}
          </button>
        </div>
      </div>
    </div>
  `;
}

function closeProductDetails() {
  elements.productBackdrop.classList.add("hidden");
  currentProductId = null;

  if (elements.cartDrawer.classList.contains("open")) return;
  if (!elements.checkoutBackdrop.classList.contains("hidden")) return;

  document.body.style.overflow = "";
}

/* ---------- Checkout demo ---------- */

function openCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty. Add a product first.", "error");
    return;
  }

  closeCart();
  elements.checkoutContent.classList.remove("hidden");
  elements.orderSuccess.classList.add("hidden");

  elements.checkoutItemsCount.textContent = totalCartQuantity();
  elements.checkoutSubtotal.textContent = money(totalCartPrice());
  elements.checkoutTotal.textContent = money(totalCartPrice());

  elements.checkoutBackdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  elements.checkoutClose.focus();
}

function closeCheckout() {
  elements.checkoutBackdrop.classList.add("hidden");
  document.body.style.overflow = "";
}

function handleCheckout(event) {
  event.preventDefault();

  if (cart.length === 0) {
    showToast("Your cart is empty. Add a product first.", "error");
    closeCheckout();
    return;
  }

  if (!elements.checkoutForm.reportValidity()) return;

  const formData = new FormData(elements.checkoutForm);
  const customerName = String(formData.get("name") || "").trim();

  if (!customerName) {
    showToast("Please enter your full name.", "error");
    return;
  }

  // This is only a local demo. It does not contact a server,
  // process a payment, or create a real order.
  const reference = "FIN-" + Date.now().toString().slice(-8);

  elements.successName.textContent = customerName.split(/\s+/)[0];
  elements.orderReference.textContent = reference;
  elements.checkoutContent.classList.add("hidden");
  elements.orderSuccess.classList.remove("hidden");

  cart = [];
  saveStorage(STORAGE_KEYS.cart, cart);
  renderCart();
  elements.checkoutForm.reset();
}

/* ---------- Theme ---------- */

function applyTheme(theme) {
  currentTheme = theme === "dark" ? "dark" : "light";
  document.body.classList.toggle("dark", currentTheme === "dark");
  elements.themeToggle.textContent = currentTheme === "dark" ? "☀" : "☾";
  elements.themeToggle.setAttribute(
    "aria-label",
    currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
  elements.themeToggle.title =
    currentTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  saveStorage(STORAGE_KEYS.theme, currentTheme);
}

function toggleTheme() {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
}

/* ---------- Toast notifications ---------- */

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast${type === "error" ? " error" : ""}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3000);
}

/* ---------- Event listeners ---------- */

elements.searchForm.addEventListener("submit", event => {
  event.preventDefault();
  renderProducts();
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
});

elements.searchInput.addEventListener("input", renderProducts);
elements.categoryFilter.addEventListener("change", renderProducts);
elements.sortSelect.addEventListener("change", renderProducts);

elements.priceFilter.addEventListener("input", () => {
  elements.priceValue.textContent = money(Number(elements.priceFilter.value));
  renderProducts();
});

elements.favoritesOnly.addEventListener("change", () => {
  showFavoritesOnly = elements.favoritesOnly.checked;
  renderProducts();
});

elements.clearFilters.addEventListener("click", clearAllFilters);
elements.emptyReset.addEventListener("click", clearAllFilters);

elements.activeFilters.addEventListener("click", event => {
  const button = event.target.closest("[data-clear-filter]");
  if (!button) return;
  clearOneFilter(button.dataset.clearFilter);
});

elements.productsGrid.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);

  switch (button.dataset.action) {
    case "add":
      addToCart(id);
      break;
    case "favorite":
      toggleFavorite(id);
      break;
    case "details":
      openProductDetails(id);
      break;
  }
});

elements.productsGrid.addEventListener("error", event => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement) || !image.dataset.fallback) return;

  image.dataset.fallback = "";
  image.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85";
}, true);

elements.favoritesToggle.addEventListener("click", showFavorites);
elements.themeToggle.addEventListener("click", toggleTheme);

elements.cartToggle.addEventListener("click", openCart);
elements.cartClose.addEventListener("click", closeCart);
elements.cartOverlay.addEventListener("click", closeCart);
elements.continueShopping.addEventListener("click", closeCart);
elements.keepShopping.addEventListener("click", closeCart);

elements.cartItems.addEventListener("click", event => {
  const button = event.target.closest("button[data-cart-action]");
  if (!button) return;

  const id = Number(button.dataset.id);

  switch (button.dataset.cartAction) {
    case "increase":
      updateQuantity(id, 1);
      break;
    case "decrease":
      updateQuantity(id, -1);
      break;
    case "remove":
      removeFromCart(id);
      break;
  }
});

elements.checkoutButton.addEventListener("click", openCheckout);

elements.productModalClose.addEventListener("click", closeProductDetails);
elements.productBackdrop.addEventListener("click", event => {
  if (event.target === elements.productBackdrop) closeProductDetails();
});

elements.productDetailContent.addEventListener("click", event => {
  const button = event.target.closest("button[data-detail-action]");
  if (!button) return;

  const id = Number(button.dataset.id);

  if (button.dataset.detailAction === "add") {
    addToCart(id);
    closeProductDetails();
    openCart();
  }

  if (button.dataset.detailAction === "favorite") {
    toggleFavorite(id);
  }
});

elements.checkoutClose.addEventListener("click", closeCheckout);
elements.checkoutBackdrop.addEventListener("click", event => {
  if (event.target === elements.checkoutBackdrop) closeCheckout();
});
elements.checkoutForm.addEventListener("submit", handleCheckout);

elements.finishOrder.addEventListener("click", () => {
  closeCheckout();
  elements.checkoutContent.classList.remove("hidden");
  elements.orderSuccess.classList.add("hidden");
  renderProducts();
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;

  if (!elements.checkoutBackdrop.classList.contains("hidden")) {
    closeCheckout();
  } else if (!elements.productBackdrop.classList.contains("hidden")) {
    closeProductDetails();
  } else if (elements.cartDrawer.classList.contains("open")) {
    closeCart();
  }
});

/* ---------- Start the store ---------- */

function initializeStore() {
  // Show the entire catalog on first load.
  elements.priceFilter.value = "5000";
  elements.priceValue.textContent = money(5000);
  elements.currentYear.textContent = new Date().getFullYear();

  applyTheme(currentTheme);
  renderProducts();
  renderCart();
  updateHeaderCounts();
}

initializeStore();
