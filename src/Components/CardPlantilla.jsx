import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function CardPlantilla({ titulo, url, description, template, convocatoriaId}) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(url, { state: { template, convocatoriaId } });
    };

    return (
        <button className='ButtonNavigate' onClick={handleClick}>
            <div className="notification">
                <div className="notititle">{titulo}</div>
                <div className="notibody">{description}</div>
                <button>Usar</button>
            </div>
        </button>
    )
}
