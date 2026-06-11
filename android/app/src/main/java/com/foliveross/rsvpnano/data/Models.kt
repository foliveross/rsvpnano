package com.foliveross.rsvpnano.data

data class NanoInfo(
    val name: String,
    val mode: String,
    val baseUrl: String,
    val networkSsid: String? = null,
    val pairingCode: String,
    val uploadPath: String,
    val wirelessActive: Boolean? = null,
    val ip: String? = null,
    val firmwareVersion: String? = null,
)

data class NanoBooksResponse(val books: List<NanoBook> = emptyList())

data class NanoBook(
    val name: String,
    val title: String? = null,
    val author: String? = null,
    val bytes: Long = 0,
    val progressPercent: Int? = null,
    val category: String? = null,
) {
    val displayTitle: String = title?.takeIf { it.isNotBlank() } ?: name.substringAfterLast('/')
    val isArticle: Boolean = category == "article" || name.startsWith("articles/")
}

data class NanoUploadResponse(val ok: Boolean, val path: String? = null, val error: String? = null)

data class WirelessStatus(
    val ok: Boolean = true,
    val active: Boolean = false,
    val mode: String = "off",
    val ssid: String = "",
    val url: String = "",
    val ip: String = "",
    val pairingCode: String = "",
)

data class StorageInfo(
    val ok: Boolean = true,
    val mounted: Boolean = false,
    val totalBytes: Long = 0,
    val usedBytes: Long = 0,
    val bookCount: Int = 0,
    val articleCount: Int = 0,
)

data class NanoWifiSettings(
    val ok: Boolean = true,
    val configured: Boolean = false,
    val ssid: String = "",
    val passwordSet: Boolean = false,
)

data class NanoRssFeeds(val ok: Boolean = true, val feeds: List<String> = emptyList())

data class WirelessRequest(
    val pairingCode: String,
    val mode: String? = null,
    val companionTimeoutMin: Int? = null,
)

data class WifiUpdate(val ssid: String, val password: String = "")

data class RssUpdate(val feeds: List<String>)

data class BatchDeleteRequest(val names: List<String>)
