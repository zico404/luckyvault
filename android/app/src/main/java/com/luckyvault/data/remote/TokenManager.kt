package com.luckyvault.data.remote

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import androidx.datastore.preferences.core.edit
import com.luckyvault.di.PrefsKeys
import com.luckyvault.di.dataStore
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val dataStore = context.dataStore

    suspend fun saveTokens(accessToken: String, refreshToken: String) {
        dataStore.edit { prefs ->
            prefs[PrefsKeys.ACCESS_TOKEN] = accessToken
            prefs[PrefsKeys.REFRESH_TOKEN] = refreshToken
        }
    }

    suspend fun getAccessToken(): String {
        return dataStore.data.map { it[PrefsKeys.ACCESS_TOKEN] ?: "" }.first()
    }

    suspend fun getRefreshToken(): String {
        return dataStore.data.map { it[PrefsKeys.REFRESH_TOKEN] ?: "" }.first()
    }

    suspend fun saveUserInfo(id: String, email: String, role: String, displayName: String?) {
        dataStore.edit { prefs ->
            prefs[PrefsKeys.USER_ID] = id
            prefs[PrefsKeys.USER_EMAIL] = email
            prefs[PrefsKeys.USER_ROLE] = role
            if (displayName != null) prefs[PrefsKeys.DISPLAY_NAME] = displayName
        }
    }

    suspend fun getUserId(): String = dataStore.data.map { it[PrefsKeys.USER_ID] ?: "" }.first()
    suspend fun getUserEmail(): String = dataStore.data.map { it[PrefsKeys.USER_EMAIL] ?: "" }.first()
    suspend fun getUserRole(): String = dataStore.data.map { it[PrefsKeys.USER_ROLE] ?: "USER" }.first()
    suspend fun getDisplayName(): String = dataStore.data.map { it[PrefsKeys.DISPLAY_NAME] ?: "" }.first()

    suspend fun isLoggedIn(): Boolean = getAccessToken().isNotEmpty()

    suspend fun clearTokens() {
        dataStore.edit { it.clear() }
    }
}
