import React, { useState, useEffect } from "react";
import axios from "axios";
import CustomCard from "../../Components/Card";
import { Modal } from 'react-bootstrap';
import AdminLayout from "../../Layouts/AdminLayout";
import Loader from "../../Components/Loader";

const VITE_API_URL = import.meta.env.VITE_API_URL

export default function VisualizarUsuarios() {
    const [selectedRole, setSelectedRole] = useState("Todos los usuarios");
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [originalUser, setOriginalUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchUsuariosWithRetry();
    }, []);

    const fetchUsuariosWithRetry = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await axios.get(`${VITE_API_URL}/auth/usuario`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                setUsuarios(response.data);
                setLoading(false);
                return;
            } catch (err) {
                console.error(`Intento ${i + 1} fallido:`, err);
                if (i === retries - 1) {
                    setError(err);
                    setLoading(false);
                } else {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
    };

    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };    

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setIsOpen(false);
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setOriginalUser({ ...user });
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setEditingUser(null);
        setOriginalUser(null);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            try {
                await axios.delete(`${VITE_API_URL}/auth/usuario/${userId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                fetchUsuariosWithRetry();
            } catch (err) {
                console.error('Error al eliminar usuario:', err);
            }
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!editingUser || !editingUser._id) {
            console.error('No hay usuario editado o ID no encontrado.');
            return;
        }

        const changedData = Object.keys(editingUser).reduce((acc, key) => {
            if (editingUser[key] !== originalUser[key]) {
                acc[key] = editingUser[key];
            }
            return acc;
        }, {});

        if (Object.keys(changedData).length === 0) {
            console.log('No hay cambios para guardar.');
            handleClose();
            return;
        }

        try {
            const response = await axios.patch(`https://projetback-r7o8.onrender.com/auth/usuario/${editingUser._id}`, changedData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Usuario actualizado:', response.data);
            handleClose();
            fetchUsuariosWithRetry();
        } catch (err) {
            console.error('Error al actualizar usuario:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredUsuarios = selectedRole === "Todos los usuarios" ? usuarios : usuarios.filter(user => user.role === selectedRole);

    if (loading) return <Loader />;
    if (error) return <p>Error al cargar usuarios: {error.message}</p>;

    return (
        <AdminLayout>

            <div className="selectorContainer">
                <div className="dropdown">
                    <button className="SecondaryButton" onClick={toggleDropdown}>
                        {selectedRole}
                    </button>
                    <ul className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
                        <li onClick={() => handleRoleSelect("Todos los usuarios")}>Todos los usuarios</li>
                        <li onClick={() => handleRoleSelect("Administrador")}>Administrador</li>
                        <li onClick={() => handleRoleSelect("Usuario")}>Usuario</li>
                    </ul>
                </div>
            </div>

            <div className="card-container">
                {filteredUsuarios.map(user => (
                    <CustomCard
                        key={user._id}
                        data={user}
                        handleEditClick={handleEditClick}
                        handleDelete={handleDelete}
                    />
                ))}
            </div>

            <Modal className="modalContent" show={showModal} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Usuario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingUser && (
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input name="nombre" value={editingUser.nombre} onChange={handleInputChange} placeholder="Nombre" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Apellido</label>
                                <input name="apellido" value={editingUser.apellido} onChange={handleInputChange} placeholder="Apellido" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input name="email" value={editingUser.email} onChange={handleInputChange} placeholder="Email" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Número de Identificación</label>
                                <input name="numIdentificacion" value={editingUser.numIdentificacion} onChange={handleInputChange} placeholder="Número de Identificación" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input name="telefono" value={editingUser.telefono} onChange={handleInputChange} placeholder="Teléfono" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Fecha de Nacimiento</label>
                                <input name="fechaNacimieto" value={editingUser.fechaNacimieto} onChange={handleInputChange} type="date" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Caracterización</label>
                                <input name="caracterizacion" value={editingUser.caracterizacion} onChange={handleInputChange} placeholder="Caracterización" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label>Rol</label>
                                <select name="role" value={editingUser.role} onChange={handleInputChange} className="form-control">
                                    <option value="Administrador">Administrador</option>
                                    <option value="Usuario">Usuario</option>
                                </select>
                            </div>
                            <div className="buttonsContainer">
                                <button type="submit" className="SendButton mt-4">Guardar Cambios</button>
                                <button type="button" onClick={handleClose} className="SecondaryButton mt-3">Cancelar</button>
                            </div>
                        </form>
                    )}
                </Modal.Body>
            </Modal>

        </AdminLayout>
    );
}
