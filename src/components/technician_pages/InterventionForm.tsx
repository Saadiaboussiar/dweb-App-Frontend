import React, { useState } from 'react'
import './index.css'
import uploadIcon from '../../assets/image-upload.png';

type Intervention={
    client: string,
    ville: string,
    km: number,
    tech: string,
    date: string,
    startTime: string,
    finishTime: string,
    duration: string,
    nbreIntervenant: number,
}

const InterventionForm = () => {
    
    const formatDate=(date:Date)=>{
        return date.toISOString().split('T')[0];
    }

    const [infos,setinfos]=useState<Intervention>({
        client: "",
        ville: "",
        km:0,
        tech: "",
        date: formatDate(new Date()),
        startTime: "",
        finishTime: "",
        duration: "",
        nbreIntervenant: 0,
    }) 

    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const {name,value}=e.target;
        setinfos({
            ...infos,
            [name]:value,
        })
    }

    const handleSubmit=(e:React.FormEvent)=>{
        e.preventDefault();
        
    }

    return (
        <>
    <form onSubmit={handleSubmit}>
        <div id='form-container' className="border p-4 rounded shadow my-5" style={{ minWidth: '300px' }} >
            <h2 className="text-center mb-4">Les Informations de l'intervention</h2>
            <div className='row'>

            <div className="mb-3 position-relative col-md-4">
            <label>Nom de client :</label>
            <input
            type='text'
            className="form-control"
            id="client"
            name="client"
            value={infos.client}
            onChange={handleChange}
            required />
            </div>

            <div className="mb-3 position-relative col-md-4">
            <label>La ville :</label>
            <input
            type='text'
            className="form-control"
            id="ville"
            name="ville"
            value={infos.ville}
            onChange={handleChange}
            required />
            </div>

            <div className="mb-3 position-relative col-md-4">
            <label>Km :</label>
            <input
            type='number'
            className="form-control"
            id="km"
            name="km"
            value={infos.km}
            onChange={handleChange}
            required />
            </div>

            <div className="mb-3 position-relative col-md-4">
            <label>Nom de technicien :</label>
            <input
            type='text'
            className="form-control"
            id="tech"
            name="tech"
            value={infos.tech}
            onChange={handleChange}
            required />
            </div>

            <div className="mb-3 position-relative col-md-4">
            <label>La date :</label>
            <input
            type='date'
            className="form-control"
            id="date"
            name="date"
            value={(infos.date).toString()}
            onChange={handleChange}
            required />
            </div>

            <div className="mb-3 position-relative col-md-4">
            <label>Commencé à :</label>
            <input
            type='text'
            className="form-control"
            id="startTime"
            name="startTime"
            value={infos.startTime}
            onChange={handleChange}
            required />
            </div>

            <div className="mb-3 position-relative col-md-4">
            <label>Terminé à :</label>
            <input
            type='text'
            className="form-control"
            id="finishTime"
            name="finishTime"
            value={infos.finishTime}
            onChange={handleChange}
            required />
            </div>

            <div className="mb-3 position-relative col-md-4">
            <label>La durée :</label>
            <input
            type='text'
            className="form-control"
            id="duration"
            name="duration"
            value={infos.duration}
            onChange={handleChange}
            required />
            </div>

            <div className="mb-3 position-relative col-md-4">
            <label>Nombre d'intervenant :</label>
            <input
            type='number'
            className="form-control"
            id="nbreIntervenant"
            name="nbreIntervenant"
            value={infos.nbreIntervenant}
            onChange={handleChange}
            required />
            </div>
        </div>
        </div>

            <div className='img-container'>
                <label className='label-bon'>Entrez l'image de bon d'intervention</label>
                <input id='bon-upload' className="bon-img" type="file" accept="image/*" />
                
                <label htmlFor='bon-upload' className='img-c'>
                <img className="upload-icon" src={uploadIcon} alt="Upload Icon"  />
                </label>

            </div>
            <div className='btn-container'>
                <button type='submit' className='btn-submit'> Enregistrez les informations</button>
            </div>
        </form>

        
        </>
  )
}

export default InterventionForm