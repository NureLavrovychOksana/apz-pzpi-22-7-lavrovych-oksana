package com.example.safezonetracker.data.remote

import com.example.safezonetracker.data.remote.models.*
import retrofit2.Response
import retrofit2.http.*

interface SafeZoneApi {

    // === 1. АВТЕНТИФІКАЦІЯ ТА РЕЄСТРАЦІЯ (PUBLIC) ===
    @POST("users/register")
    suspend fun register(@Body request: RegisterRequest): Response<UserDto>

    @POST("users/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    // === 2. КЕРУВАННЯ ПРОФІЛЕМ КОРИСТУВАЧА (PROTECTED) ===
    @GET("users/{id}")
    suspend fun getMyProfile(
        @Header("Authorization") token: String,
        @Path("id") userId: Int
    ): Response<UserDto>

    @PUT("users/{id}")
    suspend fun updateMyProfile(
        @Header("Authorization") token: String,
        @Path("id") userId: Int,
        @Body profileData: Map<String, String>
    ): Response<UserDto>

    @PUT("users/change-password")
    suspend fun changePassword(
        @Header("Authorization") token: String,
        @Body passwords: Map<String, String>
    ): Response<Map<String, String>>

    @POST("devices/register")
    suspend fun registerDeviceToken(
        @Header("Authorization") token: String,
        @Body deviceToken: Map<String, String>
    ): Response<Unit>

    // === 3. ЗАГРОЗИ (THREATS) ===
    @GET("api/threats")
    suspend fun getAllThreats(@Header("Authorization") token: String): Response<List<ThreatDto>>

    @GET("api/current-threats")
    suspend fun getCurrentThreats(@Header("Authorization") token: String): Response<List<ThreatDto>>

    @GET("api/threats/{id}")
    suspend fun getThreatById(
        @Header("Authorization") token: String,
        @Path("id") threatId: Int
    ): Response<ThreatDto>

    // === 4. IoT ДАНІ ТА СТАТИСТИКА ===
    @GET("api/iot-data/recent")
    suspend fun getRecentIoTData(@Header("Authorization") token: String): Response<List<IoTSensorDataDto>>

    @GET("api/statistics")
    suspend fun getStatistics(
        @Header("Authorization") token: String,
        @Query("period") period: String
    ): Response<StatisticsDto>

    // === 5. АДМІНІСТРУВАННЯ (ADMIN ONLY) ===
    @GET("admin/system-status")
    suspend fun getSystemStatus(@Header("Authorization") token: String): Response<List<SystemStatusDto>>

    @GET("admin/logic-settings")
    suspend fun getLogicSettings(@Header("Authorization") token: String): Response<LogicSettingsDto>

    @PUT("admin/logic-settings")
    suspend fun updateLogicSettings(
        @Header("Authorization") token: String,
        @Body settings: LogicSettingsDto
    ): Response<LogicSettingsDto>

    @GET("admin/audit-logs")
    suspend fun getAuditLogs(@Header("Authorization") token: String): Response<List<AuditLogDto>>

    @GET("users")
    suspend fun getAllUsers(@Header("Authorization") token: String): Response<List<UserDto>>

    @PUT("users/{id}/status")
    suspend fun toggleUserStatus(
        @Header("Authorization") token: String,
        @Path("id") userId: Int
    ): Response<Map<String, String>>
}