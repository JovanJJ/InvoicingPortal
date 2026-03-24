'use client';

import { useState } from 'react';
import { updateProject, updateClient } from '@/lib/actions';
import Image from 'next/image';

export default function ProjectHeader({ project, client, userImage, bankAccounts, currencies }) {
  const [selectedAccount, setSelectedAccount] = useState(project.bankAccountId);
  const [isEditing, setIsEditing] = useState(false);
  const [success, message] = useState("");
  const [formData, setFormData] = useState({
    ...project,
    clientName: client.clientName,
    startDate: getDateInputFormat(project.startDate),
    dueDate: getDateInputFormat(project.dueDate),
    taxRate: project.taxRate || 0,
    clientAddress: client.address || "",

  });
  //console.log(selectedAccount);

  function getDateInputFormat(isoDate) {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };






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
    if (formData.clientName) {
      clientName = await updateClient(formData.clientId.toString(), { clientName: formData.clientName });
    }


    const dataToUpdate = {
      name: formData.name,
      paymentType: formData.paymentType,
      rate: formData.rate,
      currency: formData.currency,
      estimatedHours: formData.estimatedHours,
      status: formData.status,
      taxRate: Number(formData.taxRate),
      bankAccountId: selectedAccount,
      clientAddress: formData.clientAddress,
    };
    if (formData.startDate) {
      dataToUpdate.startDate = new Date(formData.startDate).toISOString();
    } else {
      dataToUpdate.startDate = null;
    }
    if (formData.dueDate) {
      dataToUpdate.dueDate = new Date(formData.dueDate).toISOString();
    } else {
      dataToUpdate.dueDate = null;
    }

    const res = await updateProject(formData.projectId, dataToUpdate, formData.clientId.toString());



    setFormData({
      ...formData,
      ...res.updatedProject,
      startDate: getDateInputFormat(res.updatedProject?.startDate),
      dueDate: getDateInputFormat(res.updatedProject?.dueDate),
      clientName: clientName || formData.clientName
    });
    setIsEditing(false);

  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-4">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className='aspect-square bg-red-600 w-32 relative'>
            <Image src={userImage} alt='update image in settings' width={128} height={128} className='w-full object-cover'></Image>
          </div>

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
            <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
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
              className="w-full max-w-[100px] px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-900 disabled:cursor-default"
            />
          </div>

          <div className='max-w-[100px]'>
            <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
            {isEditing ? (
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              >
                {currencies.map((currency) => (
                  <option key={currency._id} value={currency.name}>
                    {currency.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-4 py-2 rounded-lg text-gray-900 font-semibold">
                {formData.currency}
              </div>
            )}
          </div>


          <div className='max-w-[80px]'>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rate</label>
            <div className='flex gap-2'>
              <div className='flex items-center justify-center gap-2'>
                <span className="block text-xs font-medium text-gray-600 mb-1">hourly</span>
                <input disabled={!isEditing} type="radio" name="paymentType" value="hourly" checked={formData.paymentType === 'hourly'} onChange={handleInputChange} />
              </div>
              <div className='flex items-center justify-center gap-2'>
                <span className="block text-xs font-medium text-gray-600 mb-1">fixed</span>
                <input disabled={!isEditing} type="radio" name="paymentType" value="fixed" checked={formData.paymentType === 'fixed'} onChange={handleInputChange} />
              </div>
            </div>
            {isEditing ? (
              <input
                type="text"
                name="rate"
                value={formData.rate || ""}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            ) : (
              <div className="w-full px-4 py-2 rounded-lg text-gray-900 font-semibold flex gap-5">
                {formData.rate}

              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tax Rate in percentage (%)</label>
            <input
              type="text"
              name="taxRate"
              value={formData.taxRate}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full max-w-[100px] px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-900 disabled:cursor-default"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select disabled={!isEditing} onChange={handleInputChange} value={formData.status} name='status' className='w-full max-w-[120px] px-4 py-3 border border-gray-200 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent'>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div >

            <label className="block text-xs font-medium text-gray-600 mb-1">Client Address</label>
            <input
              type="text"
              name="clientAddress"
              value={formData.clientAddress}
              onChange={handleInputChange}
              disabled={!isEditing}
              className='px-4 py-2 border border-gray-200 rounded-lg text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-900 disabled:cursor-default'
            />
          </div>

          <div className="flex items-center  justify-between gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 ">
                Bank Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full md:w-80 px-4 py-3 border border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer"
                disabled={!isEditing}
              >
                {bankAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.bankName} • {account.iban}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Selected account: <span className="font-semibold text-gray-700">{bankAccounts.find(a => a._id === selectedAccount)?.bankName}</span>
              </p>
            </div>



          </div>

          {!isEditing &&
            <button
              onClick={() => setIsEditing(true)}
              className={`max-w-[100px] px-6 py-3 font-semibold rounded-lg transition-colors bg-gray-400 hover:bg-green-400 text-white`}
            >
              Change
            </button>
          }
          {isEditing &&
            <button className={`max-w-[100px] px-6 py-3 font-semibold rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white`}
              onClick={updateInput}
            >Save</button>
          }

        </div>


      </div>
    </div>
  );
}
