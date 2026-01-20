import {SignedIn, SignedOut, SignInButton, SignOutButton, UserButton} from '@clerk/clerk-react';

function App() {

  return (
    <>
        <h1>Under Construction</h1>
      <SignedOut>
        <SignInButton mode='modal'>
          <button>
            Sign Up please
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <SignOutButton mode='modal'/>
      </SignedIn>

      <UserButton/>
    </>
  )
}

export default App
