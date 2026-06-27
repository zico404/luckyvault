package com.luckyvault.di

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import com.luckyvault.BuildConfig
import com.luckyvault.data.remote.ApiService
import okhttp3.Authenticator
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "lucky_vault_prefs")

object PrefsKeys {
    val ACCESS_TOKEN = stringPreferencesKey("access_token")
    val REFRESH_TOKEN = stringPreferencesKey("refresh_token")
    val USER_EMAIL = stringPreferencesKey("user_email")
    val USER_ID = stringPreferencesKey("user_id")
    val USER_ROLE = stringPreferencesKey("user_role")
    val DISPLAY_NAME = stringPreferencesKey("display_name")
}

private suspend fun getTokenSync(dataStore: DataStore<Preferences>, key: androidx.datastore.preferences.core.Preferences.Key<String>): String {
    return dataStore.data.map { it[key] ?: "" }.first()
}

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideDataStore(@ApplicationContext context: Context): DataStore<Preferences> = context.dataStore

    @Provides
    @Singleton
    fun provideAuthInterceptor(dataStore: DataStore<Preferences>): Interceptor {
        return Interceptor { chain ->
            val token = runBlocking {
                getTokenSync(dataStore, PrefsKeys.ACCESS_TOKEN)
            }
            val request = if (token.isNotEmpty()) {
                chain.request().newBuilder()
                    .addHeader("Authorization", "Bearer $token")
                    .build()
            } else {
                chain.request()
            }
            chain.proceed(request)
        }
    }

    @Provides
    @Singleton
    fun provideRefreshAuthenticator(dataStore: DataStore<Preferences>): Authenticator {
        return Authenticator { route, response ->
            val refreshToken = runBlocking { getTokenSync(dataStore, PrefsKeys.REFRESH_TOKEN) }
            if (refreshToken.isEmpty()) return@Authenticator null

            val refreshResult = runCatching {
                val refreshCall = okhttp3.Request.Builder()
                    .url("${BuildConfig.API_BASE_URL}auth/refresh")
                    .post(okhttp3.RequestBody.create(null, """{"refreshToken":"$refreshToken"}"""))
                    .build()

                val refreshResponse = route.let {
                    val client = okhttp3.OkHttpClient.Builder()
                        .connectTimeout(10, java.util.concurrent.TimeUnit.SECONDS)
                        .readTimeout(10, java.util.concurrent.TimeUnit.SECONDS)
                        .build()
                    client.newCall(refreshCall).execute()
                }

                if (refreshResponse.isSuccessful) {
                    val bodyString = refreshResponse.body?.string()
                    val gson = com.google.gson.Gson()
                    val authResponse = gson.fromJson(bodyString, com.luckyvault.data.remote.ApiResponse::class.java)
                    val authData = gson.toJsonTree(authResponse.data).asJsonObject
                    val newAccessToken = authData.get("accessToken")?.asString ?: return@Authenticator null
                    val newRefreshToken = authData.get("refreshToken")?.asString ?: return@Authenticator null

                    runBlocking {
                        dataStore.edit { prefs ->
                            prefs[PrefsKeys.ACCESS_TOKEN] = newAccessToken
                            prefs[PrefsKeys.REFRESH_TOKEN] = newRefreshToken
                        }
                    }

                    response.request.newBuilder()
                        .header("Authorization", "Bearer $newAccessToken")
                        .build()
                } else null
            }.getOrNull()

            refreshResult
        }
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(authInterceptor: Interceptor, refreshAuthenticator: Authenticator): OkHttpClient {
        val builder = OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .authenticator(refreshAuthenticator)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)

        if (BuildConfig.IS_DEBUG) {
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.HEADERS
            }
            builder.addInterceptor(loggingInterceptor)
        }

        return builder.build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}
