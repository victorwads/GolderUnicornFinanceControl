import './TabScreen.css'
import { Link, Outlet } from 'react-router-dom'

import Icon, { Icons } from '@components/Icons'
import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners'

import AssistantAIMicrophone from '@features/assistant/components/AssistantAIMicrophone'

const TabScreen = () => {
    return <Container wide>
        <ContainerScrollContent>
            <Outlet />
        </ContainerScrollContent>
        <ContainerFixedContent>
            <div className='TabViewNav'>
                <Link to="dashboard"><Icon icon={Icons.faHome} /> {Lang.dashboard.title}</Link>
                <Link to="timeline"><Icon icon={Icons.faChartLine} /> {Lang.timeline.title}</Link>
                <div className='AiMicrophoneButtonContainer'>
                    <AssistantAIMicrophone />
                </div>
                <Link to="groceries"><Icon icon={Icons.faShoppingBasket} /> {Lang.groceries.title}</Link>
                <Link to="settings"><Icon icon={Icons.faGear} /> {Lang.settings.title}</Link>
            </div>
        </ContainerFixedContent>
    </Container>
}

export default TabScreen
