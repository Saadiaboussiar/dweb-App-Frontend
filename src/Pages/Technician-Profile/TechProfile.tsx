import React, { useCallback, useEffect, useState } from 'react';
import './profile.css';
import Navbar from '../../components/Navbar/Navbar';
import { useDropzone } from 'react-dropzone';
import profile_icon from '../../assets/icons/profileIcon.png';
import api from '../../Interceptors/api';

type profileData = {
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
  cin: string,
  cnss: string,
  profileUrl: string
};

const TechProfile = () => {
  const [infos, setInfos] = useState<profileData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    cin: '',
    cnss: '',
    profileUrl:'',
  });


  const [isUpdated,setIsUpdated]=useState(false);

  const [photo, setPhoto] = useState<File | null>(null);

  const [isNew,setIsNew]=useState(true);


  const onDrop = useCallback((acceptedFile: File[]) => {
    setPhoto(acceptedFile[0]);

  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  let imageURL=null;
  if(photo!=null) {imageURL = URL.createObjectURL(photo);}

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInfos({
      ...infos,
      [name]: value,
    });
  };

  const dataForm= new FormData();

        for(const key in infos){
          if(key!="profileUrl"){
            dataForm.append(key,infos[key as keyof profileData] as any);
        }
      }
        if(photo) dataForm.append('profileImage',photo);

  const dataUpdate= async()=>{
    try{
    const response=await api.put("/technicianProfile", dataForm, 
      {headers:{'Content-Type': 'multipart/form-data'}}
     );
     setPhoto(null);
    alert('Infos updated successfully!');
    fetchProfile();
    setIsUpdated(true);
    
  }catch(error){
    console.log("technician infos werent updated ", error);
  }
  } 

  const dataSave=async()=>{

    try{
            
        const response=await api.post('/technicianProfile',dataForm,
            {headers:{'Content-Type': 'multipart/form-data'}}
        );
            setPhoto(null);
            alert('Infos saved successfully!');
            fetchProfile();
            
        }catch(error){
            console.log("technician infos werent saved ", error);
        }

  }

  const handleSubmit=async (e:React.FormEvent)=>{
        e.preventDefault();
        const isExisting = infos && Object.keys(infos).length ===7;
        
        try {
        if(!isNew){
         await dataUpdate();
        }else{
          await dataSave();
        }

        alert("Saved!");

      }catch(err){
        console.error("Submit error:", err)
      }
    }


    const fetchProfile=async ()=>{
      try{
        const response = await api.get<profileData>('/technicianProfile')
        setInfos(response.data);
        setIsNew(false);

        console.log("fetched data: ", infos);
        console.log("profileurl: ",infos.profileUrl);

      }catch(error){
        console.error('Error fetching profile: ',error);
      }
    }

    useEffect(()=>{
      fetchProfile();
    },[isUpdated])


  return (
    <>
    <div className="page-container">
      <Navbar />
      
      <div className='form-c'>
        <form onSubmit={handleSubmit}>
          <p className="tech-title">Les Informations de Technician</p>

          <div className="form-body">
            <div className="profile-wrapper">
           <div {...getRootProps()} className='profile-c'>
                <input {...getInputProps()} id='bon-upload' className="bon-img" type="file" accept="image/*" />
                <label htmlFor='bon-upload' className='profile-c'>
                {
                  infos.profileUrl ?
                  <img className="profile-icon" src={`${encodeURI(infos.profileUrl)}?t=${Date.now()}`} alt="Upload Icon" />
                  : 
                  <img className="profile-icon" src={profile_icon} alt="Upload Icon" />
                }
                  
                  <div className='Edit'>
                    <p className='edit-profile'>Modifier Votre Photo de Profile</p>
                  </div>
                </label>
              </div>
              </div>
              </div>


              {/* Inputs */}
              <div className='inputs'>

              <div className="mb-3 ">
                <label className='input-label-left'>Nom :</label>
                <input type="text" className="input-left" id="lastname" name="lastName" value={infos.lastName } onChange={handleChange} placeholder="Nom" required />
              </div>

              <div className="mb-3">
                <label className='input-label-right'>Prénom: </label>
                <input type="text" className="input-right" id="firstName" name="firstName" value={infos.firstName} onChange={handleChange} placeholder={infos.firstName=="" ? "Prénom": infos.firstName} required />
              </div>

              <div className="mb-3">
                <label className='input-label-left'>Email :</label>
                <input type="text" className="input-left" id="email" name="email" value={infos.email } onChange={handleChange} placeholder="Email" required />
              </div>

              <div className="mb-3">
                <label className='input-label-right'>Numéro de téléphone :</label>
                <input type="text" className="input-right" id="phoneNumber" name="phoneNumber" value={infos.phoneNumber} onChange={handleChange} placeholder="Numéro de téléphone" required />
              </div>

              <div className="mb-3">
                <label className='input-label-left'>CIN :</label>
                <input type="text" className="input-left" id="cin" name="cin" value={infos.cin } onChange={handleChange} placeholder="Cin" required />
              </div>

              <div className="mb-3">
                <label className='input-label-right'>CNSS :</label>
                <input type="text" className="input-right" id="cnss" name="cnss" value={infos.cnss  } onChange={handleChange} placeholder="Cnss" required />
              </div>

            </div>


            <div className='btn-c'>
              <button type='submit' className='btn-s'>Enregistrez votre informations</button>
            </div>
        </form>
      </div>
      </div>
    </>
  );
};

export default TechProfile;
