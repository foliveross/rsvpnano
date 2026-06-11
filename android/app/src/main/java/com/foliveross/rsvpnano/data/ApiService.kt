package com.foliveross.rsvpnano.data

import okhttp3.MultipartBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part
import retrofit2.http.Query
import retrofit2.http.Url

interface ApiService {
    @GET("/api/info")
    suspend fun info(): NanoInfo

    @GET("/api/books")
    suspend fun books(): NanoBooksResponse

    @GET("/api/wireless")
    suspend fun wireless(): WirelessStatus

    @POST("/api/wireless")
    suspend fun enableWireless(@Body body: WirelessRequest): WirelessStatus

    @DELETE("/api/wireless")
    suspend fun disableWireless(@Body body: WirelessRequest): ResponseBody

    @GET("/api/storage")
    suspend fun storage(): StorageInfo

    @POST("/api/storage/cleanup")
    suspend fun cleanupSidecars(): ResponseBody

    @POST("/api/library/refresh")
    suspend fun refreshLibrary(): ResponseBody

    @GET("/api/wifi")
    suspend fun wifi(): NanoWifiSettings

    @PUT("/api/wifi")
    suspend fun saveWifi(@Body body: WifiUpdate): NanoWifiSettings

    @DELETE("/api/wifi")
    suspend fun forgetWifi(): NanoWifiSettings

    @GET("/api/rss-feeds")
    suspend fun rssFeeds(): NanoRssFeeds

    @PUT("/api/rss-feeds")
    suspend fun saveRss(@Body body: RssUpdate): NanoRssFeeds

    @Multipart
    @POST("/api/books")
    suspend fun uploadBook(
        @Query("name") name: String,
        @Query("category") category: String,
        @Part file: MultipartBody.Part,
    ): NanoUploadResponse

    @DELETE("/api/books")
    suspend fun deleteBook(@Query("name") name: String): NanoUploadResponse

    @DELETE("/api/books")
    suspend fun deleteBooks(@Body body: BatchDeleteRequest): NanoUploadResponse

    @POST
    suspend fun postRaw(@Url url: String, @Body body: Any): ResponseBody
}
