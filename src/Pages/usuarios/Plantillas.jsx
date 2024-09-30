import React, { useState, useEffect } from 'react';
import CardPlantilla from '../../Components/CardPlantilla';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL

export default function Plantillas() {
    let token = localStorage.getItem('token');
    const [conv, setConv] = useState([]);

    useEffect(() => {
        const fetchConvocatorias = async () => {
            try {
                const response = await axios.get(`${VITE_API_URL}/convocatoria`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const filteredConvocatorias = response.data.filter(data => data.estado === 'Activa' && data.template.length > 0);

                const convocatoriasConPlantilla = filteredConvocatorias.map(data => {
                    return {
                        ...data,
                        template: JSON.parse(data.template[0])
                    };
                });

                setConv(convocatoriasConPlantilla);
            } catch (err) {
                console.error('Error fetching data', err);
            }
        };

        fetchConvocatorias();
    }, []);

    const handleMouseScroll = (e) => {
        const container = document.querySelector('.templateConv');
        if (container) {
            container.scrollLeft += e.deltaY;
        }
    };

    useEffect(() => {
        const container = document.querySelector('.templateConv');
        if (container) {
            container.addEventListener('wheel', handleMouseScroll);
        }
        
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleMouseScroll);
            }
        };
    }, []);

    return (
        <AdminLayout>
            <div className="containerTemplates">
                <section className='sectionTemplates'>
                    <h2>Plantilla libre</h2>
                    <div>
                        <CardPlantilla 
                            titulo={'Plantilla libre'} 
                            description={'Con la plantilla libre, organiza y crea secciones a tu gusto, permitiendo una formulación completamente personalizada de tu proyecto.'} 
                            url={'/usuarios/plantilla/libre'} 
                        />
                    </div>
                </section>

                <section className='sectionTemplates'>
                    <h2>Plantillas del SENA</h2>
                    <div>
                        <CardPlantilla 
                            titulo={'Plantilla Proyecto SENA'} 
                            description={'Con esta plantilla, podrás estructurar y formular tus proyectos formativos del SENA de manera efectiva, cumpliendo con todos los requisitos necesarios.'} 
                            url={'/usuarios/plantillas/no-libre'} 
                        />
                    </div>
                </section>

                <section className='sectionTemplates'>
                    <h2>Plantillas de convocatorias</h2>
                    <div className='templateConv'>
                        {conv.map((convocatoria) => (
                            <CardPlantilla
                                key={convocatoria._id}
                                titulo={convocatoria.title}
                                description={convocatoria.descripcion}
                                url={'/usuarios/plantillas/no-libre'}
                                template={convocatoria.template}
                                convocatoriaId={convocatoria._id}
                            />
                        ))}
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
