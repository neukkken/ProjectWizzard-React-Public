import React from 'react';
import { Edit, Trash } from 'lucide-react';

const CustomCard = ({ data, handleEditClick, handleDelete }) => {
    const roleClass = data.role === "Administrador" ? "users-card-role-admin" : "users-card-text";

    return (
        <div className="users-card">
            <div className="users-card-body">
                <span>
                    <p className="users-card-text">{data.email}</p>
                    <p className={roleClass}>{data.role}</p>
                </span>
                <span className="userInfo">
                    <button
                        className="users-button users-button-edit"
                        onClick={() => handleEditClick(data)}
                    >
                        <Edit size="25px"/>
                    </button>
                    <button
                        className="users-button users-button-delete"
                        onClick={() => handleDelete(data._id)}
                    >
                        <Trash size="25px"/>
                    </button>
                </span>
            </div>
        </div>
    );
};

export default CustomCard;
