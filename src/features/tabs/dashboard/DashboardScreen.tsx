import './DashboardScreen.css'

import { useNavigate } from 'react-router-dom'
import { getAuth } from 'firebase/auth'

import Card from '../../../components/visual/Card'
import AccountsCard from '../../accounts/AccountsCard'
import CreditCardsCard from '../../accounts/CreaditCardsCard'
import { Container, ContainerFixedContent, ContainerScrollContent } from '../../../components/conteiners'

const DashboardScreen = () => {

  const user = getAuth().currentUser

  return <Container screen spaced>
    <ContainerFixedContent>
      <p>Olá, {user?.displayName} - {user?.email}</p>
      <p><br /></p>
    </ContainerFixedContent>
    <ContainerScrollContent>
      <AccountsCard />
      <CreditCardsCard />
      <a href="#">Other things!</a>
      <Card>
        <div className="centerInfo">Ideas are welcome!</div>
      </Card>
    </ContainerScrollContent>
  </Container>
}

export default DashboardScreen