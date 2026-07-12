import React, { useState } from 'react';
import { Save, Shield } from 'lucide-react';

const Settings = () => {
  const roles = ['Admin', 'Manager', 'Dispatcher', 'Driver'];
  
  const [permissions, setPermissions] = useState([
    { resource: 'Dashboard', admin: true, manager: true, dispatcher: true, driver: false },
    { resource: 'Vehicles', admin: true, manager: true, dispatcher: true, driver: false },
    { resource: 'Drivers', admin: true, manager: true, dispatcher: true, driver: false },
    { resource: 'Trips', admin: true, manager: true, dispatcher: true, driver: true },
    { resource: 'Maintenance', admin: true, manager: true, dispatcher: false, driver: false },
    { resource: 'Fuel & Expenses', admin: true, manager: true, dispatcher: false, driver: true },
    { resource: 'Reports', admin: true, manager: true, dispatcher: false, driver: false },
    { resource: 'Settings', admin: true, manager: false, dispatcher: false, driver: false },
  ]);

  const togglePermission = (index, role) => {
    const newPermissions = [...permissions];
    newPermissions[index][role.toLowerCase()] = !newPermissions[index][role.toLowerCase()];
    setPermissions(newPermissions);
  };

  const handleSave = () => {
    // Ideally this would make a PUT/POST request to a settings/roles API
    alert('Permissions saved successfully!');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500 mt-1">Manage system configurations and access control.</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
        >
          <Save size={18} className="mr-2" />
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center bg-gray-50">
          <Shield className="text-indigo-600 mr-2" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">RBAC Permission Matrix</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold text-sm">Resource / Module</th>
                {roles.map(role => (
                  <th key={role} className="px-6 py-3 border-b border-gray-200 text-gray-600 font-semibold text-sm text-center">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm, idx) => (
                <tr key={perm.resource} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b border-gray-200 text-sm font-medium text-gray-700">
                    {perm.resource}
                  </td>
                  {roles.map(role => {
                    const roleKey = role.toLowerCase();
                    return (
                      <td key={roleKey} className="px-6 py-4 border-b border-gray-200 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out cursor-pointer"
                            checked={perm[roleKey]}
                            onChange={() => togglePermission(idx, role)}
                            disabled={role === 'Admin'} // Admin always has full access
                          />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;
