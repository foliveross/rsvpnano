package com.foliveross.rsvpnano

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.foliveross.rsvpnano.data.NanoBook
import com.foliveross.rsvpnano.data.NanoInfo
import com.foliveross.rsvpnano.data.NanoRepository
import com.foliveross.rsvpnano.data.StorageInfo
import com.foliveross.rsvpnano.data.WirelessStatus
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import java.io.File

private val Context.dataStore by preferencesDataStore("rsvpnano")

class CompanionViewModel : ViewModel() {
    private val baseUrlKey = stringPreferencesKey("base_url")

    val status = MutableStateFlow("")
    val connected = MutableStateFlow(false)
    val info = MutableStateFlow<NanoInfo?>(null)
    val books = MutableStateFlow<List<NanoBook>>(emptyList())
    val wireless = MutableStateFlow<WirelessStatus?>(null)
    val storage = MutableStateFlow<StorageInfo?>(null)

    private var repository: NanoRepository? = null

    fun loadSavedUrl(context: Context, onLoaded: (String) -> Unit) {
        viewModelScope.launch {
            val url = context.dataStore.data.map { it[baseUrlKey] ?: "http://192.168.4.1" }.first()
            onLoaded(url)
        }
    }

    fun saveUrl(context: Context, url: String) {
        viewModelScope.launch {
            context.dataStore.edit { it[baseUrlKey] = url }
        }
    }

    fun connect(context: Context, baseUrl: String) {
        viewModelScope.launch {
            status.value = "Connecting..."
            saveUrl(context, baseUrl)
            try {
                repository = NanoRepository(baseUrl)
                val deviceInfo = repository!!.connect()
                info.value = deviceInfo
                connected.value = true
                books.value = repository!!.loadBooks()
                status.value = "Connected to ${deviceInfo.name}"
            } catch (e: Exception) {
                connected.value = false
                status.value = "Error: ${e.message}"
            }
        }
    }

    fun refreshBooks() {
        viewModelScope.launch {
            try {
                books.value = repository?.loadBooks() ?: emptyList()
            } catch (e: Exception) {
                status.value = e.message ?: "Failed"
            }
        }
    }

    fun uploadFile(file: File, category: String) {
        viewModelScope.launch {
            try {
                repository?.uploadFile(file, category)
                refreshBooks()
                status.value = "Uploaded ${file.name}"
            } catch (e: Exception) {
                status.value = e.message ?: "Upload failed"
            }
        }
    }

    fun uploadSharedText(title: String, author: String, body: String) {
        viewModelScope.launch {
            try {
                repository?.uploadArticle(title, author, body)
                refreshBooks()
                status.value = "Article synced"
            } catch (e: Exception) {
                status.value = e.message ?: "Sync failed"
            }
        }
    }

    fun loadWireless() {
        viewModelScope.launch {
            try {
                wireless.value = repository?.wirelessStatus()
            } catch (e: Exception) {
                status.value = e.message ?: "Wireless API unavailable"
            }
        }
    }

    fun applyWireless(mode: String, timeoutMin: Int) {
        val code = info.value?.pairingCode ?: return
        viewModelScope.launch {
            try {
                wireless.value = repository?.enableWireless(code, mode, timeoutMin)
                status.value = "Wireless settings applied"
            } catch (e: Exception) {
                status.value = e.message ?: "Failed"
            }
        }
    }

    fun stopWireless() {
        val code = info.value?.pairingCode ?: return
        viewModelScope.launch {
            try {
                repository?.disableWireless(code)
                status.value = "Wireless stop requested"
            } catch (e: Exception) {
                status.value = e.message ?: "Failed"
            }
        }
    }

    fun loadStorage() {
        viewModelScope.launch {
            try {
                storage.value = repository?.storage()
            } catch (e: Exception) {
                status.value = e.message ?: "Failed"
            }
        }
    }

    fun cleanupSidecars() {
        viewModelScope.launch {
            try {
                repository?.cleanupSidecars()
                loadStorage()
                status.value = "Sidecars cleaned"
            } catch (e: Exception) {
                status.value = e.message ?: "Failed"
            }
        }
    }

    fun deleteBook(name: String) {
        viewModelScope.launch {
            try {
                repository?.deleteBook(name)
                refreshBooks()
            } catch (e: Exception) {
                status.value = e.message ?: "Delete failed"
            }
        }
    }
}
