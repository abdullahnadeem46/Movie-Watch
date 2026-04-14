import React from 'react'
import {SignIn} from '@clerk/clerk-react'

function SignInPage ()  {
  return (
    <div style ={{display: 'flex', justifyContent: 'center', marginTop: '50px'}}><SignIn /></div>
  )
}

export default SignInPage;

