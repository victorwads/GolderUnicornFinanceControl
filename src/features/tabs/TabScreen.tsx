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
                <Link to="dashboard">Dashboard</Link>
                <Link to="timeline">Timeline</Link>
                <Link to="settings">Settings</Link>
            </div>
        </ContainerFixedContent>
    </Container>
}

export default TabScreen