package com.luckyvault.data.repository

import com.luckyvault.data.remote.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val api: ApiService,
    private val tokenManager: TokenManager
) {
    suspend fun login(email: String, password: String): Result<UserDto> {
        return try {
            val response = api.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body()?.success == true) {
                val auth = response.body()!!.data
                tokenManager.saveTokens(auth.accessToken, auth.refreshToken)
                tokenManager.saveUserInfo(auth.user.id, auth.user.email, auth.user.role, auth.user.displayName)
                Result.success(auth.user)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Login failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(email: String, password: String, displayName: String?): Result<UserDto> {
        return try {
            val response = api.register(RegisterRequest(email, password, displayName))
            if (response.isSuccessful && response.body()?.success == true) {
                val auth = response.body()!!.data
                tokenManager.saveTokens(auth.accessToken, auth.refreshToken)
                tokenManager.saveUserInfo(auth.user.id, auth.user.email, auth.user.role, auth.user.displayName)
                Result.success(auth.user)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Registration failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout() {
        try {
            val refreshToken = tokenManager.getRefreshToken()
            if (refreshToken.isNotEmpty()) {
                api.logout(RefreshTokenRequest(refreshToken))
            }
        } catch (_: Exception) {}
        tokenManager.clearTokens()
    }

    suspend fun isLoggedIn(): Boolean = tokenManager.isLoggedIn()
}
