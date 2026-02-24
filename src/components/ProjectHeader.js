'use client';

import { useState } from 'react';
import { updateProject, updateClient } from '@/lib/actions';

export default function ProjectHeader({ project, client }) {
  const [ selectedAccount, setSelectedAccount ] = useState('stripe');
  const [ isEditing, setIsEditing ] = useState(false);
  const [ success, message ] = useState("");
  const [ formData, setFormData ] = useState({
    ...project,
    clientName: client.clientName,
    startDate: getDateInputFormat(project.startDate),
    
  });
  


  // Convert startDate to YYYY-MM-DD format for input field
  function getDateInputFormat  (isoDate) {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  

  
  const bankAccounts = [
    {
      id: 'stripe',
      name: 'Stripe Express',
      accountNum: '****1234',
    },
    {
      id: 'paypal',
      name: 'PayPal Business',
      accountNum: '****5678',
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateInput = async (e) => {
    e.preventDefault();
    let clientName;
    if(formData.clientName){
        clientName = await updateClient(formData.clientId.toString(), {clientName: formData.clientName});   
    }
    
    
    
    const dataToUpdate = {
      name: formData.name,
      paymentType: formData.paymentType,
      rate: formData.rate,
      currency: formData.currency,
      estimatedHours: formData.estimatedHours,
      status: formData.status,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : formData.startDate
    };
    
    const res = await updateProject(formData.projectId, dataToUpdate);
    
      
    setFormData({
      ...formData,
      ...res.updatedProject,
      startDate: getDateInputFormat(res.updatedProject.startDate),
      clientName: clientName || formData.clientName
    });
    setIsEditing(false);
    
  } 
 
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4"> 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

             <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Project Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            ) : (
              <div className="w-full px-4 py-2 rounded-lg text-gray-900 font-semibold">
                {formData.name}
              </div>
            )}
          </div>
         
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Project Belongs To</label>
             {isEditing ? (
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            ) : (
              <div className="w-full px-4 py-2 rounded-lg text-gray-900 font-semibold">
                {client.clientName}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-900 disabled:cursor-default"
            />
          </div>
  
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Hours</label>
            <input
              onChange={handleInputChange}
              value={formData.estimatedHours}
              type="number"
              name="estimatedHours"
              disabled={!isEditing}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-900 disabled:cursor-default"
            />
          </div>
          
          <div className='max-w-[80px]'>
            <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
            {isEditing ? (
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            ) : (
              <div className="w-full px-4 py-2 rounded-lg text-gray-900 font-semibold">
                {formData.currency}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Account
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full md:w-80 px-4 py-3 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer"
              disabled={!isEditing}
            >
              {bankAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} • {account.accountNum}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selected account: <span className="font-semibold text-gray-700">{bankAccounts.find(a => a.id === selectedAccount)?.name}</span>
            </p>
          </div>

            {!isEditing &&
          <button
            onClick={() => setIsEditing(true)}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors bg-gray-400 hover:bg-green-400 text-white`}
          >
            Change
          </button>
          }
          {isEditing && 
          <button className={`px-6 py-3 font-semibold rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white`}
          onClick={updateInput}
          >Save</button>
          }
          
        </div>
      </div>
    </div>
  );
}
