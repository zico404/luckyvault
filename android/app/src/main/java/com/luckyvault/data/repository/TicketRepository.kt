package com.luckyvault.data.repository

import com.luckyvault.data.remote.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TicketRepository @Inject constructor(
    private val api: ApiService
) {
    suspend fun purchaseTicket(drawId: String): Result<TicketDto> {
        return try {
            val response = api.purchaseTicket(PurchaseTicketRequest(drawId))
            if (response.isSuccessful) {
                response.body()?.data?.let { Result.success(it) }
                    ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to purchase ticket"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMyTickets(page: Int = 1, limit: Int = 20): Result<TicketsResponse> {
        return try {
            val response = api.getMyTickets(page, limit)
            if (response.isSuccessful) {
                response.body()?.data?.let { Result.success(it) }
                    ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get tickets"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTicket(id: String): Result<TicketDto> {
        return try {
            val response = api.getTicket(id)
            if (response.isSuccessful) {
                response.body()?.data?.let { Result.success(it) }
                    ?: Result.failure(Exception("Empty response"))
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to get ticket"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
