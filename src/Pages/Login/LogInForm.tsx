
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
    <div className="container d-flex justify-content-center align-items-center " style={{ minHeight: '100vh' }}>
      <form className="border p-4 rounded shadow " style={{ minWidth: '360px',height:'360px' }} onSubmit={handleSubmit}>
        <h1 className="text-center mb-4">Sign In</h1>

        <div className="mb-3 position-relative">
          <input
            type="text"
            className="form-control p-3"
            id="username"
            name="username"
            value={data.username}
            onChange={handleChange}
            placeholder="Nom d'utilisateur"
            required
          />
        </div>

        <div className="mb-4 position-relative">
          <input
            type={showpass ? 'text' : 'password'}
            className="form-control p-3"
            id="password"
            name="password"
            value={data.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="Mot de passe"
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
        
        <Link className="link" to='/signinform'>Sign Up</Link>

        <button type="submit" className="btn btn-primary w-100 mt-3 p-2"><h5>Sign In</h5></button>
      </form>
    </div>
  )
}

export default LogInForm