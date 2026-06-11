import type {
  NanoBook,
  NanoInfo,
  NanoRssFeeds,
  NanoSettings,
  NanoUploadResponse,
  NanoWifiSettings,
  OtaCheckResult,
  ReadingStats,
  StorageInfo,
  WirelessStatus,
} from "./types";

export class NanoClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NanoClientError";
  }
}

export class NanoClient {
  constructor(public baseURLString: string) {}

  private baseURL(): string {
    let value = this.baseURLString.trim();
    if (!value.toLowerCase().startsWith("http://") && !value.toLowerCase().startsWith("https://")) {
      value = "http://" + value;
    }
    return value.replace(/\/$/, "");
  }

  private endpoint(path: string): string {
    return `${this.baseURL()}${path.startsWith("/") ? path : "/" + path}`;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(this.endpoint(path), init);
    const text = await response.text();
    let json: Record<string, unknown> = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new NanoClientError(text || "Bad response");
    }
    if (!response.ok || json.ok === false) {
      throw new NanoClientError(String(json.error || response.statusText));
    }
    return json as T;
  }

  fetchInfo(): Promise<NanoInfo> {
    return this.request<NanoInfo>("/api/info");
  }

  fetchBooks(): Promise<NanoBook[]> {
    return this.request<{ books: NanoBook[] }>("/api/books").then((r) => r.books);
  }

  fetchSettings(): Promise<NanoSettings> {
    return this.request<NanoSettings>("/api/settings");
  }

  updateSettings(settings: Partial<NanoSettings>): Promise<NanoSettings> {
    return this.request<NanoSettings>("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
  }

  fetchWifiSettings(): Promise<NanoWifiSettings> {
    return this.request<NanoWifiSettings>("/api/wifi");
  }

  updateWifi(ssid: string, password: string): Promise<NanoWifiSettings> {
    return this.request<NanoWifiSettings>("/api/wifi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssid, password }),
    });
  }

  forgetWifi(): Promise<NanoWifiSettings> {
    return this.request<NanoWifiSettings>("/api/wifi", { method: "DELETE" });
  }

  fetchRssFeeds(): Promise<NanoRssFeeds> {
    return this.request<NanoRssFeeds>("/api/rss-feeds");
  }

  updateRssFeeds(feeds: string[]): Promise<NanoRssFeeds> {
    return this.request<NanoRssFeeds>("/api/rss-feeds", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feeds }),
    });
  }

  fetchWireless(): Promise<WirelessStatus> {
    return this.request<WirelessStatus>("/api/wireless");
  }

  enableWireless(mode: "ap" | "sta" | "auto", pairingCode: string, companionTimeoutMin?: number): Promise<WirelessStatus> {
    const body: Record<string, unknown> = { pairingCode, mode };
    if (companionTimeoutMin !== undefined) {
      body.companionTimeoutMin = companionTimeoutMin;
    }
    return this.request<WirelessStatus>("/api/wireless", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  disableWireless(pairingCode: string): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>("/api/wireless", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pairingCode }),
    });
  }

  fetchStorage(): Promise<StorageInfo> {
    return this.request<StorageInfo>("/api/storage");
  }

  cleanupSidecars(): Promise<{ ok: boolean; removed: number }> {
    return this.request<{ ok: boolean; removed: number }>("/api/storage/cleanup", { method: "POST" });
  }

  refreshLibrary(): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>("/api/library/refresh", { method: "POST" });
  }

  fetchStats(): Promise<ReadingStats> {
    return this.request<ReadingStats>("/api/stats");
  }

  checkOta(): Promise<OtaCheckResult> {
    return this.request<OtaCheckResult>("/api/ota/check", { method: "POST" });
  }

  async uploadBook(data: Blob | ArrayBuffer, filename: string, category = "book"): Promise<NanoUploadResponse> {
    const form = new FormData();
    form.append("file", data instanceof Blob ? data : new Blob([data]), filename);
    const query = `?name=${encodeURIComponent(filename)}&category=${encodeURIComponent(category)}`;
    return this.request<NanoUploadResponse>(`/api/books${query}`, { method: "POST", body: form });
  }

  deleteBook(name: string): Promise<NanoUploadResponse> {
    return this.request<NanoUploadResponse>(`/api/books?name=${encodeURIComponent(name)}`, { method: "DELETE" });
  }

  deleteBooks(names: string[]): Promise<NanoUploadResponse> {
    return this.request<NanoUploadResponse>("/api/books", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names }),
    });
  }
}
