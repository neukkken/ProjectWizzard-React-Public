import React, { useState } from 'react';
import { CButton, CForm, CFormInput, CFormLabel, CFormFeedback, CSpinner } from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import FullHeightLayout from '../Layouts/FullHeightLayout';

const VITE_API_URL = import.meta.env.VITE_API_URL
const API_URL_REGISTER = `${VITE_API_URL}/auth/usuario`;

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export default function Register() {
  const today = new Date();
  const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const maxDate = eighteenYearsAgo.toISOString().split('T')[0];
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    "nombre": '',
    "apellido": '',
    "email": '',
    "numIdentificacion": '',
    "telefono": '',
    "fechaNacimiento": '',
    "caracterizacion": 'ninguna',
    "role": 'Usuario',
    "contrasena": '',
    "confirmContrasena": ''
  });
  const [errors, setErrors] = useState({
    "nombre": '',
    "apellido": '',
    "email": '',
    "numIdentificacion": '',
    "telefono": '',
    "fechaNacimiento": '',
    "contrasena": '',
    "confirmContrasena": ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    for (const [key, value] of Object.entries(formData)) {
      if (!value && key !== 'confirmContrasena') {
        newErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} es requetido`;
      }
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Correo invalido';
    }

    if (formData.contrasena !== formData.confirmContrasena) {
      newErrors.confirmContrasena = 'Las contraseñas no coinciden';
    }

    if(formData.contrasena.length < 8){
      newErrors.contrasena = 'La contraseña es muy debil, debe tener minimo 8 caracteres';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      try {
        const response = await axios.post(API_URL_REGISTER, formData);
        
        navigate('/login');
      } catch (error) {
        console.error('There was an error!', error);
        if (error.response) {
          const apiErrors = error.response.data.errors || {};
          setErrors(apiErrors);
        } else {
          setErrors({ general: 'An unexpected error occurred' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <FullHeightLayout>
      <div className="register-container">
        <CForm onSubmit={handleSubmit} className="register-form">
          <h2>Registro</h2>
          <CFormLabel htmlFor="nombre">Nombre</CFormLabel>
          <CFormInput
            id="nombre"
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={handleChange}
            invalid={!!errors.nombre}
            className="form-control"
          />
          <CFormFeedback className='mb-1' invalid>{errors.nombre}</CFormFeedback>

          <CFormLabel htmlFor="apellido">Apellido</CFormLabel>
          <CFormInput
            id="apellido"
            name="apellido"
            type="text"
            value={formData.apellido}
            onChange={handleChange}
            invalid={!!errors.apellido}
            className="form-control"
          />
          <CFormFeedback className='mb-1' invalid>{errors.apellido}</CFormFeedback>

          <CFormLabel htmlFor="email">Email</CFormLabel>
          <CFormInput
            id="email"
            name="email"
            type="text"
            value={formData.email}
            onChange={handleChange}
            invalid={!!errors.email}
            className="form-control"
          />
          <CFormFeedback className='mb-1' invalid>{errors.email}</CFormFeedback>

          <div className="NumIDTel-container">
            <div className="itemsNumIdTel">
              <CFormLabel htmlFor="numIdentificacion">Cedula</CFormLabel>
              <CFormInput
                id="numIdentificacion"
                name="numIdentificacion"
                type="text"
                value={formData.numIdentificacion}
                onChange={handleChange}
                invalid={!!errors.numIdentificacion}
                className="form-control"
              />
              <CFormFeedback className='mb-1' invalid>{errors.numIdentificacion}</CFormFeedback>
            </div>

            <div className="itemsNumIdTel">
              <CFormLabel htmlFor="telefono">Teléfono</CFormLabel>
              <CFormInput
                id="telefono"
                name="telefono"
                type="text"
                value={formData.telefono}
                onChange={handleChange}
                invalid={!!errors.telefono}
                className="form-control"
              />
              <CFormFeedback className='mb-1' invalid>{errors.telefono}</CFormFeedback>
            </div>
          </div>

          <CFormLabel htmlFor="fechaNacimiento">Fecha de Nacimiento</CFormLabel>
          <CFormInput
            id="fechaNacimiento"
            name="fechaNacimiento"
            type="date"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            invalid={!!errors.fechaNacimiento}
            min="1960-01-01"
            max={maxDate}
            className="form-control"
          />
          <CFormFeedback className='mb-1' invalid>{errors.fechaNacimiento}</CFormFeedback>

          <CFormLabel htmlFor="contrasena">Contraseña</CFormLabel>
          <CFormInput
            id="contrasena"
            name="contrasena"
            type="password"
            value={formData.contrasena}
            onChange={handleChange}
            invalid={!!errors.contrasena}
            className="form-control"
          />
          <CFormFeedback className='mb-1' invalid>{errors.contrasena}</CFormFeedback>

          <CFormLabel htmlFor="confirmContrasena">Confirmar Contraseña</CFormLabel>
          <CFormInput
            id="confirmContrasena"
            name="confirmContrasena"
            type="password"
            value={formData.confirmContrasena}
            onChange={handleChange}
            invalid={!!errors.confirmContrasena}
            className="form-control"
          />
          <CFormFeedback className='mb-3' invalid>{errors.confirmContrasena}</CFormFeedback>

          <div className="mt-3 text-center">
            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>

          {isLoading ? (
            <CButton disabled className="PrimaryButton">
              <CSpinner as="span" size="sm" aria-hidden="true" />
            </CButton>
          ) : (
            <CButton type="submit" className="PrimaryButton">Registrarse</CButton>
          )}
        </CForm>
      </div>
    </FullHeightLayout>
  );
}
