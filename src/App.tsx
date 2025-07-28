import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import SignInForm from './Pages/Signin/SignInForm'
import LogInForm from './Pages/Login/LogInForm'
import Intervention from './Pages/InterventionInfos/Intervention'
import Profile from './Pages/Profile/Profile'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LogInForm />}/>
        <Route path="/signinform" element={<SignInForm />}/>
        <Route path="/" element={<Profile />}/>
        <Route path='/formIntervention' element={<Intervention />}/>
        <Route path='/SignIn' element={<LogInForm/>} />
        <Route path='/profile' element={<Profile />} />
      </Routes>

    </>
  )
}

export default App