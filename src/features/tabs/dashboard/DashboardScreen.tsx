import './DashboardScreen.css'

import { useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth'

import Card from '../../components/visual/Card'
import AccountsCard from '../../accounts/AccountsCard'
import CreditCardsCard from '../../accounts/CreaditCardsCard'

const DashboardScreen = () => {

    const user = getAuth().currentUser
    const navigate = useNavigate()

    return <div className="Screen">
        <p>Olá, {user?.displayName} - {user?.email}</p>
        <p><br /><br /></p>
        <AccountsCard />
        <CreditCardsCard />
        Outras coisas
        <Card>
            ToDo Ideias
        </Card>
    </div>
}

export default DashboardScreen