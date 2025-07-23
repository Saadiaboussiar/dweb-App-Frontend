import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useState } from "react";
import { Link } from "react-router-dom";

type Data={
    username: string,
    password: string
}
const LogInForm = () => {
    const [showpass,setShopass]=useState(false);
        const [data,setData]=useState<Data>({
            username:"",
            password:"",
    
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

    const handleSubmit=(e:React.FormEvent)=>{
        e.preventDefault();
    }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <form className="border p-4 rounded shadow" style={{ minWidth: '300px' }} onSubmit={handleSubmit}>
        <h2 className="text-center mb-4">Login</h2>

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
            placeholder="Entrez votre Mot de passe"
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
            {/*<FontAwesomeIcon icon={showpass ? faEyeSlash : faEye} />*/}
          </span>
        </div>
        
        <Link to='/signinform'>Sign In</Link>

        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  )
}

export default LogInForm