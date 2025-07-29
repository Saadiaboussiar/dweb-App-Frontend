import { Link } from 'react-router-dom'
import caret from '../../assets/icons/caret-droite.png'
import './navbar.css'
import logo from '../../assets/dwebLogoB.png'
import { useState } from 'react'


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className='navbar-container'>
  <div className='nav-left'>
    <img src={logo} alt='logo' />
    <div className='inter-form'>
      <Link className='link' to='/formIntervention'>Formulaire d'intervention</Link>
    </div>
  </div>

  <div className='nav-toggle' onClick={() => setMenuOpen(!menuOpen)}>
    <div className='hamburger'></div>
    <div className='hamburger'></div>
    <div className='hamburger'></div>
  </div>

  <div className={`nav-right ${menuOpen ? 'open' : ''}`}>
    <div className='point-c'>
    <Link className='point-link' to='/points'>VOTRE POINTS</Link>
    </div>
    <Link className='notif-link' to='/notifications'>NOTIFICATIONS</Link>
    <div className='nav-profile'>
      <Link className='profile_link' to='/techprofile'>PROFILE</Link>
      <div className='caret-div'>
        <img src={caret} alt='caret' className='caret' />
        <div className='dropdown'>
          <Link className='drop-link' to='/SignIn'>Se déconnecter de l'application</Link>
        </div>
      </div>
    </div>
  </div>
</div>

  )
}

export default Navbar