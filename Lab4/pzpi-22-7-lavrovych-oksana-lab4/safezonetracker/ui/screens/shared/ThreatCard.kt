package com.example.safezonetracker.ui.screens.shared

import androidx.compose.foundation.clickable
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.example.safezonetracker.data.model.Threat
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ThreatCard(threat: Threat, onClick: () -> Unit) {
    Card(
        modifier = Modifier.clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        ListItem(
            headlineContent = { Text(threat.type) },
            supportingContent = { Text(threat.location) },
            trailingContent = { Text(threat.timestamp) },
            leadingContent = {
            }
        )
    }
}