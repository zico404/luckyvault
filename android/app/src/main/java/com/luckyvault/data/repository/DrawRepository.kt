package com.luckyvault.data.repository

import com.luckyvault.data.remote.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DrawRepository @Inject constructor(
    private val api: ApiService
) {
    suspend fun getActiveDraws(): Result<List<DrawDto>> {
        return try {
            val response = api.getActiveDraws()
            if (response.isSuccessful) {
                response.body()?.data?.let { Result.success(it) }
                    ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get draws"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCompletedDraws(page: Int = 1): Result<DrawsResponse> {
        return try {
            val response = api.getCompletedDraws(page)
            if (response.isSuccessful) {
                response.body()?.data?.let { Result.success(it) }
                    ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get draws"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getDraw(id: String): Result<DrawDto> {
        return try {
            val response = api.getDraw(id)
            if (response.isSuccessful) {
                response.body()?.data?.let { Result.success(it) }
                    ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get draw"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
