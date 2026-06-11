import type { NanoBook, NanoInfo, NanoRssFeeds, NanoSettings, NanoUploadResponse, NanoWifiSettings, OtaCheckResult, ReadingStats, StorageInfo, WirelessStatus } from "./types";
export declare class NanoClientError extends Error {
    constructor(message: string);
}
export declare class NanoClient {
    baseURLString: string;
    constructor(baseURLString: string);
    private baseURL;
    private endpoint;
    private request;
    fetchInfo(): Promise<NanoInfo>;
    fetchBooks(): Promise<NanoBook[]>;
    fetchSettings(): Promise<NanoSettings>;
    updateSettings(settings: Partial<NanoSettings>): Promise<NanoSettings>;
    fetchWifiSettings(): Promise<NanoWifiSettings>;
    updateWifi(ssid: string, password: string): Promise<NanoWifiSettings>;
    forgetWifi(): Promise<NanoWifiSettings>;
    fetchRssFeeds(): Promise<NanoRssFeeds>;
    updateRssFeeds(feeds: string[]): Promise<NanoRssFeeds>;
    fetchWireless(): Promise<WirelessStatus>;
    enableWireless(mode: "ap" | "sta" | "auto", pairingCode: string, companionTimeoutMin?: number): Promise<WirelessStatus>;
    disableWireless(pairingCode: string): Promise<{
        ok: boolean;
    }>;
    fetchStorage(): Promise<StorageInfo>;
    cleanupSidecars(): Promise<{
        ok: boolean;
        removed: number;
    }>;
    refreshLibrary(): Promise<{
        ok: boolean;
    }>;
    fetchStats(): Promise<ReadingStats>;
    checkOta(): Promise<OtaCheckResult>;
    uploadBook(data: Blob | ArrayBuffer, filename: string, category?: string): Promise<NanoUploadResponse>;
    deleteBook(name: string): Promise<NanoUploadResponse>;
    deleteBooks(names: string[]): Promise<NanoUploadResponse>;
}
