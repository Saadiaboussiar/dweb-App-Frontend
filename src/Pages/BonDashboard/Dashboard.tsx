import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import "./dashboard.css"

const Dashboard = () => {
  const navigate=useNavigate();
  const id=4;
  return (
    <>
      <div className='dashboard-page'>
        <Navbar/>

        <div className='dashboard-container' onClick={()=>navigate('/Techintervetion')}>
            <div className='intervention-card'>
              <h3>Full Name</h3>
              <hr/>
              <div className='when'>
                <p>03/11/2025</p>
                <p>10:30</p>
              </div> 
            </div>
          
          
          <div className='intervention-card'>
              <h3>Full Name</h3>
              <hr/>
              <div className='when'>
                <p>03/11/2025</p>
                <p>10:30</p>
              </div>
              
          </div>
          <div className='intervention-card'>
              <h3>Full Name</h3>
              <hr/>
              <div className='when'>
                <p>03/11/2025</p>
                <p>10:30</p>
              </div>
              
          </div>
          <div className='intervention-card'>
              <h3>Full Name</h3>
              <hr/>
              <div className='when'>
                <p>03/11/2025</p>
                <p>10:30</p>
              </div>
              
          </div>
          <div className='intervention-card'>
              <h3>Full Name</h3>
              <hr/>
              <div className='when'>
                <p>03/11/2025</p>
                <p>10:30</p>
              </div>
              
          </div>
          <div className='intervention-card'>
              <h3>Full Name</h3>
              <hr/>
              <div className='when'>
                <p>03/11/2025</p>
                <p>10:30</p>
              </div>
              
          </div>
        </div>
      </div>
      

    </>
    
  )
}

export default Dashboard