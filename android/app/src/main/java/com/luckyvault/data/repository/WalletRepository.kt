package com.luckyvault.data.repository

import com.luckyvault.data.remote.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WalletRepository @Inject constructor(
    private val api: ApiService
) {
    suspend fun getBalance(): Result<WalletDto> {
        return try {
            val response = api.getBalance()
            if (response.isSuccessful) {
                response.body()?.data?.let { Result.success(it) }
                    ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get balance"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTransactions(page: Int = 1, limit: Int = 20): Result<TransactionsResponse> {
        return try {
            val response = api.getTransactions(page, limit)
            if (response.isSuccessful) {
                response.body()?.data?.let { Result.success(it) }
                    ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get transactions"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
