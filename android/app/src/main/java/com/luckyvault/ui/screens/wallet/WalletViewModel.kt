package com.luckyvault.ui.screens.wallet

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.luckyvault.data.remote.TransactionDto
import com.luckyvault.data.remote.WalletDto
import com.luckyvault.data.repository.WalletRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class WalletUiState(
    val isLoading: Boolean = true,
    val wallet: WalletDto? = null,
    val transactions: List<TransactionDto> = emptyList(),
    val page: Int = 1,
    val totalPages: Int = 1,
    val error: String? = null
)

@HiltViewModel
class WalletViewModel @Inject constructor(
    private val walletRepository: WalletRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(WalletUiState())
    val uiState: StateFlow<WalletUiState> = _uiState.asStateFlow()

    init { loadData() }

    fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val balanceResult = walletRepository.getBalance()
            val txResult = walletRepository.getTransactions(1)
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                wallet = balanceResult.getOrNull(),
                transactions = txResult.getOrNull()?.transactions ?: emptyList(),
                page = 1,
                totalPages = txResult.getOrNull()?.totalPages ?: 1,
                error = if (balanceResult.isFailure || txResult.isFailure) {
                    listOfNotNull(
                        balanceResult.exceptionOrNull()?.message,
                        txResult.exceptionOrNull()?.message
                    ).joinToString("\n")
                } else null
            )
        }
    }

    fun topUp(amount: Double) {
        viewModelScope.launch {
            val currentBalance = _uiState.value.wallet?.balance ?: 0.0
            _uiState.value = _uiState.value.copy(
                wallet = WalletDto(balance = currentBalance + amount, currency = "USD")
            )
            // In a real app, this would call a deposit API endpoint
        }
    }

    fun loadMore() {
        if (_uiState.value.page < _uiState.value.totalPages) {
            viewModelScope.launch {
                val nextPage = _uiState.value.page + 1
                val result = walletRepository.getTransactions(nextPage)
                result.onSuccess { data ->
                    _uiState.value = _uiState.value.copy(
                        transactions = _uiState.value.transactions + data.transactions,
                        page = nextPage
                    )
                }
            }
        }
    }
}
