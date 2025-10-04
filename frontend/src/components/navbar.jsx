import { NavLink } from "react-router-dom"
import '../App.css' // archivo CSS propio para el navbar

export default function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar-nav">
        <ul className="navbar-links">
        <li>
            <NavLink
                to= "/profile"
                className={({ isActive }) => isActive ? 'active-link' : ''}
            >
             Profile
            </NavLink>
        </li>
          <li>
            <NavLink
              to="/map"
              className={({ isActive }) => isActive ? 'active-link' : ''}
            >
              Map
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}

