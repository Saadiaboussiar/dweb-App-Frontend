import { Link } from 'react-router-dom'
import caret from '../../assets/icons/caret-droite.png'
import './navbar.css'
import logo from '../../assets/dwebLogoB.png'


const Navbar = () => {
  return (
    <div className='navbar-container'>
    
        <div className='nav-left'>
            <img src={logo} alt='' />
            <div className='inter-form'>
                <Link className='link' to='/formIntervention'>Formulaire d'intervention</Link>

            </div>
        </div>

        <div className='nav-right'>
        
            <Link className='point-link' to="/points">VOTRE POINTS </Link>
            
            <Link className='notif-link' to='/notifications'>NOTIFCATIONS</Link>
            

            <div className='nav-profile'>
                <Link className='profile_link' to='/profile'>PROFILE</Link>
               
                <div className='caret-div'>
                    <img src={caret} alt='' className='caret'/>
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