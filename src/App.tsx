import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import SignInForm from './Pages/Signin/SignInForm'
import LogInForm from './Pages/Login/LogInForm'
import Intervention from './Pages/InterventionInfos/Intervention'
import TechProfile from './Pages/Technician-Profile/TechProfile'
import AdminProfile from './Pages/Admin-profile/AdminProfile'
import RequireAuth from './auth/RequireAuth'
import TechIntervention from './Pages/Intervention/TechIntervention'
import Dashboard from './Pages/BonDashboard/Dashboard'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LogInForm />}/>
        <Route path="/signinform" element={<SignInForm />}/>
        <Route path="/" element={<LogInForm />}/>
        <Route path='/formIntervention' element={<RequireAuth> <Intervention /> </RequireAuth> }/>
        <Route path='/SignIn' element={<LogInForm/>} />
        <Route path='/techprofile' element={<RequireAuth> <TechProfile /> </RequireAuth> } />
        <Route path='/adminprofile' element={<RequireAuth> <AdminProfile/> </RequireAuth> }/>
        <Route path='/Techintervetion' element={<TechIntervention/>}></Route>
        <Route path='Dashboard' element={<Dashboard/>}></Route>
      </Routes>

    </>
  )
}

export default App