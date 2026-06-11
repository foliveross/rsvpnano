export interface NanoInfo {
  name: string;
  mode: string;
  baseUrl: string;
  networkSsid?: string;
  pairingCode: string;
  uploadPath: string;
  wirelessActive?: boolean;
  ip?: string;
  firmwareVersion?: string;
  fork?: string;
}

export interface NanoBook {
  name: string;
  title?: string;
  author?: string;
  bytes: number;
  progressPercent?: number;
  category?: string;
}

export interface NanoBooksResponse {
  books: NanoBook[];
}

export interface NanoUploadResponse {
  ok: boolean;
  path?: string;
  error?: string;
  deleted?: number;
}

export interface NanoWifiSettings {
  ok: boolean;
  configured: boolean;
  ssid: string;
  passwordSet: boolean;
}

export interface NanoRssFeeds {
  ok: boolean;
  feeds: string[];
}

export interface WirelessStatus {
  ok: boolean;
  active: boolean;
  mode: string;
  ssid: string;
  url: string;
  ip: string;
  pairingCode: string;
}

export interface StorageInfo {
  ok: boolean;
  mounted: boolean;
  totalBytes: number;
  usedBytes: number;
  booksFolder: string;
  articlesFolder: string;
  bookCount: number;
  articleCount: number;
}

export interface ReadingStats {
  ok: boolean;
  wordsReadToday: number;
  wordsDate: string;
  currentWpm: number;
}

export interface OtaCheckResult {
  ok: boolean;
  configured: boolean;
  currentVersion: string;
  latestVersion?: string;
  updateAvailable?: boolean;
  summary?: string;
}

export interface NanoSettings {
  ok: boolean;
  version: number;
  reading: {
    wpm: number;
    readerMode: string;
    pauseMode: string;
    accurateTimeEstimate: boolean;
    pacing: {
      longWordMs: number;
      complexWordMs: number;
      punctuationMs: number;
    };
  };
  display: {
    brightnessIndex: number;
    darkMode: boolean;
    nightMode: boolean;
    handedness: string;
    footerMetric: string;
    batteryLabel: string;
    readingBattery: boolean;
    readingChapter: boolean;
    readingProgress: boolean;
    language: number;
    phantomWords: boolean;
    fontSizeIndex: number;
  };
  typography: {
    typeface: string;
    focusHighlight: boolean;
    tracking: number;
    anchorPercent: number;
    guideWidth: number;
    guideGap: number;
  };
}
