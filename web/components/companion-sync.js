/**
 * Wireless companion UI for GitHub Pages and local web.
 * Connects to the device REST API (AP 192.168.4.1 or STA rsvp-nano.local).
 */

const $ = (id) => document.getElementById(id);

function status(msg) {
  const el = $("companion-status");
  if (el) el.textContent = msg;
}

async function deviceApi(base, path, opts = {}) {
  const url = base.replace(/\/$/, "") + path;
  const response = await fetch(url, opts);
  const text = await response.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(text || "Bad response");
  }
  if (!response.ok || json.ok === false) {
    throw new Error(json.error || response.statusText);
  }
  return json;
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function renderBooks(books) {
  const list = $("companion-books-list");
  if (!list) return;
  const items = books.filter(
    (b) => b.category !== "article" && !String(b.name).startsWith("articles/"),
  );
  list.innerHTML = items.length
    ? items
        .map(
          (b) =>
            `<div class="companion-item"><strong>${esc(b.title || b.name)}</strong><br><span class="muted">${esc(b.name)} · ${b.bytes} B</span> <button type="button" class="companion-danger" data-del="${encodeURIComponent(b.name)}">Delete</button></div>`,
        )
        .join("")
    : '<span class="muted">No books yet.</span>';
  list.querySelectorAll("[data-del]").forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm("Delete this book?")) return;
      await deviceApi(state.base, `/api/books?name=${btn.dataset.del}`, { method: "DELETE" });
      await refreshBooks();
    };
  });
}

const state = { base: "", pairingCode: "" };

async function refreshBooks() {
  const data = await deviceApi(state.base, "/api/books");
  renderBooks(data.books || []);
}

async function connect() {
  state.base = $("companion-base-url").value.trim();
  if (!state.base) {
    status("Enter the device URL.");
    return;
  }
  try {
    const info = await deviceApi(state.base, "/api/info");
    state.pairingCode = info.pairingCode;
    $("companion-pairing-code").textContent = info.pairingCode;
    $("companion-info").innerHTML = `<strong>${esc(info.name)}</strong><br><span class="muted">${esc(info.mode)} · ${esc(info.networkSsid || "")} · FW ${esc(info.firmwareVersion || "")}</span><br>IP: ${esc(info.ip || "")}`;
    $("companion-connected").hidden = false;
    await refreshBooks();
    try {
      const w = await deviceApi(state.base, "/api/wireless");
      $("companion-wireless-json").textContent = JSON.stringify(w, null, 2);
    } catch {
      $("companion-wireless-json").textContent = "Wireless API requires fork firmware v0.1.0+";
    }
    status("Connected.");
    localStorage.setItem("rsvpnanoDeviceUrl", state.base);
  } catch (e) {
    status(`Connection failed: ${e.message}`);
  }
}

async function uploadBook() {
  const input = $("companion-book-file");
  const file = input?.files?.[0];
  if (!file) {
    status("Choose a file first.");
    return;
  }
  const fd = new FormData();
  fd.append("file", file, file.name);
  await deviceApi(
    state.base,
    `/api/books?name=${encodeURIComponent(file.name)}&category=book`,
    { method: "POST", body: fd },
  );
  input.value = "";
  await refreshBooks();
  status(`Uploaded ${file.name}`);
}

async function applyWireless() {
  await deviceApi(state.base, "/api/wireless", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pairingCode: state.pairingCode,
      mode: $("companion-wireless-mode").value,
      companionTimeoutMin: +$("companion-timeout").value || 0,
    }),
  });
  const w = await deviceApi(state.base, "/api/wireless");
  $("companion-wireless-json").textContent = JSON.stringify(w, null, 2);
  status("Wireless settings saved.");
}

async function stopWireless() {
  await deviceApi(state.base, "/api/wireless", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pairingCode: state.pairingCode }),
  });
  status("Wireless stop requested on device.");
}

async function cleanupSidecars() {
  const r = await deviceApi(state.base, "/api/storage/cleanup", { method: "POST" });
  status(`Removed ${r.removed} sidecar file(s).`);
}

async function syncArticle() {
  const title = $("companion-article-title").value.trim() || "Untitled Article";
  const author = $("companion-article-author").value.trim();
  const body = $("companion-article-body").value.trim();
  if (!body) {
    status("Paste article text first.");
    return;
  }
  let out = `@rsvp 1\n@title ${title}\n`;
  if (author) out += `@author ${author}\n`;
  out += `@para\n${body}\n`;
  const name = title.replace(/[^a-z0-9._ -]+/gi, "-").trim().slice(0, 72) || "article";
  const blob = new Blob([out], { type: "text/plain" });
  const fd = new FormData();
  fd.append("file", blob, `${name}.rsvp`);
  await deviceApi(
    state.base,
    `/api/books?name=${encodeURIComponent(name + ".rsvp")}&category=article`,
    { method: "POST", body: fd },
  );
  status("Article synced.");
}

export function initCompanionSync() {
  const saved = localStorage.getItem("rsvpnanoDeviceUrl");
  if (saved && $("companion-base-url")) $("companion-base-url").value = saved;

  $("companion-connect-btn")?.addEventListener("click", connect);
  $("companion-upload-btn")?.addEventListener("click", uploadBook);
  $("companion-apply-wireless-btn")?.addEventListener("click", applyWireless);
  $("companion-stop-wireless-btn")?.addEventListener("click", stopWireless);
  $("companion-cleanup-btn")?.addEventListener("click", cleanupSidecars);
  $("companion-sync-article-btn")?.addEventListener("click", syncArticle);
}
