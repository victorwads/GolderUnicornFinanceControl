import './DashboardScreen.css'

import { useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth'

import Card from '../../../components/visual/Card'
import AccountsCard from '../../accounts/AccountsCard'
import CreditCardsCard from '../../accounts/CreaditCardsCard'
import { Container, ContainerScrollContent } from '../../../components/conteiners'

const DashboardScreen = () => {

  const user = getAuth().currentUser

  return <Container screen spaced>
    <ContainerScrollContent>
      <p>Olá, {user?.displayName} - {user?.email}</p>
      <p><br /><br /></p>
      <AccountsCard />
      <CreditCardsCard />
      Outras coisas
      <Card>
        ToDo Ideias
      </Card>
    </ContainerScrollContent>
  </Container>
}

export default DashboardScreen