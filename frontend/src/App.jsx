import {SignedIn, SignedOut, SignInButton, SignOutButton, UserButton, useUser} from '@clerk/clerk-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';

import ProblemPage from './pages/ProblemPage';
import { Toaster } from 'react-hot-toast';

/**
 * Application root component that provides client-side routes and global toast handling.
 *
 * Renders the home route at "/" and a protected "/problems" route that navigates to the home page when the user is not signed in.
 * Also mounts a global Toaster for toast notifications.
 * @returns {JSX.Element} The root React element containing the app routes and the Toaster.
 */
function App() {
  const {isSignedIn}=useUser();
  return (
    <>
    <Routes>
        

        <Route path='/' element={<HomePage/>}/>
        
        <Route path='/problems' element={isSignedIn ? <ProblemPage/>:<Navigate to={"/"} /> }/>
  
      {/* <SignedOut>
        <SignInButton mode='modal'>
          <button>
            Sign Up please
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <SignOutButton mode='modal'/>
      </SignedIn>

      <UserButton/> */}
    </Routes>
    <Toaster/>
    </>
  )
}

export default App