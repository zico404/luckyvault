package com.luckyvault.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.luckyvault.data.remote.DrawDto
import com.luckyvault.data.remote.UserDto
import com.luckyvault.data.remote.WalletDto
import com.luckyvault.data.repository.DrawRepository
import com.luckyvault.data.repository.WalletRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = true,
    val wallet: WalletDto? = null,
    val activeDraws: List<DrawDto> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val walletRepository: WalletRepository,
    private val drawRepository: DrawRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val walletResult = walletRepository.getBalance()
            val drawsResult = drawRepository.getActiveDraws()

            val errors = listOfNotNull(
                walletResult.exceptionOrNull()?.message,
                drawsResult.exceptionOrNull()?.message
            ).ifEmpty { null }

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                wallet = walletResult.getOrNull(),
                activeDraws = drawsResult.getOrNull() ?: emptyList(),
                error = errors?.joinToString("\n")
            )
        }
    }
}
