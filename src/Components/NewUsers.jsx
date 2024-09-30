import React from 'react';

function NewUsers({ users = [] }) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-purple-400 border-b-2 border-gray-300 mb-4">Nuevos Usuarios</h2>
      {users.length > 0 ? (
        <ul className="space-y-2">
          {users.map((user, index) => (
            <li key={index} className="flex flex-col p-4 bg-gray-800 rounded-lg shadow-md">
              <div className="flex items-center mb-3">
                <div>
                  <p className="font-medium text-lg">{`${user.nombre} ${user.apellido}`}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400">Rol: {user.role}</p>
                </div>
              </div>
              <div className="text-gray-300">
                <p><strong>Número de Identificación:</strong> {user.numIdentificacion}</p>
                <p><strong>Teléfono:</strong> {user.telefono}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No hay nuevos usuarios esta semana.</p>
      )}
    </div>
  );
}

export default NewUsers;