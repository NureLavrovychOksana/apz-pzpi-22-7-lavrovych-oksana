package com.example.safezonetracker.ui.screens.details

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.safezonetracker.data.model.Threat

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetailsScreen(
    viewModel: DetailsViewModel = hiltViewModel(),
    onBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Деталі загрози") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Назад")
                    }
                }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentAlignment = Alignment.Center
        ) {
            when (val state = uiState) {
                is DetailsUiState.Loading -> CircularProgressIndicator()
                is DetailsUiState.Error -> Text(state.message)
                is DetailsUiState.Success -> DetailsContent(threat = state.threat)
            }
        }
    }
}
@Composable
fun DetailsContent(threat: Threat) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        DetailItem("Тип загрози:", threat.threatType)
        DetailItem("Рівень небезпеки:", threat.severityLevel.toString())
        DetailItem("ID локації:", threat.locationId.toString())
        DetailItem("Час виявлення:", threat.createdAt)
        Divider(modifier = Modifier.padding(vertical = 8.dp))
        DetailItem("Опис:", threat.description)
        DetailItem("Рекомендовані дії:", threat.recommendedAction)
    }
}


@Composable
fun DetailItem(label: String, value: String) {
    Column {
        Text(label, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
        Text(value, style = MaterialTheme.typography.bodyLarge)
    }
}