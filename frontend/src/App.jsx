import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { useUser } from "@clerk/clerk-react";

import ProblemPage from './pages/ProblemPage';
import { Toaster } from 'react-hot-toast';
import DashboardPage from './pages/DashboardPage';
import ProblemDetailPage from './pages/ProblemDetailPage';

function App() {
  const {isSignedIn,isLoaded}=useUser();

  if(!isLoaded) return null;
  return (
    <>
    <Routes>
        

        <Route path='/' element={!isSignedIn ? <HomePage/> : <Navigate to={"/dashboard"} />}/>
        <Route path='/dashboard' element={isSignedIn ? <DashboardPage/>:<Navigate to={"/"} /> }/>
        <Route path='/problems' element={isSignedIn ? <ProblemPage/>:<Navigate to={"/"} /> }/>
        <Route path='/problem/:id' element={isSignedIn ? <ProblemDetailPage/> : <Navigate to={"/"}/>}/>
  

    </Routes>
    <Toaster toastOptions={{duration:3000}}/>
    </>
  )
}

export default App
