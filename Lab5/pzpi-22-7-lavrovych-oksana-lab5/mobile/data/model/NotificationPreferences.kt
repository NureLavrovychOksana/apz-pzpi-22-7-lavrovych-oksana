package com.example.safezonetracker.data.model

data class NotificationPreferences(
    val receiveFireAlerts: Boolean,
    val receiveGasAlerts: Boolean,
    val receiveOverheatAlerts: Boolean
)