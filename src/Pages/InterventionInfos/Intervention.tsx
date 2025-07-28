import React, { useCallback, useState } from 'react'
import './intervention.css'
import uploadIcon from '../../assets/icons/image-upload.png';
import Navbar from '../../components/Navbar/Navbar';
import { useDropzone, type DropEvent, type FileRejection } from 'react-dropzone';
import api from '../../Interceptors/api';

type Intervention={
    client: string, //what will be? name or cin or what
    ville: string,
    km: number,
    tech: string,
    date: string,
    startTime: string,
    finishTime: string,
    duration: string,
    nbreIntervenant: number,
    bonImageUrl:string,
}

const InterventionForm = () => {

    const [file,setFile]=useState<File[]>([]);

    const onDrop=useCallback((acceptedFiles:File[])=>{
        setFile(acceptedFiles);
        console.log('image dropped:');
    },[]);

    const {getRootProps,getInputProps} = useDropzone({onDrop, accept:{'image/*':[]}});

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
        bonImageUrl:"",
    }) 

    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const {name,value}=e.target;
        setinfos({
            ...infos,
            [name]:value,
        })
    }



    

    const handleSubmit=async (e:React.FormEvent)=>{
        e.preventDefault();

        const bonImage=file[0];
        const dataForm= new FormData();

        for(const key in infos){
            dataForm.append(key,infos[key as keyof Intervention] as any);
        }
        
        dataForm.append('bonImage',bonImage);

        try{
            
            const response=await api.post('/bonIntervention',dataForm,
                {headers:{'Content-Type':'multipart/form-data'}}
            );
            
            alert('Upload success!');
            console.log(response.data);

        }catch(error){
            console.log("bon interveton infos werent sent ", error);
        }
        
    }

    return (
        <>
    <Navbar/>

    <div className='intervention'>    
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

            <div {...getRootProps()} className='img-container'>
                <label className='label-bon'>Entrez l'image de bon d'intervention</label>
                <input {...getInputProps()} id='bon-upload' className="bon-img" type="file" accept="image/*" />
                
                <label htmlFor='bon-upload' className='img-c'>
                <img className="upload-icon" src={uploadIcon} alt="Upload Icon"  />
                </label>

            </div>
            <div className='btn-container'>
                <button type='submit' className='btn-submit'> Enregistrez les informations</button>
            </div>
        </form>
        </div>
        
        </>
  )
}

export default InterventionForm