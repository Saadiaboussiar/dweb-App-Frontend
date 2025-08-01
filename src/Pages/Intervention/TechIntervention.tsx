import React, { useState } from 'react'
import './intervention.css'
import Navbar from '../../components/Navbar/Navbar'
import profile_icon from '../../assets/icons/profileIcon.png';
import profile from '../../assets/saadia.jpeg'
import bon from '../../assets/bonIntervention.jpeg'

const TechIntervention = () => {
    const [display,setDisplay]=useState(true)

    const handlePhoto=()=>{
        setDisplay(!display);

    }

  return (
    <>
        <div className='intervention-page-container'>
            <Navbar />

            <div className='intervention-container'>
                <h1 > Intervention de Technicien </h1>

                <div className='tech-infos-c'>
                    <h3> Informations de Technicien </h3> {/* i'll make it a card with profile*/}
                    
                    <div className='tech-infos'>
                        <div className='tech-profile'>
                        <img src={profile} className='tech-profile' />
                        </div>
                        <div className='tech-infos-card'>
                            <div className='tech-name'> <h5>Saadia Boussiar</h5></div>
                            
                            <h6>1234</h6>
                            <h6>boussiarsaadia@gmail.com</h6>
                        </div>

                    </div>
                </div>
                
                <div className='inter-infos-c'>
                    <h3> Information de l'intervention </h3>
                    <div className='inter-infos'>
                        <div className='infos-left'>
                            <p><strong>Client: </strong> value </p> 
                            <div className='two-fields'><p><strong>Ville: </strong> value </p> <p><strong>Km: </strong> value </p> </div>
                            <p><strong>Type d'intervention: </strong> value </p>
                            <p><strong>Nom du technicien: </strong> value </p>
                        </div>
                        <div className='infos-right'>
                            <p><strong>Date d'intervention: </strong> value </p>
                            <div className='two-fields'><p> <strong>Commencée à: </strong> value </p> <p><strong>Términe à: </strong> value </p></div>
                            <div className='two-fields'> <p><strong>Durée: </strong> value </p> <p><strong>Nombre d'intervenant: </strong> value </p> </div>
                            <p><strong>Intervention: </strong> value: sur site /atelier </p>
                        </div>
                    </div>
                </div>
                
               <div className="bon-container">
                    <h3 className="bon-title">La photo de bon d'intervention</h3>

                    <button className="toggle-btn" onClick={handlePhoto}>
                        {display ? 'Cacher la photo' : 'Afficher la photo'}
                    </button>

                    {display && (
                        <div className="bon-image-wrapper">
                            <img className="bon-image" src={bon} alt="Bon d'intervention" />
                        </div>
                    )}
</div>

        


            </div>
        </div>
        


    </>
    
  )
}

export default TechIntervention