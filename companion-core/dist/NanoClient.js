"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NanoClient = exports.NanoClientError = void 0;
class NanoClientError extends Error {
    constructor(message) {
        super(message);
        this.name = "NanoClientError";
    }
}
exports.NanoClientError = NanoClientError;
class NanoClient {
    constructor(baseURLString) {
        this.baseURLString = baseURLString;
    }
    baseURL() {
        let value = this.baseURLString.trim();
        if (!value.toLowerCase().startsWith("http://") && !value.toLowerCase().startsWith("https://")) {
            value = "http://" + value;
        }
        return value.replace(/\/$/, "");
    }
    endpoint(path) {
        return `${this.baseURL()}${path.startsWith("/") ? path : "/" + path}`;
    }
    async request(path, init) {
        const response = await fetch(this.endpoint(path), init);
        const text = await response.text();
        let json = {};
        try {
            json = text ? JSON.parse(text) : {};
        }
        catch {
            throw new NanoClientError(text || "Bad response");
        }
        if (!response.ok || json.ok === false) {
            throw new NanoClientError(String(json.error || response.statusText));
        }
        return json;
    }
    fetchInfo() {
        return this.request("/api/info");
    }
    fetchBooks() {
        return this.request("/api/books").then((r) => r.books);
    }
    fetchSettings() {
        return this.request("/api/settings");
    }
    updateSettings(settings) {
        return this.request("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
        });
    }
    fetchWifiSettings() {
        return this.request("/api/wifi");
    }
    updateWifi(ssid, password) {
        return this.request("/api/wifi", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ssid, password }),
        });
    }
    forgetWifi() {
        return this.request("/api/wifi", { method: "DELETE" });
    }
    fetchRssFeeds() {
        return this.request("/api/rss-feeds");
    }
    updateRssFeeds(feeds) {
        return this.request("/api/rss-feeds", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feeds }),
        });
    }
    fetchWireless() {
        return this.request("/api/wireless");
    }
    enableWireless(mode, pairingCode, companionTimeoutMin) {
        const body = { pairingCode, mode };
        if (companionTimeoutMin !== undefined) {
            body.companionTimeoutMin = companionTimeoutMin;
        }
        return this.request("/api/wireless", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    }
    disableWireless(pairingCode) {
        return this.request("/api/wireless", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pairingCode }),
        });
    }
    fetchStorage() {
        return this.request("/api/storage");
    }
    cleanupSidecars() {
        return this.request("/api/storage/cleanup", { method: "POST" });
    }
    refreshLibrary() {
        return this.request("/api/library/refresh", { method: "POST" });
    }
    fetchStats() {
        return this.request("/api/stats");
    }
    checkOta() {
        return this.request("/api/ota/check", { method: "POST" });
    }
    async uploadBook(data, filename, category = "book") {
        const form = new FormData();
        form.append("file", data instanceof Blob ? data : new Blob([data]), filename);
        const query = `?name=${encodeURIComponent(filename)}&category=${encodeURIComponent(category)}`;
        return this.request(`/api/books${query}`, { method: "POST", body: form });
    }
    deleteBook(name) {
        return this.request(`/api/books?name=${encodeURIComponent(name)}`, { method: "DELETE" });
    }
    deleteBooks(names) {
        return this.request("/api/books", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ names }),
        });
    }
}
exports.NanoClient = NanoClient;
