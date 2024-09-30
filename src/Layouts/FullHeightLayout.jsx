import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import AuthUser from "../../utils/AuthUser"

export default function FullHeightLayout({children}) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if(token !== null){
      AuthUser(token, setUser, navigate, location.pathname)
    }
  }, [])

  return (
    <div className="FullHeightLayout">
        {children}
    </div>
  )
}
