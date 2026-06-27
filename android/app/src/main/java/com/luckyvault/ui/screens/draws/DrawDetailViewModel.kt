package com.luckyvault.ui.screens.draws

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.luckyvault.data.remote.DrawDto
import com.luckyvault.data.remote.WinnerDto
import com.luckyvault.data.repository.DrawRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DrawDetailUiState(
    val isLoading: Boolean = true,
    val draw: DrawDto? = null,
    val winners: List<WinnerDto> = emptyList(),
    val error: String? = null
)

@HiltViewModel
class DrawDetailViewModel @Inject constructor(
    private val drawRepository: DrawRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(DrawDetailUiState())
    val uiState: StateFlow<DrawDetailUiState> = _uiState.asStateFlow()

    fun loadDraw(drawId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val result = drawRepository.getDraw(drawId)
            result.fold(
                onSuccess = { draw ->
                    val winners = mutableListOf<WinnerDto>()
                    // Extract winners from draw data if available
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        draw = draw,
                        winners = winners
                    )
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = e.message
                    )
                }
            )
        }
    }
}
