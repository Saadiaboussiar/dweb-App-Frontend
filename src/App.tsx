import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import SignInForm from './components/auth/SignInForm'
import Test from './components/Test'
import LogInForm from './components/auth/LogInForm'

const App = () => {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LogInForm />}/>
        <Route path="/signinform" element={<SignInForm />}/>

      </Routes>
      </BrowserRouter>
      
    </>
  )
}

export default App