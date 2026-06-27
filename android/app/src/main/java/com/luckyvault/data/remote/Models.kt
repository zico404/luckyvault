package com.luckyvault.data.remote

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String,
    @SerializedName("data") val data: T
)

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class RegisterRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("displayName") val displayName: String? = null,
    @SerializedName("phone") val phone: String? = null
)

data class AuthResponse(
    @SerializedName("user") val user: UserDto,
    @SerializedName("accessToken") val accessToken: String,
    @SerializedName("refreshToken") val refreshToken: String
)

data class RefreshTokenRequest(
    @SerializedName("refreshToken") val refreshToken: String
)

data class UserDto(
    @SerializedName("id") val id: String,
    @SerializedName("email") val email: String,
    @SerializedName("displayName") val displayName: String?,
    @SerializedName("role") val role: String
)

data class WalletDto(
    @SerializedName("balance") val balance: Double,
    @SerializedName("currency") val currency: String
)

data class TransactionDto(
    @SerializedName("id") val id: String,
    @SerializedName("type") val type: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("balanceAfter") val balanceAfter: Double,
    @SerializedName("status") val status: String,
    @SerializedName("description") val description: String?,
    @SerializedName("createdAt") val createdAt: String
)

data class TransactionsResponse(
    @SerializedName("transactions") val transactions: List<TransactionDto>,
    @SerializedName("total") val total: Int,
    @SerializedName("page") val page: Int,
    @SerializedName("totalPages") val totalPages: Int
)

data class DrawDto(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String?,
    @SerializedName("ticketPrice") val ticketPrice: Double,
    @SerializedName("maxTickets") val maxTickets: Int,
    @SerializedName("soldTickets") val soldTickets: Int,
    @SerializedName("prizePool") val prizePool: Double,
    @SerializedName("winnerCount") val winnerCount: Int,
    @SerializedName("status") val status: String,
    @SerializedName("scheduledAt") val scheduledAt: String,
    @SerializedName("completedAt") val completedAt: String?
)

data class TicketDto(
    @SerializedName("id") val id: String,
    @SerializedName("ticketCode") val ticketCode: String,
    @SerializedName("drawId") val drawId: String,
    @SerializedName("status") val status: String,
    @SerializedName("qrCodeUrl") val qrCodeUrl: String?,
    @SerializedName("purchasePrice") val purchasePrice: Double,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("draw") val draw: DrawSummary?
)

data class DrawSummary(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("status") val status: String,
    @SerializedName("scheduledAt") val scheduledAt: String
)

data class TicketsResponse(
    @SerializedName("tickets") val tickets: List<TicketDto>,
    @SerializedName("total") val total: Int,
    @SerializedName("page") val page: Int,
    @SerializedName("totalPages") val totalPages: Int
)

data class DrawResultDto(
    @SerializedName("drawId") val drawId: String,
    @SerializedName("winners") val winners: List<WinnerDto>,
    @SerializedName("resultHash") val resultHash: String?,
    @SerializedName("resultSalt") val resultSalt: String?
)

data class DrawsResponse(
    @SerializedName("draws") val draws: List<DrawDto>,
    @SerializedName("total") val total: Int,
    @SerializedName("page") val page: Int,
    @SerializedName("totalPages") val totalPages: Int
)

data class WinnerDto(
    @SerializedName("ticketId") val ticketId: String,
    @SerializedName("ticketCode") val ticketCode: String = "",
    @SerializedName("userId") val userId: String,
    @SerializedName("prize") val prize: Double,
    @SerializedName("rank") val rank: Int
)

data class NotificationDto(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("body") val body: String,
    @SerializedName("type") val type: String,
    @SerializedName("isRead") val isRead: Boolean,
    @SerializedName("createdAt") val createdAt: String
)

data class NotificationsResponse(
    @SerializedName("notifications") val notifications: List<NotificationDto>,
    @SerializedName("total") val total: Int
)

data class UnreadCountResponse(
    @SerializedName("count") val count: Int
)

data class PurchaseTicketRequest(
    @SerializedName("drawId") val drawId: String
)

data class TopUpRequest(
    @SerializedName("amount") val amount: Double,
    @SerializedName("paymentMethod") val paymentMethod: String
)

data class TopUpResponse(
    @SerializedName("transaction") val transaction: TransactionDto
)
