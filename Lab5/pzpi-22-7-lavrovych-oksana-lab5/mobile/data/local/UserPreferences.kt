package com.example.safezonetracker.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.example.safezonetracker.data.model.NotificationPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

@Singleton
class UserPreferences @Inject constructor(@ApplicationContext context: Context) {

    private val dataStore = context.dataStore

    companion object {
        val AUTH_TOKEN_KEY = stringPreferencesKey("auth_token")
        val USER_ID_KEY = intPreferencesKey("user_id")

        val FIRE_ALERTS_KEY = booleanPreferencesKey("fire_alerts")
        val GAS_ALERTS_KEY = booleanPreferencesKey("gas_alerts")
        val OVERHEAT_ALERTS_KEY = booleanPreferencesKey("overheat_alerts")
    }
    -
    val authToken: Flow<String?> = dataStore.data.map { preferences ->
        preferences[AUTH_TOKEN_KEY]
    }

    val userId: Flow<Int?> = dataStore.data.map { preferences ->
        preferences[USER_ID_KEY]
    }

    val notificationPreferences: Flow<NotificationPreferences> = dataStore.data.map { prefs ->
        NotificationPreferences(
            receiveFireAlerts = prefs[FIRE_ALERTS_KEY] ?: true, // true за замовчуванням
            receiveGasAlerts = prefs[GAS_ALERTS_KEY] ?: true,    // true за замовчуванням
            receiveOverheatAlerts = prefs[OVERHEAT_ALERTS_KEY] ?: true // true за замовчуванням
        )
    }

-
    suspend fun saveAuthToken(token: String) {
        dataStore.edit { preferences -> preferences[AUTH_TOKEN_KEY] = token }
    }

    suspend fun saveUserId(id: Int) {
        dataStore.edit { preferences -> preferences[USER_ID_KEY] = id }
    }


    suspend fun saveNotificationPreferences(preferences: NotificationPreferences) {
        dataStore.edit { prefs ->
            prefs[FIRE_ALERTS_KEY] = preferences.receiveFireAlerts
            prefs[GAS_ALERTS_KEY] = preferences.receiveGasAlerts
            prefs[OVERHEAT_ALERTS_KEY] = preferences.receiveOverheatAlerts
        }
    }

    suspend fun clearAuthToken() {
        dataStore.edit { preferences -> preferences.remove(AUTH_TOKEN_KEY) }
    }

    suspend fun clearUserId() {
        dataStore.edit { preferences -> preferences.remove(USER_ID_KEY) }
    }
}