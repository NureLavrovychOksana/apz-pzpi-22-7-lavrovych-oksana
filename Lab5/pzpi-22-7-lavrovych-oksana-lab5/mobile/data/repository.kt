package com.example.safezonetracker.data.repository

import com.example.safezonetracker.data.local.UserPreferences
import com.example.safezonetracker.data.model.*
import com.example.safezonetracker.data.remote.SafeZoneApi
import com.example.safezonetracker.data.remote.models.*
import com.google.firebase.Firebase
import com.google.firebase.messaging.messaging
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import retrofit2.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AppRepository @Inject constructor(
    private val api: SafeZoneApi,
    private val userPrefs: UserPreferences
) {

    val notificationPreferences: Flow<NotificationPreferences> = userPrefs.notificationPreferences

    /**
     * Зберігає налаштування сповіщень ТІЛЬКИ локально.
     */
    suspend fun saveNotificationPreferences(prefs: NotificationPreferences) {
        userPrefs.saveNotificationPreferences(prefs)
    }
    // =====  ПОВЕРТАЄМО ПУБЛІЧНИЙ ПОТІК ДЛЯ ТОКЕНА =====
    /**
     * Потік, що надає поточний токен автентифікації.
     * ViewModel'и можуть підписатися на нього для відстеження стану входу.
     * Null, якщо користувач не залогінений.
     */
    val authToken: Flow<String?> = userPrefs.authToken

    // --- 1. АВТЕНТИФІКАЦІЯ ТА ПРОФІЛЬ ---

    suspend fun login(email: String, pass: String): User {
        val request = LoginRequest(email = email, password = pass)
        val response = api.login(request)
        val loginResponse = handleApiResponse(response)

        userPrefs.saveAuthToken(loginResponse.token)
        userPrefs.saveUserId(loginResponse.user.id)

        registerFcmTokenOnLogin()

        return mapUserDtoToUser(loginResponse.user)
    }

    suspend fun register(name: String, email: String, pass: String): User {
        val request = RegisterRequest(name = name, email = email, password = pass)
        val response = api.register(request)
        val userDto = handleApiResponse(response)
        return mapUserDtoToUser(userDto)
    }

    suspend fun logout() {
        userPrefs.clearAuthToken()
        userPrefs.clearUserId()
    }

    suspend fun getMyProfile(): User {
        val token = getAuthHeader()
        val userId = userPrefs.userId.first() ?: throw Exception("User ID not found in local storage.")
        val response = api.getMyProfile(token, userId)
        val userDto = handleApiResponse(response)
        return mapUserDtoToUser(userDto)
    }

    // --- 2. РОБОТА З ЗАГРОЗАМИ (THREATS) ---

    suspend fun getCurrentThreats(): List<Threat> {
        val response = api.getCurrentThreats(getAuthHeader())
        return handleApiResponse(response).map { mapThreatDtoToThreat(it) }
    }

    suspend fun getAllThreats(): List<Threat> {
        val response = api.getAllThreats(getAuthHeader())
        return handleApiResponse(response).map { mapThreatDtoToThreat(it) }
    }

    suspend fun getThreatById(threatId: Int): Threat {
        val response = api.getThreatById(getAuthHeader(), threatId)
        return mapThreatDtoToThreat(handleApiResponse(response))
    }

    // --- 4. АДМІНІСТРУВАННЯ ---

    suspend fun getLogicSettings(): LogicSettings {
        val response = api.getLogicSettings(getAuthHeader())
        return mapLogicSettingsDtoToModel(handleApiResponse(response))
    }

    suspend fun updateLogicSettings(settings: LogicSettings): LogicSettings {
        val dto = mapLogicSettingsToDto(settings)
        val response = api.updateLogicSettings(getAuthHeader(), dto)
        return mapLogicSettingsDtoToModel(handleApiResponse(response))
    }

    // --- ПРИВАТНІ ДОПОМІЖНІ ФУНКЦІЇ ---

    private suspend fun getAuthHeader(): String {
        val token = authToken.first() ?: throw Exception("User is not authenticated.")
        return "Bearer $token"
    }

    private fun <T> handleApiResponse(response: Response<T>): T {
        if (response.isSuccessful) {
            return response.body() ?: throw Exception("API response body is null")
        } else {
            val errorBody = response.errorBody()?.string()
            throw Exception("API Error ${response.code()}: ${errorBody ?: response.message()}")
        }
    }

    private fun registerFcmTokenOnLogin() {
        Firebase.messaging.token.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val fcmToken = task.result
                CoroutineScope(Dispatchers.IO).launch {
                    try {
                        val requestBody = mapOf("deviceToken" to fcmToken)
                        api.registerDeviceToken(getAuthHeader(), requestBody)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }
    }

    // --- ФУНКЦІЇ-МАППЕРИ ---

    private fun mapUserDtoToUser(dto: UserDto) = User(id = dto.id, name = dto.name, email = dto.email, role = dto.role, status = dto.status)
    private fun mapThreatDtoToThreat(dto: ThreatDto) = Threat(id = dto.id, threatType = dto.threatType, description = dto.description, severityLevel = dto.severityLevel, recommendedAction = dto.recommendedAction, createdAt = dto.createdAt, locationId = dto.locationId)
    private fun mapStatisticsDtoToModel(dto: StatisticsDto) = Statistics(frequencyByType = dto.frequencyByType.map { ThreatFrequency(it.threatType, it.frequency) }, severityDistribution = dto.severityDistribution.map { SeverityDistribution(it.severityLevel, it.count) }, physicalParams = mapPhysicalParamsDtoToModel(dto.physicalParams))
    private fun mapPhysicalParamsDtoToModel(dto: PhysicalParamsDto) = PhysicalParams(avgTemp = dto.avgTemp, minTemp = dto.minTemp, maxTemp = dto.maxTemp, avgHumidity = dto.avgHumidity, minHumidity = dto.minHumidity, maxHumidity = dto.maxHumidity, avgGas = dto.avgGas, minGas = dto.minGas, maxGas = dto.maxGas)
    private fun mapLogicSettingsDtoToModel(dto: LogicSettingsDto) = LogicSettings(weights = Weights(dto.weights.temperature, dto.weights.gas, dto.weights.smoke, dto.weights.humidity), thresholds = Thresholds(dto.thresholds.fireTemp, dto.thresholds.gasLeakPpm, dto.thresholds.overheatingTemp))
    private fun mapLogicSettingsToDto(model: LogicSettings) = LogicSettingsDto(weights = LogicWeightsDto(model.weights.temperature, model.weights.gas, model.weights.smoke, model.weights.humidity), thresholds = LogicThresholdsDto(model.thresholds.fireTemp, model.thresholds.gasLeakPpm, model.thresholds.overheatingTemp))
}