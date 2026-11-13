// Dados fictícios para demonstração do dashboard Nexa.
// Conversão ilustrativa usada apenas para comparar moedas: US$ 1 = R$ 5,00.
const exchangeRate = 5;
const transactions = [
  { client: "Studio Aurora", initials: "SA", avatar: "avatar-a", project: "Identidade visual", amount: 3200, currency: "BRL", date: "2026-11-11", status: "received" },
  { client: "Northstar Co.", initials: "NC", avatar: "avatar-b", project: "Landing page", amount: 850, currency: "USD", date: "2026-11-09", status: "pending" },
  { client: "Marina Costa", initials: "MC", avatar: "avatar-c", project: "Social media", amount: 1450, currency: "BRL", date: "2026-11-07", status: "received" },
  { client: "Bright Labs", initials: "BL", avatar: "avatar-d", project: "UI Design", amount: 1200, currency: "USD", date: "2026-11-05", status: "received" },
  { client: "Café Botânica", initials: "CB", avatar: "avatar-b", project: "Site institucional", amount: 2800, currency: "BRL", date: "2026-10-29", status: "pending" },
  { client: "Oliver Smith", initials: "OS", avatar: "avatar-c", project: "Dashboard UI", amount: 640, currency: "USD", date: "2026-10-22", status: "received" },
  { client: "Ateliê Forma", initials: "AF", avatar: "avatar-a", project: "E-commerce", amount: 4100, currency: "BRL", date: "2026-10-17", status: "received" },
  { client: "Pixel House", initials: "PH", avatar: "avatar-d", project: "Design system", amount: 500, currency: "USD", date: "2026-09-28", status: "pending" },
  { client: "Lucas Andrade", initials: "LA", avatar: "avatar-c", project: "Página de vendas", amount: 1900, currency: "BRL", date: "2026-09-15", status: "received" },
  { client: "Mellow Studio", initials: "MS", avatar: "avatar-b", project: "Branding", amount: 720, currency: "USD", date: "2026-08-20", status: "received" }
];

let selectedCurrency = "BRL";
let selectedPeriod = "30d";
const currencySelect = document.querySelector("#currencySelect");
const canvas = document.querySelector("#revenueChart");
const ctx = canvas.getContext("2d");

function toBRL(item) {
  return item.currency === "USD" ? item.amount * exchangeRate : item.amount;
}
function displayAmount(brlValue) {
  const value = selectedCurrency === "USD" ? brlValue / exchangeRate : brlValue;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: selectedCurrency,
    maximumFractionDigits: 0
  }).format(value);
}
function nativeAmount(item) {
  const value = selectedCurrency === item.currency ? item.amount :
    (selectedCurrency === "BRL" ? item.amount * exchangeRate : item.amount / exchangeRate);
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: selectedCurrency,
    maximumFractionDigits: 0
  }).format(value);
}
function filteredTransactions() {
  const now = new Date("2026-11-12T12:00:00");
  const days = selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : selectedPeriod === "90d" ? 90 : Infinity;
  return transactions.filter(item => {
    if (days === Infinity) return true;
    const date = new Date(`${item.date}T12:00:00`);
    return (now - date) / 86400000 <= days;
  });
}
function formatShort(value) {
  const converted = selectedCurrency === "USD" ? value / exchangeRate : value;
  return new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(converted);
}
function renderStats(items) {
  const total = items.reduce((sum, item) => sum + toBRL(item), 0);
  const received = items.filter(x => x.status === "received").reduce((sum, item) => sum + toBRL(item), 0);
  const pending = items.filter(x => x.status === "pending").reduce((sum, item) => sum + toBRL(item), 0);
  const projects = items.filter(x => x.status === "received").length;
  document.querySelector("#totalRevenue").textContent = displayAmount(total);
  document.querySelector("#receivedRevenue").textContent = displayAmount(received);
  document.querySelector("#pendingRevenue").textContent = displayAmount(pending);
  document.querySelector("#projectCount").textContent = projects;
  document.querySelector("#projectProgress").style.width = `${Math.min(100, projects * 10)}%`;
  document.querySelector("#monthlyAverage").textContent = displayAmount(total / (selectedPeriod === "7d" ? 1 : selectedPeriod === "30d" ? 1 : selectedPeriod === "90d" ? 3 : 4));
}
function renderClients(items) {
  const rows = items.slice(0, 5).map(item => `
    <tr>
      <td><div class="client-cell"><span class="client-avatar ${item.avatar}">${item.initials}</span>${item.client}</div></td>
      <td>${item.project}</td>
      <td>${nativeAmount(item)}</td>
      <td><span class="status ${item.status === "received" ? "status-paid" : "status-pending"}">${item.status === "received" ? "Recebido" : "Pendente"}</span></td>
    </tr>`).join("");
  document.querySelector("#clientRows").innerHTML = rows || '<tr><td colspan="4">Nenhum registro neste período.</td></tr>';
}
function renderTransactions(items) {
  document.querySelector("#transactionList").innerHTML = items.slice(0, 4).map(item => `
    <div class="transaction">
      <span class="transaction-icon ${item.status === "received" ? "income" : "waiting"}">${item.status === "received" ? "↙" : "◷"}</span>
      <div class="transaction-info"><b>${item.client}</b><small>${item.project} · ${new Date(`${item.date}T12:00:00`).toLocaleDateString("pt-BR")}</small></div>
      <div class="transaction-value">${nativeAmount(item)}<small>${item.status === "received" ? "Recebido" : "Pendente"}</small></div>
    </div>`).join("");
}
function renderDonut(items) {
  const brl = items.filter(x => x.currency === "BRL").reduce((s, x) => s + x.amount, 0);
  const usd = items.filter(x => x.currency === "USD").reduce((s, x) => s + x.amount * exchangeRate, 0);
  const total = brl + usd || 1;
  const brlPct = Math.round(brl / total * 100);
  document.querySelector("#currencyDonut").style.background = `conic-gradient(#8b7cff 0 ${brlPct}%, #47bca4 ${brlPct}% 100%)`;
  document.querySelector("#brlShare").textContent = `${brlPct}%`;
  document.querySelector("#usdShare").textContent = `${100 - brlPct}%`;
  document.querySelector("#donutTotal").textContent = displayAmount(total);
}
function buildChartData(items) {
  const now = new Date("2026-11-12T12:00:00");
  const monthCount = selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 6 : selectedPeriod === "90d" ? 6 : 8;
  const labels = selectedPeriod === "7d"
    ? ["Qui", "Sex", "Sáb", "Dom", "Seg", "Ter", "Qua"]
    : selectedPeriod === "30d"
      ? ["Out 14", "Out 19", "Out 24", "Out 29", "Nov 3", "Nov 8"]
      : selectedPeriod === "90d"
        ? ["Set", "Set", "Out", "Out", "Nov", "Nov"]
        : ["Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov"];
  const values = Array(monthCount).fill(0);
  const pendingValues = Array(monthCount).fill(0);
  items.forEach(item => {
    const date = new Date(`${item.date}T12:00:00`);
    let index;
    if (selectedPeriod === "7d") {
      index = Math.max(0, 6 - Math.floor((now - date) / 86400000));
    } else if (selectedPeriod === "30d") {
      index = Math.min(5, Math.max(0, Math.floor((date.getDate() - 1) / 5)));
    } else if (selectedPeriod === "90d") {
      index = Math.min(5, Math.max(0, (date.getMonth() - 8) * 2 + Math.floor((date.getDate() - 1) / 16)));
    } else {
      index = Math.max(0, Math.min(7, date.getMonth() - 3));
    }
    const target = item.status === "received" ? values : pendingValues;
    if (index >= 0 && index < monthCount) target[index] += toBRL(item);
  });
  return { labels, values, pendingValues };
}
function drawChart(items) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * dpr);
  canvas.height = Math.max(1, rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const width = rect.width, height = rect.height;
  ctx.clearRect(0, 0, width, height);
  const { labels, values, pendingValues } = buildChartData(items);
  const max = Math.max(1000, ...values.map((v, i) => v + pendingValues[i])) * 1.2;
  const x = i => 8 + i * ((width - 16) / Math.max(1, labels.length - 1));
  const y = v => height - 8 - (v / max) * (height - 18);

  // Área de faturamento recebido.
  ctx.beginPath();
  values.forEach((v, i) => i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v)));
  ctx.lineTo(x(values.length - 1), height - 8);
  ctx.lineTo(x(0), height - 8);
  ctx.closePath();
  const fill = ctx.createLinearGradient(0, 0, 0, height);
  fill.addColorStop(0, "rgba(139,124,255,.26)");
  fill.addColorStop(1, "rgba(139,124,255,0)");
  ctx.fillStyle = fill; ctx.fill();

  ctx.beginPath();
  values.forEach((v, i) => i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v)));
  ctx.strokeStyle = "#9587ff"; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.stroke();

  ctx.beginPath();
  pendingValues.forEach((v, i) => i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v)));
  ctx.strokeStyle = "#566176"; ctx.lineWidth = 1.7; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);

  values.forEach((v, i) => {
    ctx.beginPath(); ctx.arc(x(i), y(v), 3, 0, Math.PI * 2);
    ctx.fillStyle = "#b5aaff"; ctx.fill();
  });
  document.querySelector("#xLabels").innerHTML = labels.map(label => `<span>${label}</span>`).join("");
  const yLabels = [max, max * .75, max * .5, max * .25, 0];
  document.querySelector("#yLabels").innerHTML = yLabels.map(v => `<span>${selectedCurrency === "USD" ? "US$" : "R$"} ${formatShort(v)}</span>`).join("");
  const best = Math.max(...values);
  document.querySelector("#bestMonth").textContent = labels[values.indexOf(best)] || "—";
}
function render() {
  const items = filteredTransactions();
  renderStats(items);
  renderClients(items);
  renderTransactions(items);
  renderDonut(items);
  drawChart(items);
}
document.querySelectorAll(".period-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".period-btn").forEach(x => x.classList.remove("active"));
    button.classList.add("active");
    selectedPeriod = button.dataset.period;
    render();
  });
});
currencySelect.addEventListener("change", () => {
  selectedCurrency = currencySelect.value;
  render();
});
window.addEventListener("resize", () => drawChart(filteredTransactions()));

// Menu lateral mobile.
const sidebar = document.querySelector("#sidebar");
const mobileMenu = document.querySelector("#mobileMenu");
mobileMenu.addEventListener("click", () => {
  const open = sidebar.classList.toggle("open");
  mobileMenu.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".side-nav a").forEach(link => link.addEventListener("click", () => {
  sidebar.classList.remove("open");
  mobileMenu.setAttribute("aria-expanded", "false");
}));

// Modal para inserir receita fictícia/local (não envia dados para servidor).
const modal = document.querySelector("#revenueModal");
const form = document.querySelector("#revenueForm");
const toast = document.querySelector("#toast");
const openModal = () => {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  form.elements.date.value = new Date().toISOString().slice(0, 10);
  form.elements.client.focus();
};
const closeModal = () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
};
document.querySelector("#addRevenueBtn").addEventListener("click", openModal);
document.querySelector("#closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
form.addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(form);
  const client = String(data.get("client")).trim();
  const project = String(data.get("project")).trim();
  const amount = Number(data.get("amount"));
  if (!client || !project || !Number.isFinite(amount) || amount <= 0) return;
  const initials = client.split(/\s+/).slice(0, 2).map(x => x[0].toUpperCase()).join("");
  transactions.unshift({
    client, initials, avatar: ["avatar-a","avatar-b","avatar-c","avatar-d"][Math.floor(Math.random() * 4)],
    project, amount, currency: data.get("currency"), date: data.get("date"),
    status: data.get("status")
  });
  closeModal();
  form.reset();
  render();
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
});
render();
