import React, { useState, useEffect } from 'react';
import { CButton, CForm, CFormInput, CFormLabel, CFormFeedback, CSpinner } from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const VITE_API_URL = import.meta.env.VITE_API_URL
const API_URL_RESET_PASSWORD = `${VITE_API_URL}/auth/reset-password`;

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    contrasena: '',
    confirmContrasena: ''
  });

  const [errors, setErrors] = useState({
    contrasena: '',
    confirmContrasena: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [tokenValid, setTokenValid] = useState(true); 
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setTokenValid(false);
    }

    if (!tokenValid) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.search, tokenValid, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.contrasena) newErrors.contrasena = 'La contraseña es requerida';
    if (formData.contrasena !== formData.confirmContrasena) newErrors.confirmContrasena = 'Las contraseñas deben coincidir';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && tokenValid) {
      setIsLoading(true);

      try {
        const response = await axios.patch(`${API_URL_RESET_PASSWORD}/${token}`, {
          contrasena: formData.contrasena
        });

        if (response.status === 200) {
          navigate('/login');
        }
      } catch (error) {
        console.error('There was an error!', error);
        if (error.response) {
          console.log(error.response.data);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!tokenValid) {
    return <div className='ResetPasswordWithoutToken'>
      <p>Token inválido o ausente. Redirigiendo a la página de inicio de sesión...</p>
      <CSpinner/>
    </div>;
  }

  return (
    <div className="reset-password-container">
      <CForm onSubmit={handleSubmit} className="reset-password-form">
        <h2>Restablecer Contraseña</h2>
        <CFormLabel htmlFor="contrasena">Nueva Contraseña</CFormLabel>
        <CFormInput
          id="contrasena"
          name="contrasena"
          type="password"
          value={formData.contrasena}
          onChange={handleChange}
          invalid={!!errors.contrasena}
        />
        <CFormFeedback className='mb-1' invalid>{errors.contrasena}</CFormFeedback>

        <CFormLabel htmlFor="confirmContrasena">Confirmar Nueva Contraseña</CFormLabel>
        <CFormInput
          id="confirmContrasena"
          name="confirmContrasena"
          type="password"
          value={formData.confirmContrasena}
          onChange={handleChange}
          invalid={!!errors.confirmContrasena}
        />
        <CFormFeedback className='mb-3' invalid>{errors.confirmContrasena}</CFormFeedback>

        {isLoading ? (
          <CButton className='PrimaryButton' disabled>
            <CSpinner as="span" size="sm" aria-hidden="true" />
            
          </CButton>
        ) : (
          <CButton type="submit" className='mt-3 PrimaryButton'>Restablecer Contraseña</CButton>
        )}
      </CForm>
    </div>
  );
}
