import './DashboardScreen.css'

import { getAuth } from 'firebase/auth'

import Card from '../../../components/visual/Card'
import AccountsCard from '../../accounts/AccountsCard'
import CreditCardsCard from '../../accounts/CreaditCardsCard'
import { Container, ContainerFixedContent, ContainerScrollContent } from '../../../components/conteiners'

const DashboardScreen = () => {

  const user = getAuth().currentUser

  return <Container screen spaced>
    <ContainerFixedContent>
      <p>{Lang.dashboard.messages.hello}, {user?.displayName} - {user?.email}</p>
      <p><br /></p>
    </ContainerFixedContent>
    <ContainerScrollContent>
      <AccountsCard />
      <CreditCardsCard />
      <a href="#">{Lang.dashboard.messages.otherThings}</a>
      <Card>
        <div className="centerInfo">{Lang.dashboard.messages.ideasWelcome}</div>
      </Card>
    </ContainerScrollContent>
  </Container>
}

export default DashboardScreen
