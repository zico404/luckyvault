package com.luckyvault.data.remote

import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<AuthResponse>>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<AuthResponse>>

    @POST("auth/refresh")
    suspend fun refreshToken(@Body request: RefreshTokenRequest): Response<ApiResponse<AuthResponse>>

    @POST("auth/logout")
    suspend fun logout(@Body request: RefreshTokenRequest): Response<ApiResponse<Unit>>

    @GET("users/me")
    suspend fun getProfile(): Response<ApiResponse<UserDto>>

    @PATCH("users/me")
    suspend fun updateProfile(@Body body: Map<String, String>): Response<ApiResponse<UserDto>>

    @GET("wallet/balance")
    suspend fun getBalance(): Response<ApiResponse<WalletDto>>

    @GET("wallet/transactions")
    suspend fun getTransactions(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<TransactionsResponse>>

    @GET("draws/active")
    suspend fun getActiveDraws(): Response<ApiResponse<List<DrawDto>>>

    @GET("draws/completed")
    suspend fun getCompletedDraws(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<DrawsResponse>>

    @GET("draws/{id}")
    suspend fun getDraw(@Path("id") id: String): Response<ApiResponse<DrawDto>>

    @POST("tickets/purchase")
    suspend fun purchaseTicket(@Body request: PurchaseTicketRequest): Response<ApiResponse<TicketDto>>

    @GET("tickets/my")
    suspend fun getMyTickets(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<TicketsResponse>>

    @GET("tickets/{id}")
    suspend fun getTicket(@Path("id") id: String): Response<ApiResponse<TicketDto>>

    @GET("notifications")
    suspend fun getNotifications(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<ApiResponse<NotificationsResponse>>

    @GET("notifications/unread-count")
    suspend fun getUnreadCount(): Response<ApiResponse<UnreadCountResponse>>

    @PATCH("notifications/{id}/read")
    suspend fun markNotificationRead(@Path("id") id: String): Response<ApiResponse<Unit>>

    @PATCH("notifications/read-all")
    suspend fun markAllNotificationsRead(): Response<ApiResponse<Unit>>

    @POST("wallet/topup")
    suspend fun topUp(@Body request: TopUpRequest): Response<ApiResponse<TopUpResponse>>
}
