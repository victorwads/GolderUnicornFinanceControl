import './DashboardScreen.css'

import Card from '@componentsDeprecated/visual/Card'
import AccountsCard from '../../accounts/AccountsCard'
import CreditCardsCard from '../../accounts/CreditCardsCard'
import { Container, ContainerFixedContent, ContainerScrollContent } from '@componentsDeprecated/conteiners'
import { getCurrentUser } from '@configs'

const DashboardScreen = () => {

  const user = getCurrentUser()

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
