package com.example.safezonetracker.data.remote.models

import com.google.gson.annotations.SerializedName

// DTO для Користувача
data class UserDto(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("role") val role: String,
    @SerializedName("status") val status: String
)

// DTO для Загрози
data class ThreatDto(
    @SerializedName("id") val id: Int,
    @SerializedName("threat_type") val threatType: String,
    @SerializedName("description") val description: String,
    @SerializedName("severity_level") val severityLevel: Int,
    @SerializedName("recommended_action") val recommendedAction: String,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("location_id") val locationId: Int
)

// DTO для IoT даних
data class IoTSensorDataDto(
    @SerializedName("id") val id: Int,
    @SerializedName("temperature") val temperature: Float,
    @SerializedName("humidity") val humidity: Float,
    @SerializedName("gas_level") val gasLevel: Float,
    @SerializedName("smoke_detected") val smokeDetected: Boolean,
    @SerializedName("timestamp") val timestamp: String
)

// DTO для Логу аудиту
data class AuditLogDto(
    @SerializedName("id") val id: Int,
    @SerializedName("timestamp") val timestamp: String,
    @SerializedName("actor") val actor: String,
    @SerializedName("action") val action: String,
    @SerializedName("details") val details: String
)

// DTO для Статусу систем
data class SystemStatusDto(
    @SerializedName("name") val name: String,
    @SerializedName("status") val status: String
)

// DTO для Статистики (композитний)
data class StatisticsDto(
    @SerializedName("frequencyByType") val frequencyByType: List<ThreatFrequencyDto>,
    @SerializedName("severityDistribution") val severityDistribution: List<SeverityDistributionDto>,
    @SerializedName("physicalParams") val physicalParams: PhysicalParamsDto
)

data class ThreatFrequencyDto(
    @SerializedName("threat_type") val threatType: String,
    @SerializedName("frequency") val frequency: Int
)

data class SeverityDistributionDto(
    @SerializedName("severity_level") val severityLevel: Int,
    @SerializedName("count") val count: Int
)

data class PhysicalParamsDto(
    @SerializedName("avg_temp") val avgTemp: Float?,
    @SerializedName("min_temp") val minTemp: Float?,
    @SerializedName("max_temp") val maxTemp: Float?,
    @SerializedName("avg_humidity") val avgHumidity: Float?,
    @SerializedName("min_humidity") val minHumidity: Float?,
    @SerializedName("max_humidity") val maxHumidity: Float?,
    @SerializedName("avg_gas") val avgGas: Float?,
    @SerializedName("min_gas") val minGas: Float?,
    @SerializedName("max_gas") val maxGas: Float?
)

// DTO для Налаштувань логіки (композитний)
data class LogicSettingsDto(
    @SerializedName("weights") val weights: LogicWeightsDto,
    @SerializedName("thresholds") val thresholds: LogicThresholdsDto
)

data class LogicWeightsDto(
    @SerializedName("temperature") val temperature: Float,
    @SerializedName("gas") val gas: Float,
    @SerializedName("smoke") val smoke: Float,
    @SerializedName("humidity") val humidity: Float
)

data class LogicThresholdsDto(
    @SerializedName("fire_temp") val fireTemp: Float,
    @SerializedName("gas_leak_ppm") val gasLeakPpm: Float,
    @SerializedName("overheating_temp") val overheatingTemp: Float
)

// DTO для Запитів (Requests)
data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class RegisterRequest(
    @SerializedName("name") val name: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

// DTO для Відповіді на логін
data class LoginResponse(
    @SerializedName("token") val token: String,
    @SerializedName("user") val user: UserDto
)