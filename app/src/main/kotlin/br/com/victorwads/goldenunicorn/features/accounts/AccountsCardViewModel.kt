package br.com.victorwads.goldenunicorn.features.accounts

import br.com.victorwads.goldenunicorn.data.models.Account
import br.com.victorwads.goldenunicorn.data.repositories.AccountsRepository
import br.com.victorwads.goldenunicorn.data.repositories.BanksRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

class AccountsCardViewModel(
    banksRepository: BanksRepository = BanksRepository(),
    accountsRepository: AccountsRepository = AccountsRepository()
) {

    private val _accounts = MutableStateFlow<List<Account>>(emptyList())
    val accounts = _accounts.asStateFlow()

    // get from firebase
}
