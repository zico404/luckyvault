package com.luckyvault.ui.screens.tickets

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.luckyvault.data.remote.TicketDto
import com.luckyvault.data.remote.DrawDto
import com.luckyvault.data.repository.TicketRepository
import com.luckyvault.data.repository.DrawRepository
import com.luckyvault.data.repository.WalletRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class BuyTicketUiState(
    val isLoading: Boolean = true,
    val isPurchasing: Boolean = false,
    val draw: DrawDto? = null,
    val balance: Double = 0.0,
    val purchasedTicket: TicketDto? = null,
    val error: String? = null,
    val success: Boolean = false
)

@HiltViewModel
class BuyTicketViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val drawRepository: DrawRepository,
    private val ticketRepository: TicketRepository,
    private val walletRepository: WalletRepository
) : ViewModel() {

    private val drawId: String = savedStateHandle["drawId"] ?: ""
    private val _uiState = MutableStateFlow(BuyTicketUiState())
    val uiState: StateFlow<BuyTicketUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            val drawResult = drawRepository.getDraw(drawId)
            val balanceResult = walletRepository.getBalance()
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                draw = drawResult.getOrNull(),
                balance = balanceResult.getOrNull()?.balance ?: 0.0,
                error = drawResult.exceptionOrNull()?.message
            )
        }
    }

    fun purchaseTicket() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isPurchasing = true, error = null)
            val result = ticketRepository.purchaseTicket(drawId)
            result.fold(
                onSuccess = { ticket ->
                    _uiState.value = _uiState.value.copy(
                        isPurchasing = false,
                        purchasedTicket = ticket,
                        success = true,
                        balance = _uiState.value.balance - (_uiState.value.draw?.ticketPrice ?: 0.0)
                    )
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(isPurchasing = false, error = e.message)
                }
            )
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
