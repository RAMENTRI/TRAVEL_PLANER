const form = document.querySelector("#planner-form");
const demoButton = document.querySelector("#load-demo");
const saveButton = document.querySelector("#save-plan");
const downloadButton = document.querySelector("#download-plan");
const printButton = document.querySelector("#print-plan");
const optimizeButton = document.querySelector("#optimize-plan");
const themeButton = document.querySelector(".theme-toggle");

const timeline = document.querySelector("#timeline");
const budgetGrid = document.querySelector("#budget-grid");
const packingGrid = document.querySelector("#packing-grid");
const destinationImage = document.querySelector("#destination-image");

const destinationProfiles = [
  {
    match: ["tokyo", "japan", "kyoto", "osaka"],
    region: "East Asia",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1100&q=80",
    signature: ["neighborhood walks", "rail-friendly routing", "small food streets", "temple pauses"],
    climate: "variable",
    currency: "JPY",
    base: { lean: 105, balanced: 185, premium: 360 }
  },
  {
    match: ["paris", "france", "lyon", "nice"],
    region: "Western Europe",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1100&q=80",
    signature: ["museum clusters", "walkable quarters", "cafe breaks", "river viewpoints"],
    climate: "temperate",
    currency: "EUR",
    base: { lean: 120, balanced: 220, premium: 430 }
  },
  {
    match: ["new york", "usa", "united states", "san francisco", "chicago"],
    region: "North America",
    image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1100&q=80",
    signature: ["transit corridors", "iconic viewpoints", "neighborhood food", "showtime evenings"],
    climate: "seasonal",
    currency: "USD",
    base: { lean: 145, balanced: 260, premium: 520 }
  },
  {
    match: ["bali", "indonesia", "thailand", "vietnam", "singapore", "malaysia"],
    region: "Southeast Asia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1100&q=80",
    signature: ["market mornings", "nature escapes", "spa recovery", "sunset dinners"],
    climate: "tropical",
    currency: "USD",
    base: { lean: 55, balanced: 110, premium: 260 }
  },
  {
    match: ["dubai", "uae", "abu dhabi", "doha", "qatar"],
    region: "Middle East",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1100&q=80",
    signature: ["architectural landmarks", "desert excursions", "late dining", "shopping districts"],
    climate: "hot",
    currency: "USD",
    base: { lean: 115, balanced: 235, premium: 560 }
  },
  {
    match: ["london", "uk", "england", "edinburgh", "ireland"],
    region: "British Isles",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1100&q=80",
    signature: ["historic walks", "pub dinners", "free museums", "rain-proof alternates"],
    climate: "cool",
    currency: "GBP",
    base: { lean: 125, balanced: 235, premium: 460 }
  }
];

const defaultProfile = {
  region: "Global",
  image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1100&q=80",
  signature: ["old-town orientation", "local market stops", "scenic viewpoints", "unhurried meal breaks"],
  climate: "variable",
  currency: "USD",
  base: { lean: 80, balanced: 160, premium: 330 }
};

const interestIdeas = {
  food: ["guided market tasting", "family-run lunch spot", "regional dessert stop", "chef-led dinner pick"],
  culture: ["main heritage district", "museum or gallery block", "historic walking loop", "local performance"],
  nature: ["urban garden or park", "viewpoint hike", "waterfront trail", "sunrise outdoor stop"],
  shopping: ["independent boutiques", "craft market", "design district", "souvenir hour"],
  nightlife: ["rooftop drink", "live music venue", "late-night food street", "evening neighborhood crawl"],
  family: ["hands-on museum", "low-stress park time", "interactive attraction", "early dinner zone"]
};

const paceSettings = {
  easy: { activities: 3, label: "Easy pace", modifier: 0.92 },
  steady: { activities: 4, label: "Steady pace", modifier: 1 },
  packed: { activities: 5, label: "Packed pace", modifier: 1.12 }
};

let currentPlan = null;

function init() {
  const savedTheme = localStorage.getItem("waywise-theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  const savedPlan = localStorage.getItem("waywise-plan");
  if (savedPlan) {
    currentPlan = JSON.parse(savedPlan);
    renderPlan(currentPlan);
  } else {
    destinationImage.src = defaultProfile.image;
  }

  const today = new Date();
  today.setDate(today.getDate() + 14);
  document.querySelector("#start-date").value = today.toISOString().slice(0, 10);
}

function getProfile(destination) {
  const normalized = destination.toLowerCase();
  return destinationProfiles.find((profile) => profile.match.some((term) => normalized.includes(term))) ?? defaultProfile;
}

function generatePlan(data) {
  const profile = getProfile(data.destination);
  const pace = paceSettings[data.pace];
  const start = new Date(`${data.startDate}T12:00:00`);
  const days = Array.from({ length: data.days }, (_, index) => buildDay(index, start, data, profile, pace));
  const perPersonDaily = Math.round(profile.base[data.budget] * pace.modifier);
  const total = perPersonDaily * data.travelers * data.days;
  const budget = buildBudget(perPersonDaily, total, data, profile);
  const packing = buildPacking(data, profile);
  const summary = buildSummary(data, profile, total, pace);

  return {
    createdAt: new Date().toISOString(),
    input: data,
    profile,
    summary,
    days,
    budget,
    packing
  };
}

function buildDay(index, start, data, profile, pace) {
  const date = new Date(start);
  date.setDate(start.getDate() + index);
  const selectedIdeas = data.interests.flatMap((interest) => interestIdeas[interest] ?? []);
  const ideaPool = [...profile.signature, ...selectedIdeas, ...defaultProfile.signature];
  const templates = [
    ["09:00", "Orientation", `Start with ${pick(ideaPool, index)} near your stay, then mark easy transit links.`],
    ["11:00", "Anchor stop", `Visit a high-value ${pick(data.interests, index + 1) || "local"} experience before crowds build.`],
    ["13:00", "Lunch", `Choose a well-reviewed local area instead of eating beside the biggest landmark.`],
    ["15:30", "Discovery block", `Add ${pick(ideaPool, index + 3)} with a flexible backup nearby.`],
    ["19:00", "Evening", `End around ${pick(ideaPool, index + 5)} and keep the return route simple.`]
  ];

  return {
    date: date.toISOString(),
    title: index === 0 ? "Arrive and get oriented" : `Explore ${data.destination.split(",")[0]} by theme`,
    activities: templates.slice(0, pace.activities),
    note: smartNote(index, data, profile)
  };
}

function smartNote(index, data, profile) {
  const notes = [
    `Keep this day close together geographically; ${profile.region} trips work better when transit time is protected.`,
    `Book the first timed attraction in advance, then leave the afternoon modular for weather and energy.`,
    `Use the notes you gave: "${data.notes || "no special constraints"}" as the filter for restaurant and activity choices.`,
    `Avoid placing your most expensive meal and paid attraction on the same day unless the budget has room.`,
    `Save one low-effort option nearby so the plan still works if flights, trains, or weather shift.`
  ];
  return notes[index % notes.length];
}

function buildBudget(perPersonDaily, total, data, profile) {
  const lodging = Math.round(total * 0.38);
  const food = Math.round(total * 0.24);
  const transport = Math.round(total * 0.16);
  const activities = Math.round(total * 0.14);
  const buffer = Math.max(40, Math.round(total * 0.08));

  return [
    { label: "Total estimate", value: total, detail: `${data.travelers} traveler(s), ${data.days} day(s), ${profile.currency} style math` },
    { label: "Daily per person", value: perPersonDaily, detail: `${data.budget} budget with ${paceSettings[data.pace].label.toLowerCase()}` },
    { label: "Lodging", value: lodging, detail: "Hotels, apartments, or guesthouses" },
    { label: "Food", value: food, detail: "Meals, cafes, snacks, water" },
    { label: "Local transport", value: transport, detail: "Metro, rideshare, transfers, day passes" },
    { label: "Activities", value: activities, detail: "Tickets, tours, guides, rentals" },
    { label: "Flex buffer", value: buffer, detail: "Delays, baggage, tips, spontaneous finds" }
  ];
}

function buildPacking(data, profile) {
  const base = ["Passport or ID", "Travel insurance", "Reusable bottle", "Phone charger", "Offline maps", "Day bag"];
  const climate = {
    tropical: ["Light rain shell", "Breathable layers", "Sunscreen", "Insect repellent"],
    hot: ["Sun hat", "Electrolytes", "Modest breathable clothing", "SPF lip balm"],
    cool: ["Compact umbrella", "Warm layer", "Waterproof shoes", "Scarf"],
    seasonal: ["Layered outfits", "Weather app check", "Comfortable walking shoes", "Backup indoor plan"],
    temperate: ["Light jacket", "Walkable shoes", "Evening layer", "Foldable tote"],
    variable: ["Layering pieces", "Rain option", "Comfortable shoes", "Laundry pouch"]
  };
  const interestItems = {
    food: ["Restaurant shortlist", "Food allergy translation"],
    nature: ["Trail shoes", "Small first-aid kit"],
    nightlife: ["Evening outfit", "Late transport plan"],
    family: ["Medication kit", "Snacks and downtime activities"],
    shopping: ["Foldable extra bag", "Customs allowance check"],
    culture: ["Museum reservations", "Audio guide headphones"]
  };

  return [
    { label: "Essentials", items: base },
    { label: "Weather fit", items: climate[profile.climate] ?? climate.variable },
    { label: "Trip-specific", items: data.interests.flatMap((interest) => interestItems[interest] ?? []).slice(0, 8) }
  ];
}

function buildSummary(data, profile, total, pace) {
  return {
    title: `${data.days}-day ${data.destination} plan`,
    copy: `${pace.label}, ${data.budget} budget, ${data.interests.join(", ") || "balanced"} focus. Estimated total: ${formatMoney(total, profile.currency)}.`,
    total,
    style: data.budget
  };
}

function renderPlan(plan) {
  document.querySelector("#summary-title").textContent = plan.summary.title;
  document.querySelector("#summary-copy").textContent = plan.summary.copy;
  document.querySelector("#stat-days").textContent = plan.input.days;
  document.querySelector("#stat-cost").textContent = formatMoney(plan.summary.total, plan.profile.currency);
  document.querySelector("#stat-style").textContent = plan.input.budget;
  destinationImage.src = plan.profile.image;
  destinationImage.alt = `${plan.input.destination} travel preview`;

  timeline.innerHTML = plan.days.map(renderDay).join("");
  budgetGrid.innerHTML = plan.budget.map((item) => renderBudget(item, plan.profile.currency)).join("");
  packingGrid.innerHTML = plan.packing.map(renderPacking).join("");
}

function renderDay(day, index) {
  const date = new Date(day.date);
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const month = date.toLocaleDateString(undefined, { month: "short" });
  return `
    <article class="day-card">
      <div class="day-date">
        <span>${weekday}</span>
        <strong>${date.getDate()}</strong>
        <span>${month}</span>
      </div>
      <div class="day-body">
        <h3>Day ${index + 1}: ${escapeHtml(day.title)}</h3>
        <ul class="activity-list">
          ${day.activities
            .map(
              ([time, label, text]) => `
                <li>
                  <span class="time">${time}</span>
                  <span><strong>${escapeHtml(label)}</strong><br />${escapeHtml(text)}</span>
                </li>
              `
            )
            .join("")}
        </ul>
        <p class="smart-note">${escapeHtml(day.note)}</p>
      </div>
    </article>
  `;
}

function renderBudget(item, currency) {
  return `
    <article class="budget-card">
      <h3>${escapeHtml(item.label)}</h3>
      <p>${escapeHtml(item.detail)}</p>
      <strong>${formatMoney(item.value, currency)}</strong>
    </article>
  `;
}

function renderPacking(group) {
  return `
    <article class="packing-card">
      <h3>${escapeHtml(group.label)}</h3>
      <ul>${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </article>
  `;
}

function readForm() {
  const formData = new FormData(form);
  const interests = formData.getAll("interests");
  return {
    destination: String(formData.get("destination")).trim(),
    startDate: String(formData.get("startDate")),
    days: Number(formData.get("days")),
    travelers: Number(formData.get("travelers")),
    budget: String(formData.get("budget")),
    pace: String(formData.get("pace")),
    interests: interests.length ? interests : ["culture", "food"],
    notes: String(formData.get("notes")).trim()
  };
}

function pick(items, seed) {
  if (!items.length) return "";
  return items[Math.abs(seed * 7 + 3) % items.length];
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return entities[character];
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  currentPlan = generatePlan(readForm());
  renderPlan(currentPlan);
  document.querySelector("#itinerary").scrollIntoView({ behavior: "smooth", block: "start" });
});

demoButton.addEventListener("click", () => {
  document.querySelector("#destination").value = "Tokyo, Japan";
  document.querySelector("#days").value = "6";
  document.querySelector("#travelers").value = "2";
  document.querySelector("#budget").value = "balanced";
  document.querySelector("#pace").value = "steady";
  document.querySelector("#notes").value = "Street food, temples, design shops, and not too many early mornings.";
  currentPlan = generatePlan(readForm());
  renderPlan(currentPlan);
  document.querySelector("#planner").scrollIntoView({ behavior: "smooth" });
});

saveButton.addEventListener("click", () => {
  if (!currentPlan) return;
  localStorage.setItem("waywise-plan", JSON.stringify(currentPlan));
  saveButton.title = "Saved";
});

downloadButton.addEventListener("click", () => {
  if (!currentPlan) return;
  const blob = new Blob([JSON.stringify(currentPlan, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `waywise-${currentPlan.input.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

printButton.addEventListener("click", () => window.print());

optimizeButton.addEventListener("click", () => {
  if (!currentPlan) return;
  currentPlan.input.pace = currentPlan.input.pace === "packed" ? "easy" : currentPlan.input.pace === "easy" ? "steady" : "packed";
  currentPlan = generatePlan(currentPlan.input);
  renderPlan(currentPlan);
});

themeButton.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "" : "dark";
  document.documentElement.dataset.theme = next;
  if (next) localStorage.setItem("waywise-theme", next);
  else localStorage.removeItem("waywise-theme");
});

init();
