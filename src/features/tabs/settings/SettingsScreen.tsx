import "./SettingsScreen.css"

import { Link } from "react-router-dom"
import { getAuth, signOut } from "firebase/auth"

const SettingsScreen = () => {
	return <div>
		<h2>Settings Screen</h2>
		<ul>
			<li><Link to={'/categories'}>Categorias</Link></li>
			<li><Link to={'/accounts'}>Contas</Link></li>
			<li><Link to={'/creditcards'}>Cartões</Link></li>
		</ul>
		<a className="long-button" onClick={() => signOut(getAuth())}>Sair</a>
	</div>
}

export default SettingsScreen