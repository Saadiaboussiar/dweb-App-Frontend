import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import SignInForm from './Pages/Signin/SignInForm'
import LogInForm from './Pages/Login/LogInForm'
import Intervention from './Pages/InterventionInfos/Intervention'
import Dashboard from './Pages/BonDashboard/Dashboard'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LogInForm />}/>
        <Route path="/signinform" element={<SignInForm />}/>
        <Route path="/" element={<LogInForm />}/>
        <Route path='/formIntervention' element={<Intervention />}/>
        <Route path='SignIn' element={<LogInForm/>} />
      </Routes>

    </>
  )
}

export default App