import "./SettingsScreen.css"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getAuth, signOut } from "firebase/auth"

import { User } from "../../../data/repositories/UserRepository"
import UserRepository from '../../../data/repositories/UserRepository';

import { useCssVars, Theme, Density } from '../../../components/Vars';


const SettingsScreen = () => {

	const [user, setUser] = useState<User>()
	const { theme, setTheme, density, setDensity } = useCssVars();

	useEffect(() => {
		const user = new UserRepository()
		user.getUserData().then((user) => {
			setUser(user)
		});
	}, []);

	useEffect(() => {
		localStorage.setItem('theme', theme)
		localStorage.setItem('density', density)
	}, [theme, density]);

	return <div className="SettingsScreen">
		<h2>Settings Screen</h2>
		<h3>Data</h3>
		<ul>
			<li><Link to={'/categories'}>Categorias</Link></li>
			<li><Link to={'/accounts'}>Contas</Link></li>
			<li><Link to={'/creditcards'}>Cartões</Link></li>
		</ul>
		<h3>Database Usage</h3>
		{user?.dbUse ? (
			<div className="db-usage">
				<div>
					Remote &rarr; Reads: {user.dbUse.remote.docReads}, Writes: {user.dbUse.remote.writes}, QueryReads: {user.dbUse.remote.queryReads}
				</div>
				<div>
					Cache &rarr; Reads: {user.dbUse.cache.docReads}, Writes: {user.dbUse.cache.writes}, QueryReads: {user.dbUse.cache.queryReads}
				</div>
				<div>
					Local &rarr; Reads: {user.dbUse.local.docReads}, Writes: {user.dbUse.local.writes}, QueryReads: {user.dbUse.local.queryReads}
				</div>
			</div>
		) : (
			<div>Loading database usage...</div>
		)}

		<div className="ThemeSettings">
			<div>
			<h3>Theme</h3>
			<select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
				<option value="theme-light">Light</option>
				<option value="theme-dark">Dark</option>
			</select>
			</div>

			<div>
			<h3>Density</h3>
			<select value={density} onChange={(e) => setDensity(e.target.value as Density)}>
				<option value="density-1">Density 1</option>
				<option value="density-2">Density 2</option>
				<option value="density-3">Density 3</option>
				<option value="density-4">Density 4</option>
			</select>
			</div>
		</div>

		<h3>Auth</h3>
		<a onClick={() => signOut(getAuth())}>Encerrar Sessão / Deslogar</a>
	</div>
}

export default SettingsScreen