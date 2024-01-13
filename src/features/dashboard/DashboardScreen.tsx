import './DashboardScreen.css'

import { useState } from "react"
import { useNavigate, Link } from 'react-router-dom'
import { getAuth, signOut } from 'firebase/auth'

import Card from '../components/Card'
import Bank from '../../data/models/Bank'
import BankInfo from '../banks/BankInfo'

const DashboardScreen = () => {

    const user = getAuth().currentUser
    const ok = useNavigate()

    return <div className="Screen">
        <p>Olá, {user?.displayName} - {user?.email}</p>
        <p><br /><br /></p>
        <Link to={'/accounts'}>Contas</Link>
        <Card>
            <BankInfo bank={new Bank('', 'Teste Bank','','nubank.png')} />
            <BankInfo bank={new Bank('', 'Teste Bank','','iti-1.png')} divider={false} />
            <div style={{textAlign: 'right'}}>
                <Link to={'/accounts/create'}>Adicionar Conta</Link>
            </div>
        </Card>
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