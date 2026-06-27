package com.luckyvault.data.repository

import com.luckyvault.data.remote.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotificationRepository @Inject constructor(
    private val api: ApiService
) {
    suspend fun getNotifications(page: Int = 1, limit: Int = 20): Result<NotificationsResponse> {
        return try {
            val response = api.getNotifications(page, limit)
            if (response.isSuccessful) {
                response.body()?.data?.let { Result.success(it) }
                    ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get notifications"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getUnreadCount(): Result<Int> {
        return try {
            val response = api.getUnreadCount()
            if (response.isSuccessful) {
                response.body()?.data?.let { Result.success(it.count) }
                    ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get count"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun markAsRead(id: String): Result<Unit> {
        return try {
            val response = api.markNotificationRead(id)
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception(response.body()?.message ?: "Failed"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun markAllAsRead(): Result<Unit> {
        return try {
            val response = api.markAllNotificationsRead()
            if (response.isSuccessful) Result.success(Unit)
            else Result.failure(Exception(response.body()?.message ?: "Failed"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
