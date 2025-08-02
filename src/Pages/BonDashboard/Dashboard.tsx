import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import "./dashboard.css"
import { FaRegCalendarAlt } from 'react-icons/fa'
import { FiClock } from 'react-icons/fi';

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
                <div className='date-c'>
                  <FaRegCalendarAlt size={25} color="#4d4d4dff"/>
                  <span className='date'>03/11/2025</span>
                </div>

                <div className='time-c'>
                   <FiClock size={25} color='#3f3f3fff'/>
                    <span className='time'>10:30</span>
                </div>
                </div> 
            </div>
          
            <div className='intervention-card'>
              <h3>Full Name</h3>
              <hr/>
              <div className='when'>
                <div className='date-c'>
                  <FaRegCalendarAlt size={25} color="#4d4d4dff"/>
                  <span className='date'>03/11/2025</span>
                </div>

                <div className='time-c'>
                   <FiClock size={25} color='#3f3f3fff'/>
                    <span className='time'>10:30</span>
                </div>
                </div> 
            </div>
            <div className='intervention-card'>
              <h3>Full Name</h3>
              <hr/>
              <div className='when'>
                <div className='date-c'>
                  <FaRegCalendarAlt size={25} color="#4d4d4dff"/>
                  <span className='date'>03/11/2025</span>
                </div>

                <div className='time-c'>
                   <FiClock size={25} color='#3f3f3fff'/>
                    <span className='time'>10:30</span>
                </div>
                </div> 
            </div>
            <div className='intervention-card'>
              <h3>Full Name</h3>
              <hr/>
              <div className='when'>
                <div className='date-c'>
                  <FaRegCalendarAlt size={25} color="#4d4d4dff"/>
                  <span className='date'>03/11/2025</span>
                </div>

                <div className='time-c'>
                   <FiClock size={25} color='#3f3f3fff'/>
                    <span className='time'>10:30</span>
                </div>
                </div> 
            </div>
            <div className='intervention-card'>
              <h3>Full Name</h3>
              <hr/>
              <div className='when'>
                <div className='date-c'>
                  <FaRegCalendarAlt size={25} color="#4d4d4dff"/>
                  <span className='date'>03/11/2025</span>
                </div>

                <div className='time-c'>
                   <FiClock size={25} color='#3f3f3fff'/>
                    <span className='time'>10:30</span>
                </div>
                </div> 
            </div>
            <div className='intervention-card'>
              <h3>Full Name</h3>
              <hr/>
              <div className='when'>
                <div className='date-c'>
                  <FaRegCalendarAlt size={25} color="#4d4d4dff"/>
                  <span className='date'>03/11/2025</span>
                </div>

                <div className='time-c'>
                   <FiClock size={25} color='#3f3f3fff'/>
                    <span className='time'>10:30</span>
                </div>
                </div> 
            </div>
        </div>
      </div>
      

    </>
    
  )
}

export default Dashboard