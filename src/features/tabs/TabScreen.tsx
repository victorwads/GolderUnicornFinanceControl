import './TabScreen.css'
import { Link, Outlet } from 'react-router-dom'

import { Container, ContainerFixedContent, ContainerScrollContent } from '../../components/conteiners'

const TabScreen = () => {
    return <Container wide>
        <ContainerScrollContent>
            <Outlet />
        </ContainerScrollContent>
        <ContainerFixedContent>
            <div className='TabViewNav'>
                <Link to="dashboard">{Lang.dashboard.title}</Link>
                <Link to="timeline">{Lang.timeline.title}</Link>
                <Link to="settings">{Lang.settings.title}</Link>
            </div>
        </ContainerFixedContent>
    </Container>
}

export default TabScreen
