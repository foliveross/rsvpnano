package com.foliveross.rsvpnano

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Upload
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import java.io.File

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                CompanionApp(sharedText = extractSharedText(intent))
            }
        }
    }

    private fun extractSharedText(intent: Intent?): String? {
        if (intent?.action != Intent.ACTION_SEND) return null
        return intent.getStringExtra(Intent.EXTRA_TEXT)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompanionApp(sharedText: String?, vm: CompanionViewModel = viewModel()) {
    val context = LocalContext.current
    val status by vm.status.collectAsState()
    val connected by vm.connected.collectAsState()
    val info by vm.info.collectAsState()
    val books by vm.books.collectAsState()
    val wireless by vm.wireless.collectAsState()
    val storage by vm.storage.collectAsState()

    var baseUrl by remember { mutableStateOf("http://192.168.4.1") }
    var tab by remember { mutableIntStateOf(0) }
    var wirelessMode by remember { mutableStateOf("ap") }
    var timeoutMin by remember { mutableStateOf("0") }

    LaunchedEffect(Unit) {
        vm.loadSavedUrl(context) { baseUrl = it }
    }

    LaunchedEffect(sharedText) {
        if (sharedText != null && connected) {
            vm.uploadSharedText("Shared article", "", sharedText)
        }
    }

    val filePicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            val file = File(context.cacheDir, "upload.rsvp")
            context.contentResolver.openInputStream(it)?.use { input ->
                file.outputStream().use { output -> input.copyTo(output) }
            }
            vm.uploadFile(file, "book")
        }
    }

    Scaffold(
        topBar = { TopAppBar(title = { Text("RSVP Nano") }) },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(status, style = MaterialTheme.typography.bodyMedium)

            OutlinedTextField(
                value = baseUrl,
                onValueChange = { baseUrl = it },
                label = { Text("Device URL") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            Button(onClick = { vm.connect(context, baseUrl) }) { Text("Connect") }

            if (connected) {
                info?.let { device ->
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(12.dp)) {
                            Text(device.name, style = MaterialTheme.typography.titleMedium)
                            Text("${device.mode} · ${device.networkSsid ?: ""}")
                            Text("Pairing: ${device.pairingCode}")
                            Text("FW: ${device.firmwareVersion ?: "—"}")
                        }
                    }
                }

                TabRow(selectedTabIndex = tab) {
                    Tab(selected = tab == 0, onClick = { tab = 0 }, text = { Text("Books") })
                    Tab(selected = tab == 1, onClick = { tab = 1; vm.loadWireless() }, text = { Text("Wireless") })
                    Tab(selected = tab == 2, onClick = { tab = 2; vm.loadStorage() }, text = { Text("Storage") })
                }

                when (tab) {
                    0 -> {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = { filePicker.launch("*/*") }) {
                                Icon(Icons.Default.Upload, contentDescription = null)
                                Text("Upload")
                            }
                            Button(onClick = { vm.refreshBooks() }) { Text("Refresh") }
                        }
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(books.filter { !it.isArticle }) { book ->
                                Card(modifier = Modifier.fillMaxWidth()) {
                                    Row(
                                        Modifier
                                            .fillMaxWidth()
                                            .padding(12.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                    ) {
                                        Column {
                                            Text(book.displayTitle)
                                            Text(book.name, style = MaterialTheme.typography.bodySmall)
                                        }
                                        IconButton(onClick = { vm.deleteBook(book.name) }) {
                                            Icon(Icons.Default.Delete, contentDescription = "Delete")
                                        }
                                    }
                                }
                            }
                        }
                    }
                    1 -> {
                        wireless?.let { w ->
                            Text("Mode: ${w.mode} · Active: ${w.active}")
                            Text("URL: ${w.url}")
                        }
                        OutlinedTextField(
                            value = wirelessMode,
                            onValueChange = { wirelessMode = it },
                            label = { Text("Mode (ap/sta/auto)") },
                            modifier = Modifier.fillMaxWidth(),
                        )
                        OutlinedTextField(
                            value = timeoutMin,
                            onValueChange = { timeoutMin = it },
                            label = { Text("Timeout min") },
                            modifier = Modifier.fillMaxWidth(),
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = {
                                vm.applyWireless(wirelessMode, timeoutMin.toIntOrNull() ?: 0)
                            }) { Text("Apply") }
                            Button(onClick = { vm.stopWireless() }) { Text("Stop wireless") }
                        }
                    }
                    2 -> {
                        storage?.let { s ->
                            Text("Mounted: ${s.mounted}")
                            Text("Books: ${s.bookCount} · Articles: ${s.articleCount}")
                            Text("Used: ${s.usedBytes} / ${s.totalBytes} bytes")
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = { vm.cleanupSidecars() }) { Text("Clean sidecars") }
                            Button(onClick = { vm.loadStorage() }) { Text("Refresh") }
                        }
                    }
                }
            }
        }
    }
}
