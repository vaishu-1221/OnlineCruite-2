import React from 'react'
import {SignedIn, SignedOut, SignInButton, SignOutButton, UserButton} from '@clerk/clerk-react';

const HomePage = () => {
  return (
    <div>
      <h1>Home</h1>
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
    </div>
  )
}

export default HomePage
