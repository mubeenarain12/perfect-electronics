// ===== SHOP SETTINGS =====
const SHOP = {
  name: "Perfect Electronics & Solar System",
  whatsapp: "+92318-3845440", // your real number: with country code, no + sign and no spaces
  currency: "Rs",
};

// ===== PRODUCTS =====
// The names and prices below are SAMPLES only. Replace them with your real products.
// image: path to the photo, e.g. "images/panel-550w.jpg". Leave empty to show the icon.
// stock: if 0, the product shows "Out of stock".
const PRODUCTS = [
  { id: 1, name: "Solar Panel 550W", category: "Solar", price: 30000, stock: 10, icon: "☀️", image: "" },
  { id: 2, name: "Solar Inverter 3kW", category: "Solar", price: 90000, stock: 4, icon: "🔌", image: "" },
  { id: 3, name: "Lithium Battery 12V 100Ah", category: "Solar", price: 85000, stock: 6, icon: "🔋", image: "" },
  { id: 4, name: "Charge Controller 60A", category: "Solar", price: 9000, stock: 8, icon: "🎛️", image: "" },
  { id: 5, name: "LED TV 43 inch", category: "Electronics", price: 60000, stock: 3, icon: "📺", image: "" },
  { id: 6, name: "Ceiling Fan 56 inch", category: "Electronics", price: 12000, stock: 15, icon: "🌀", image: "" },
  { id: 7, name: "UPS 1000VA", category: "Electronics", price: 22000, stock: 0, icon: "⚡", image: "" },
  { id: 8, name: "LED Bulb 12W", category: "Lighting", price: 350, stock: 100, icon: "💡", image: "" },
  { id: 9, name: "Extension Board 4 Socket", category: "Accessories", price: 1200, stock: 30, icon: "🔗", image: "" },
];

// This is the only place where products are loaded.
// To move to a Google Sheet or database later, only this function needs to change.
async function loadProducts() {
  return PRODUCTS;
}
