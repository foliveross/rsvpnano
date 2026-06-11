#pragma once

#include <Arduino.h>
#include <FS.h>
#include <Preferences.h>
#include <WebServer.h>

class CompanionSyncManager {
 public:
  enum class BeginMode : uint8_t {
    AccessPoint = 0,
    Station = 1,
    Auto = 2,
  };

  struct Config {
    String wifiSsid;
    String wifiPassword;
    BeginMode beginMode = BeginMode::AccessPoint;
  };

  bool begin(const Config &config);
  void update();
  void end();
  bool active() const;
  bool shutdownRequested() const;
  void clearShutdownRequest();
  bool libraryRefreshRequested() const;
  void clearLibraryRefreshRequest();
  String statusLine1() const;
  String statusLine2() const;
  String baseUrl() const;

 private:
  enum class NetworkMode : uint8_t {
    None,
    Station,
    AccessPoint,
  };

  struct RsvpMetadata {
    String title;
    String author;
  };

  static void handleInfoStatic();
  static void handleRootStatic();
  static void handleBooksListStatic();
  static void handleSettingsStatic();
  static void handleWifiStatic();
  static void handleRssFeedsStatic();
  static void handleBookDeleteStatic();
  static void handleBooksStatic();
  static void handleBookUploadStatic();
  static void handleWirelessStatic();
  static void handleStorageStatic();
  static void handleStorageCleanupStatic();
  static void handleLibraryRefreshStatic();
  static void handleStatsStatic();
  static void handleOtaCheckStatic();
  static void handleOptionsStatic();
  static void handleNotFoundStatic();

  bool startAccessPoint();
  bool startStation();
  bool startNetwork(BeginMode mode);
  bool startServer();
  void stopServer();
  void handleInfo();
  void handleRoot();
  void handleBooksList();
  void handleSettings();
  void handleWifi();
  void handleRssFeeds();
  void handleBookDelete();
  void handleBooks();
  void handleBookUpload();
  void handleWireless();
  void handleStorage();
  void handleStorageCleanup();
  void handleLibraryRefresh();
  void handleStats();
  void handleOtaCheck();
  void handleOptions();
  void handleNotFound();
  void applyCorsHeaders();
  bool validatePairingCode(const String &body) const;
  String wirelessJson() const;
  String storageJson() const;
  String statsJson();
  int cleanupSidecarFiles() const;
  String settingsJson();
  bool applySettingsJson(const String &body, String &error);
  String wifiJson();
  bool applyWifiJson(const String &body, String &error);
  String rssFeedsJson();
  bool writeRssFeedsJson(const String &body, String &error);
  String deviceSuffix() const;
  String jsonEscape(const String &value) const;
  String sanitizeFilename(const String &name) const;
  RsvpMetadata readRsvpMetadata(const String &path) const;
  bool progressPercentForPath(const String &path, uint8_t &percent);
  String bookPositionKey(const String &bookPath) const;
  String bookWordCountKey(const String &bookPath) const;
  uint32_t hashBookPath(const String &path) const;
  void finishUpload(bool success);

  static CompanionSyncManager *instance_;

  WebServer server_{80};
  File uploadFile_;
  String uploadFinalPath_;
  String uploadTmpPath_;
  String uploadError_;
  String pairingCode_;
  String networkSsid_;
  Preferences preferences_;
  String statusLine1_ = "Idle";
  String statusLine2_;
  NetworkMode networkMode_ = NetworkMode::None;
  bool active_ = false;
  bool serverStarted_ = false;
  bool shutdownRequested_ = false;
  bool libraryRefreshRequested_ = false;
  uint32_t lastActivityMs_ = 0;
};
