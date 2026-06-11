package com.foliveross.rsvpnano.data

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File
import java.util.concurrent.TimeUnit

class NanoRepository(private val baseUrl: String) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(120, TimeUnit.SECONDS)
        .writeTimeout(120, TimeUnit.SECONDS)
        .build()

    private val api: ApiService = Retrofit.Builder()
        .baseUrl(normalizeBase(baseUrl))
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)

    private fun normalizeBase(url: String): String {
        var value = url.trim()
        if (!value.startsWith("http://") && !value.startsWith("https://")) {
            value = "http://$value"
        }
        if (!value.endsWith("/")) value += "/"
        return value
    }

    suspend fun connect(): NanoInfo = api.info()

    suspend fun loadBooks(): List<NanoBook> = api.books().books

    suspend fun wirelessStatus(): WirelessStatus = api.wireless()

    suspend fun enableWireless(pairingCode: String, mode: String, timeoutMin: Int): WirelessStatus =
        api.enableWireless(WirelessRequest(pairingCode, mode, timeoutMin))

    suspend fun disableWireless(pairingCode: String) {
        api.disableWireless(WirelessRequest(pairingCode))
    }

    suspend fun storage(): StorageInfo = api.storage()

    suspend fun cleanupSidecars() = api.cleanupSidecars()

    suspend fun refreshLibrary() = api.refreshLibrary()

    suspend fun uploadFile(file: File, category: String) {
        val part = MultipartBody.Part.createFormData(
            "file",
            file.name,
            file.asRequestBody("application/octet-stream".toMediaType()),
        )
        api.uploadBook(file.name, category, part)
    }

    suspend fun uploadArticle(title: String, author: String, body: String) {
        val safeTitle = title.ifBlank { "Untitled Article" }
        val content = buildString {
            append("@rsvp 1\n@title $safeTitle\n")
            if (author.isNotBlank()) append("@author $author\n")
            append("@para\n")
            append(body.trim())
            append("\n")
        }
        val file = File.createTempFile("article", ".rsvp")
        file.writeText(content)
        uploadFile(file, "article")
        file.delete()
    }

    suspend fun deleteBook(name: String) = api.deleteBook(name)

    suspend fun wifi(): NanoWifiSettings = api.wifi()

    suspend fun saveWifi(ssid: String, password: String) = api.saveWifi(WifiUpdate(ssid, password))

    suspend fun forgetWifi() = api.forgetWifi()

    suspend fun rssFeeds(): NanoRssFeeds = api.rssFeeds()

    suspend fun saveRss(feeds: List<String>) = api.saveRss(RssUpdate(feeds))
}
