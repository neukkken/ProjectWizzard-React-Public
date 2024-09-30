import React, { useState } from 'react';
import AuthUser from '../../utils/AuthUser';
import { useLocation, useNavigate } from 'react-router-dom';

const NotFound = () => {
    const location = useLocation()
    const token = localStorage.getItem('token')
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const currentRoute = location.pathname

    AuthUser(token, setUser, navigate, currentRoute)

    return (
        <div>
            <h1>404</h1>
            <p>esta url no existe, usted esta siendo redirigido...</p>
        </div>
    );
}

export default NotFound;
