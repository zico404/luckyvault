package com.luckyvault.ui.screens.tickets

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.luckyvault.data.remote.TicketDto
import com.luckyvault.data.repository.TicketRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MyTicketsUiState(
    val isLoading: Boolean = true,
    val tickets: List<TicketDto> = emptyList(),
    val page: Int = 1,
    val totalPages: Int = 1,
    val error: String? = null
)

@HiltViewModel
class MyTicketsViewModel @Inject constructor(
    private val ticketRepository: TicketRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(MyTicketsUiState())
    val uiState: StateFlow<MyTicketsUiState> = _uiState.asStateFlow()

    init { loadTickets() }

    fun loadTickets(page: Int = 1) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = page == 1)
            val result = ticketRepository.getMyTickets(page)
            result.fold(
                onSuccess = { data ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        tickets = if (page == 1) data.tickets else _uiState.value.tickets + data.tickets,
                        page = page,
                        totalPages = data.totalPages
                    )
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
                }
            )
        }
    }

    fun loadMore() {
        if (_uiState.value.page < _uiState.value.totalPages) {
            loadTickets(_uiState.value.page + 1)
        }
    }
}
