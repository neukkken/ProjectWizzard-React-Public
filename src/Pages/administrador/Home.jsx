import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import AdminLayout from "../../Layouts/AdminLayout";
import { CCard, CCardBody, CCardHeader, CCol, CRow } from '@coreui/react';
import axios from 'axios';
import Loader from '../../Components/Loader';

const VITE_API_URL = import.meta.env.VITE_API_URL

export default function Home() {
  const [chartData, setChartData] = useState(null);
  const [successRateData, setSuccessRateData] = useState(null);
  const [projectsByWeekData, setProjectsByWeekData] = useState(null);
  const [userRegistrationData, setUserRegistrationData] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    axios.get(`${VITE_API_URL}/proyectos/bars`, config)
      .then(response => {
        const data = response.data;
        setChartData([
          { name: 'En Revisión', value: data.EN_REVISION },
          { name: 'Completados', value: data.COMPLETADOS },
          { name: 'En Progreso', value: data.EN_PROGRESO },
          { name: 'Pendiente', value: data.PENDIENTE },
          { name: 'Rechazados', value: data.RECHAZADOS },
          { name: 'Revisados', value: data.REVISADOS },
          { name: 'Revisados con Errores', value: data.REVISADOS_ERRORES },
        ]);
      })
      .catch(error => {
        console.error('Error fetching the data for bar chart:', error);
      });

    axios.get(`${VITE_API_URL}/proyectos`, config)
      .then(response => {
        const projects = response.data;
        const totalProjects = projects.length;
        const completedProjects = projects.filter(p => p.estado === 'Completado').length;
        const successRate = totalProjects > 0 ? ((completedProjects / totalProjects) * 100).toFixed(2) : 0;

        setSuccessRateData([
          { name: 'Completado', value: parseFloat(successRate) },
          { name: 'No Completados', value: 100 - parseFloat(successRate) }
        ]);

        const now = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);


      })
      .catch(error => {
        console.error('Error fetching project data:', error);
      });

    axios.get(`${VITE_API_URL}/proyectos/week-per-day`, config)
      .then(response => {
        const projectsData = response.data;

        const formattedData = Object.keys(projectsData).map(date => ({
          name: date,
          count: projectsData[date]
        }));

        setProjectsByWeekData(formattedData);
      })
      .catch(error => {
        console.error('Error fetching project data:', error);
      });


    axios.get(`${VITE_API_URL}/auth/usuario`, config)
      .then(response => {
        const users = response.data;
        if (Array.isArray(users)) {
          const now = new Date();
          const lastWeek = new Date(now.setDate(now.getDate() - 7));

          const userCountsByDate = users.reduce((acc, user) => {
            const userDate = new Date(user.createdAt).toLocaleDateString();
            if (new Date(user.createdAt) >= lastWeek) {
              acc[userDate] = (acc[userDate] || 0) + 1;
            }
            return acc;
          }, {});

          setUserRegistrationData(Object.keys(userCountsByDate).map(date => ({
            name: date,
            count: userCountsByDate[date]
          })));
        } else {
          console.error('Unexpected user data format:', users);
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });

  }, [token]);

  return (
    <AdminLayout>
      {chartData && successRateData && projectsByWeekData && userRegistrationData ? (
        <CRow>
          <CCol xs="12" md="6">
            <CCard className='cardChart'>
              <CCardHeader>Proyectos por Estado</CCardHeader>
              <CCardBody>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol xs="12" md="6">
            <CCard className='cardChart'>
              <CCardHeader>Tasa de Éxito de Proyectos</CCardHeader>
              <CCardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={successRateData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#4caf50">
                      {successRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Completado' ? '#4caf50' : '#f44336'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol xs="12" md="6">
            <CCard className='cardChart'>
              <CCardHeader>Proyectos por Semana</CCardHeader>
              <CCardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={projectsByWeekData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid stroke="#ccc" />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#4caf50" fill="#4caf50" />
                  </LineChart>
                </ResponsiveContainer>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol xs="12" md="6">
            <CCard className='cardChart'>
              <CCardHeader>Usuarios Registrados por Semana</CCardHeader>
              <CCardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userRegistrationData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid stroke="#ccc" />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#4caf50" fill="#ff5722" />
                  </LineChart>
                </ResponsiveContainer>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      ) : (
        <Loader />
      )}
    </AdminLayout>
  );
}
