
import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Data={
    email: string,
    password: string
}
const LogInForm = () => {

    const navigate=useNavigate();

    const [showpass,setShopass]=useState(false);
        const [data,setData]=useState<Data>({
            email:"",
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

     const formData = new URLSearchParams();
      formData.append("email", data.email);
      formData.append("password", data.password);

    const handleSubmit=async (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        
        try{
        const response = await axios.post('http://localhost:9090/login',formData,
          {headers:{'Content-Type':'application/x-www-form-urlencoded'},}
        );
        localStorage.setItem('access_token',response.data['access-token'])
        localStorage.setItem('refresh_token',response.data['refresh-token'])

        navigate('/formIntervention',{replace:true});
      }catch(error){
        console.error("Login Failed",error);
        alert("Invalid username or password")
      }
    }; 

  return (
    <div className="container d-flex justify-content-center align-items-center bg" style={{ minHeight: '100vh' }}>
      <form className="border p-4 rounded shadow-lg " style={{ minWidth: '360px',height:'360px' }} onSubmit={handleSubmit}>
        <h1 className="text-center mb-4">Sign In</h1>

        <div className="mb-3 position-relative">
          <input
            type="text"
            className="form-control p-3"
            id="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            placeholder="Email"
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

        <button type="submit" className="submit-btn"><h5>Sign In</h5></button>
      </form>
    </div>
  )
}

export default LogInForm