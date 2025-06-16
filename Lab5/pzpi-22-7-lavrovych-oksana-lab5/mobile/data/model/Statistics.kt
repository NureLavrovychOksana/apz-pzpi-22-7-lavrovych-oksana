package com.example.safezonetracker.data.model

// Комплексна модель для статистики
data class Statistics(
    val frequencyByType: List<ThreatFrequency>,
    val severityDistribution: List<SeverityDistribution>,
    val physicalParams: PhysicalParams
)

data class ThreatFrequency(
    val threatType: String,
    val frequency: Int
)

data class SeverityDistribution(
    val severityLevel: Int,
    val count: Int
)

data class PhysicalParams(
    val avgTemp: Float?,
    val minTemp: Float?,
    val maxTemp: Float?,
    val avgHumidity: Float?,
    val minHumidity: Float?,
    val maxHumidity: Float?,
    val avgGas: Float?,
    val minGas: Float?,
    val maxGas: Float?
)