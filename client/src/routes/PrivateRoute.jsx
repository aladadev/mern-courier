import React from 'react'
import useAuthStore from '../store/useAuthStore'
import { Navigate } from 'react-router'

const PrivateRoute = ({ children }) => {
  const { user } = useAuthStore()
  if (user) return children
  return <Navigate to='/signin' replace />
}

export default PrivateRoute
