import './DashboardScreen.css'

import { useState } from "react"
import { useNavigate, Link } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'

import Card from '../../components/visual/Card'
import Bank from '../../../data/models/Bank'
import BankInfo from '../../banks/BankInfo'
import Account from '../../../data/models/Account'
import AccountsCard from '../../accounts/AccountsCard'

const DashboardScreen = () => {

    const user = getAuth().currentUser
    const navigate = useNavigate()

    return <div className="Screen">
        <p>Olá, {user?.displayName} - {user?.email}</p>
        <p><br /><br /></p>
        <AccountsCard />
        <Link to={'/creditcards'}>Cartões</Link>
        <Card>
            <BankInfo bank={new Bank('', 'Teste Bank','','itau.png')} />
            <BankInfo bank={new Bank('', 'Teste Bank','','mercadopago.png')} divider={false} />
            <div style={{textAlign: 'right'}}>
                <Link to={'/creditcards/create'}>Adicionar Cartão</Link>
            </div>
        </Card>
        Outras coisas
        <Card>
            ToDo Ideias
        </Card>
    </div>
}

export default DashboardScreen