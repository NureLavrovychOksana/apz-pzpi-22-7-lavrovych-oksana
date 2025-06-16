package com.example.safezonetracker.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.example.safezonetracker.MainActivity
import com.example.safezonetracker.R
import com.example.safezonetracker.data.remote.SafeZoneApi
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import javax.inject.Inject
import com.example.safezonetracker.data.local.UserPreferences

@AndroidEntryPoint
class PushNotificationService : FirebaseMessagingService() {

    @Inject
    lateinit var api: SafeZoneApi

    @Inject
    lateinit var userPreferences: UserPreferences

    /**
     * Викликається, коли генерується новий токен або оновлюється існуючий.
     */
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("FCM", "New token generated: $token")


        CoroutineScope(Dispatchers.IO).launch {
            val authToken = userPreferences.authToken.firstOrNull()
            if (authToken != null) {
                try {
                    val authHeader = "Bearer $authToken"
                    val requestBody = mapOf("deviceToken" to token)
                    api.registerDeviceToken(authHeader, requestBody)
                    Log.d("FCM", "New token successfully sent to server.")
                } catch (e: Exception) {
                    Log.e("FCM", "Failed to send new token to server", e)
                }
            } else {
                Log.d("FCM", "User is not authenticated, new token will be sent after login.")
            }
        }
    }

    /**
     * Викликається, коли приходить повідомлення.
     */
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val data = remoteMessage.data
        val title = data["title"] ?: "Нова загроза!"
        val body = data["body"] ?: "Виявлено потенційну небезпеку."
        val threatId = data["threatId"] // ID загрози для навігації

        Log.d("FCM", "Message received: title='$title', body='$body', threatId='$threatId'")
        showNotification(title, body, threatId)
    }

    private fun showNotification(title: String, body: String, threatId: String?) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            if (threatId != null) {
                putExtra("threat_id", threatId)
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            System.currentTimeMillis().toInt(), // Використовуємо унікальний requestCode
            intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val channelId = "THREAT_CHANNEL_ID"
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Сповіщення про загрози",
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }
}