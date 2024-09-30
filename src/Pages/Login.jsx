import React, { useState, useEffect } from 'react';
import { CButton, CForm, CFormInput, CFormLabel, CFormFeedback, CSpinner } from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthUser from '../../utils/AuthUser';
import { useNavigate, useLocation } from 'react-router-dom';
import FullHeightLayout from '../Layouts/FullHeightLayout';

const VITE_API_URL = import.meta.env.VITE_API_URL
const API_URL_LOGIN = `${VITE_API_URL}/auth/login`;

export default function Login() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: '',
    contrasena: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    contrasena: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.contrasena) newErrors.contrasena = 'Password is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      try {
        const response = await axios.post(API_URL_LOGIN, formData);

        if (response.status === 200) {
          localStorage.setItem('token', response.data.access_token);
          setData(response.data);
          AuthUser(response.data.access_token, setUser, navigate, location.pathname)
        }
      } catch (error) {
        console.error('There was an error!', error);
        if (error.response) {
          const apiErrors = {};
          if (error.response.status === 404 && error.response.data.message === 'Invalid Credentials') {
            apiErrors.email = ' ';
            apiErrors.contrasena = 'Invalid email or password';
          }
          setErrors(apiErrors);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Errors:', newErrors);
    }
  };

  return (
    <FullHeightLayout>
      <div className="login-container">
        <CForm onSubmit={handleSubmit} className="login-form">
          <h2>Iniciar Sesion</h2>
          <CFormLabel htmlFor="email">Email</CFormLabel>
          <CFormInput
            id="email"
            name="email"
            type="text"
            value={formData.email}
            onChange={handleChange}
            invalid={!!errors.email}
          />
          <CFormFeedback className='mb-1' invalid>{errors.email}</CFormFeedback>

          <CFormLabel htmlFor="contrasena">Contraseña</CFormLabel>
          <CFormInput
            id="contrasena"
            name="contrasena"
            type="password"
            value={formData.contrasena}
            onChange={handleChange}
            invalid={!!errors.contrasena}
          />
          <CFormFeedback className='mb-3' invalid>{errors.contrasena}</CFormFeedback>

          <div className="mt-3 text-center links-container">
            <p> <Link className='LinksForm' to="/forgot-password">¿Olvidaste tu contraseña?</Link></p>
          </div>

          {isLoading ? (
            <CButton disabled className='PrimaryButton'>
              <CSpinner as="span" size="sm" aria-hidden="true" />
            </CButton>
          ) : (
            <CButton type="submit" className='PrimaryButton'>Iniciar Sesion</CButton>
          )}
          <div className="mt-3 text-center links-container">
            <p className='LinkOtherWise'>¿No tienes cuenta? <Link className='LinksForm' to="/register">Regístrate aquí</Link></p>
          </div>
        </CForm>
      </div>
    </FullHeightLayout>
  );
}
