import './DashboardScreen.css'
import { useState } from "react"
import { getAuth, signOut } from 'firebase/auth'

const DashboardScreen = () => {

    const user = getAuth().currentUser

    return <div className="Screen">
        <p>Olá, {user?.displayName} - {user?.email}</p>
        <a className='long-button' onClick={() => signOut(getAuth())}>Sair</a>
    </div>
}

export default DashboardScreen