package com.example.safezonetracker.data.model

data class Threat(
    val id: Int,
    val threatType: String,
    val description: String,
    val severityLevel: Int,
    val recommendedAction: String,
    val createdAt: String,
    val locationId: Int
)