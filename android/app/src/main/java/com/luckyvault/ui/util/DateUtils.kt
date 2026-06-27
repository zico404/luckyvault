package com.luckyvault.ui.util

fun String.safeDateFormat(pattern: String = "yyyy-MM-dd"): String {
    if (this.length < pattern.length) return this
    return try {
        when (pattern.length) {
            10 -> this.substring(0, 10)
            16 -> this.substring(0, 16).replace("T", " ")
            7 -> this.substring(0, 7)
            else -> this.substring(0, minOf(this.length, pattern.length))
        }
    } catch (e: Exception) {
        this
    }
}

fun String.safeDateShort(): String = safeDateFormat("yyyy-MM-dd")

fun String.safeDateTime(): String = safeDateFormat("yyyy-MM-dd HH:mm")
