import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import SignInForm from './components/auth/SignInForm'
import Test from './components/Test'
import LogInForm from './components/auth/LogInForm'
import InterventionForm from './components/technician_pages/InterventionForm'

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LogInForm />}/>
        <Route path="/signinform" element={<SignInForm />}/>
        <Route path="/" element={<InterventionForm />}/>
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App