import './TabScreen.css'
import { Link, Outlet } from 'react-router-dom'

import { Container, ContainerFixedContent, ContainerScrollContent } from '../../components/conteiners'
import Icon from '../../components/Icons'

const TabScreen = () => {
    return <Container wide>
        <ContainerScrollContent>
            <Outlet />
        </ContainerScrollContent>
        <ContainerFixedContent>
            <div className='TabViewNav'>
                <Link to="dashboard"><Icon icon={Icon.all.faHome} /> {Lang.dashboard.title}</Link>
                <Link to="timeline"><Icon icon={Icon.all.faChartLine} /> {Lang.timeline.title}</Link>
                <Link to="groceries"><Icon icon={Icon.all.faShoppingBasket} /> {Lang.groceries.title}</Link>
                <Link to="settings"><Icon icon={Icon.all.faGear} /> {Lang.settings.title}</Link>
            </div>
        </ContainerFixedContent>
    </Container>
}

export default TabScreen
