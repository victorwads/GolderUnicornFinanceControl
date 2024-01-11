import './TabScreen.css'
import { useState } from "react"
import { Link, Outlet, Route, Routes } from 'react-router-dom'

const TabScreen = () => {
    return <div className="TabView">
        <div className='TabViewBox'>
            <Outlet />
        </div>
        <nav className='TabViewNav'>
            <Link to="dashboard">Dashboard</Link>
            <Link to="timeline">Timeline</Link>
            <Link to="settings">Settings</Link>
        </nav>
    </div>
}

export default TabScreen