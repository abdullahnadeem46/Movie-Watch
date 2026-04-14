import React from 'react'
import { SignUp } from '@clerk/clerk-react'

function SignUpPage () {
  return (
    <div style= {{display: 'flex', justifyContent: 'center', marginTop:'50px'}}>
    <SignUp/>    
    </div>
  )
}

export default SignUpPage
