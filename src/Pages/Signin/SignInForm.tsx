import React, { useEffect, useState } from 'react'

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type Data={
    username:string,
    password: string,
    confiremedPassword: string
}
const SignInForm = () => {

    const navigate=useNavigate();

    const [showpass,setShopass]=useState(false);

    const [data,setData]=useState<Data>({
        username:"",
        password:"",
        confiremedPassword: "",

    });


    const handleChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const {name,value}=e.target;

        setData({
            ...data,
            [name]:value,
        })
    }

   
    const togglePassword=()=>{
        if(showpass) setShopass(false);
        else setShopass(true);
    }

    const handleSubmit=async (e:React.FormEvent)=>{
      e.preventDefault();

      if(data.password===data.confiremedPassword){
        
        const userData={
          username: data.username,
          password: data.password,
        }
        try{
        const response= await axios.post("http://localhost:9090/users",userData,
          {headers: {"Content-type":"application/json"}}
        );
        navigate("/login", {replace:true});
        
      }catch(error:any){
        if(error.response?.status===409){
          alert("Cet utilisateur exite déjà");
        }else{
          console.log("error signin: ",error);
          alert("Votre connexion a échoué");
        }
      };

      }else{
        const frame: HTMLDivElement = document.createElement('div');
        frame.textContent = "Le mot de passe n'est pas confirmé";
    
        frame.style.position = 'fixed';
        frame.style.top = '20px';
        frame.style.right = '20px';
        frame.style.padding = '15px';
        frame.style.backgroundColor = '#fc7272ff';
        frame.style.color = 'white';
        frame.style.borderRadius = '10px';
        frame.style.fontSize = '16px';
        frame.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        frame.style.zIndex = '999';

        setTimeout(() => {
          console.log("Removing frame now");
          frame.remove();
        }, 2500);

        document.body.appendChild(frame);
      }
        
    }

    
  return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <form className="border p-4 rounded shadow" style={{ minWidth: '300px' }} onSubmit={handleSubmit}>
        <h2 className="text-center mb-4">SignIn</h2>

        <div className="mb-3 position-relative">
          <label htmlFor="username" className="form-label">Nom d'utilisateur</label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={data.username}
            onChange={handleChange}
            placeholder="Entrez votre nom d'utilisateur"
            required
          />
        </div>

        <div className="mb-3 position-relative">
          <label htmlFor="password" className="form-label">Mot de passe</label>
          <input
            type={showpass ? 'text' : 'password'}
            className="form-control pe-5"
            id="password"
            name="password"
            value={data.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="Entrez votre mot de passe"
            required
          />

          
          <span
            onClick={togglePassword}
            className="position-absolute"
            style={{
              top: '50%',
              right: '15px',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#888'
            }}
          >
              {/*<FontAwesomeIcon icon={showpass ? 'eye-slash' : 'eye'} /> */}
          </span>
          
        </div>
        <div className="mb-3 position-relative">
          <label htmlFor="password" className="form-label">Confirme mot de passe</label>
          <input
            type={showpass ? 'text' : 'password'}
            className="form-control pe-5"
            id="confiremedPassword"
            name="confiremedPassword"
            value={data.confiremedPassword}
            onChange={handleChange}
            autoComplete="confirme-password"
            placeholder="Confirmez votre mot de passe"
            required
          />

          {/*
          <span
            onClick={togglePassword}
            className="position-absolute"
            style={{
              top: '50%',
              right: '15px',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              color: '#888'
            }}
          >
           {showpass ? '🙈' : '👁️'}
          </span>
          */}
        </div>

        <button type="submit" className="btn btn-primary w-100" >Signin</button>
      </form>
    </div>
  )
}

export default SignInForm