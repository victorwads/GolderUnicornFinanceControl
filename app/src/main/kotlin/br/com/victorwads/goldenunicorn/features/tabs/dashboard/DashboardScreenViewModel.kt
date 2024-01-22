package br.com.victorwads.goldenunicorn.features.tabs.dashboard

import androidx.lifecycle.ViewModel
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class DashboardScreenViewModel : ViewModel() {

    private val _userName = MutableStateFlow("")
    val userName = _userName.asStateFlow()

    init {
        try {
            _userName.value = FirebaseAuth.getInstance().currentUser.let {
                "${it?.displayName} - ${it?.email}"
            }
        } catch (_: Exception) {
            _userName.value = "No firebase"
        }
    }
}