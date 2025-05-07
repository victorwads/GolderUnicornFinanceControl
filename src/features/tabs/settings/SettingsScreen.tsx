import "./SettingsScreen.css"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { getAuth, signOut } from "firebase/auth"
import { User } from "../../../data/repositories/UserRepository"
import UserRepository from '../../../data/repositories/UserRepository';

const SettingsScreen = () => {

	const [user, setUser] = useState<User>()

	useEffect(() => {
		const user = new UserRepository()
		user.getUserData().then((user) => {
			setUser(user)
		});
	}, []);

	return <div>
		<h2>Settings Screen</h2>
		<ul>
			<li><Link to={'/categories'}>Categorias</Link></li>
			<li><Link to={'/accounts'}>Contas</Link></li>
			<li><Link to={'/creditcards'}>Cartões</Link></li>
		</ul>
		<h3>Database Usage</h3>
		<pre>{JSON.stringify(user?.dbUse || null, null, 2)}</pre>
		<a className="long-button" onClick={() => signOut(getAuth())}>Sair</a>
	</div>
}

export default SettingsScreen