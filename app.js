const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => `${SHOP.currency} ${Number(n).toLocaleString("en-US")}`;

// Brands shown in the moving strip. SAMPLE LIST: keep only the brands the shop really sells.
const BRANDS = ["Jinko Solar", "LONGi", "Trina Solar", "Canadian Solar", "JA Solar", "Huawei", "Sungrow", "Growatt", "Solis", "GoodWe", "Fronius", "Inverex", "Narada", "Shoto"];

let products = [], cat = "All", query = "", cart = readCart(), observer = null, lastCount = 0;

function readCart() { try { return JSON.parse(localStorage.getItem("pe_cart")) || {}; } catch (e) { return {}; } }
function saveCart() { try { localStorage.setItem("pe_cart", JSON.stringify(cart)); } catch (e) {} }
const byId = (id) => products.find((p) => p.id === id);

function renderChips() {
  const cats = ["All", ...new Set(products.map((p) => p.category))];
  $("#chips").innerHTML = cats.map((c) => `<button class="chip ${c === cat ? "on" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
}

function actionHtml(p) {
  const q = cart[p.id] || 0;
  if (p.stock <= 0) return `<button class="add" disabled>Out of stock</button>`;
  if (q > 0) return `<div class="step"><button data-dec="${p.id}" aria-label="Decrease">&minus;</button><span>${q} in cart</span><button data-inc="${p.id}" aria-label="Increase" ${q >= p.stock ? "disabled" : ""}>+</button></div>`;
  return `<button class="add" data-add="${p.id}"><svg class="ic"><use href="#i-cart"/></svg>Add to cart</button>`;
}

function renderGrid(animate) {
  const list = products.filter((p) => (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(query));
  $("#grid").innerHTML = list.length ? list.map((p) => {
    const pic = p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : esc(p.icon || "📦");
    return `<div class="card${animate ? " reveal" : ""}"><div class="pic">${pic}<em>${esc(p.category)}</em></div><div class="info"><div class="name">${esc(p.name)}</div><div class="price">${fmt(p.price)}</div>${actionHtml(p)}</div></div>`;
  }).join("") : `<p class="empty">No products found.</p>`;
  if (!animate) return;
  if (observer) observer.disconnect();
  const cards = document.querySelectorAll(".card.reveal");
  if (!("IntersectionObserver" in window)) { cards.forEach((c) => c.classList.add("pop")); return; }
  observer = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("pop"); observer.unobserve(en.target); }
  }), { threshold: 0.1 });
  cards.forEach((c, i) => { c.style.setProperty("--d", `${(i % 4) * 70}ms`); observer.observe(c); });
}

function cartItems() {
  return Object.keys(cart).map((id) => ({ p: byId(Number(id)), q: cart[id] })).filter((x) => x.p);
}

function changeQty(id, d) {
  const p = byId(id); if (!p) return;
  const q = Math.max(0, Math.min(p.stock, (cart[id] || 0) + d));
  if (q === 0) delete cart[id]; else cart[id] = q;
  saveCart(); renderCart(); renderGrid(false);
}

function renderCart() {
  const items = cartItems();
  const count = items.reduce((s, x) => s + x.q, 0);
  const total = items.reduce((s, x) => s + x.q * x.p.price, 0);
  $("#count").textContent = count;
  if (count > lastCount) { const b = $("#cartbtn"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
  lastCount = count;
  $("#items").innerHTML = items.length ? items.map(({ p, q }) => `<div class="line"><div><div class="name">${esc(p.name)}</div><div class="cat">${fmt(p.price)} x ${q}</div></div><div class="qty"><button data-dec="${p.id}" aria-label="Decrease">-</button><span>${q}</span><button data-inc="${p.id}" aria-label="Increase">+</button></div></div>`).join("") : `<p class="empty">Your cart is empty. Pick an item and tap Add to cart.</p>`;
  $("#total").textContent = fmt(total);
  $("#checkout").hidden = items.length === 0;
}

function openCart(open) {
  $("#drawer").classList.toggle("open", open);
  $("#overlay").classList.toggle("open", open);
}

function sendOrder(e) {
  e.preventDefault();
  const items = cartItems();
  if (!items.length) return;
  const total = items.reduce((s, x) => s + x.q * x.p.price, 0);
  const lines = items.map(({ p, q }, i) => `${i + 1}) ${p.name} x ${q} = ${fmt(p.price * q)}`);
  const msg = [
    `*New Order - ${SHOP.name}*`, "", ...lines, "", `*Total: ${fmt(total)}*`, "",
    `Name: ${$("#cname").value.trim()}`,
    `Phone: ${$("#cphone").value.trim()}`,
    `Address: ${$("#caddr").value.trim()}`,
    `Payment: Cash on Delivery`,
  ].join("\n");
  window.open(`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
}

function drawPanels() {
  const g = $("#panels"); if (!g) return;
  let y = 478, out = "";
  for (let r = 0; r < 5; r++) {
    const h = 14 + r * 12, w = 64 + r * 30;
    for (let x = -300; x < 1700; x += w + 6) {
      out += `<rect x="${(x + y * 0.325).toFixed(1)}" y="${y}" width="${w}" height="${h}" rx="2" transform="skewX(-18)"/>`;
    }
    y += h + 5;
  }
  g.innerHTML = out;
}

function onCardClick(e) {
  const add = e.target.closest("[data-add]"), inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
  if (add) changeQty(Number(add.dataset.add), 1);
  if (inc) changeQty(Number(inc.dataset.inc), 1);
  if (dec) changeQty(Number(dec.dataset.dec), -1);
}

async function init() {
  products = await loadProducts();
  document.title = SHOP.name;
  $("#brand").textContent = SHOP.name;
  drawPanels();
  $("#track").innerHTML = [...BRANDS, ...BRANDS].map((b) => `<span class="brand-chip">${esc(b)}</span>`).join("");
  document.querySelectorAll("[data-wa]").forEach((a) => { a.href = `https://wa.me/${SHOP.whatsapp}`; a.target = "_blank"; a.rel = "noopener"; });
  lastCount = cartItems().reduce((s, x) => s + x.q, 0);
  renderChips(); renderGrid(true); renderCart();

  window.addEventListener("scroll", () => $("header").classList.toggle("solid", window.scrollY > 40), { passive: true });
  $("#search").addEventListener("input", (e) => { query = e.target.value.trim().toLowerCase(); renderGrid(true); });
  $("#chips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    cat = b.dataset.cat; renderChips(); renderGrid(true);
  });
  $("#grid").addEventListener("click", onCardClick);
  $("#items").addEventListener("click", onCardClick);
  $("#cartbtn").addEventListener("click", () => openCart(true));
  $("#close").addEventListener("click", () => openCart(false));
  $("#overlay").addEventListener("click", () => openCart(false));
  $("#clear").addEventListener("click", () => { cart = {}; saveCart(); renderCart(); renderGrid(false); });
  $("#checkout").addEventListener("submit", sendOrder);
}
init();
