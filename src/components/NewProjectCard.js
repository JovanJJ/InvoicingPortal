'use client';

import { useState } from 'react';
import { handleCreateProject } from '@/lib/actions';

export default function NewProjectCard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = async (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await handleCreateProject(formData);
        setMessage(result.message);
        setSuccess(result.success);
    }

    return (
        <div className="mt-8 relative">
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full block hover:no-underline bg-white border border-gray-200 rounded-lg p-12 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-green-400 group"
            >
                <div className="flex flex-col items-center justify-center">
                    <div className="bg-green-100 p-6 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
                        <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">New Project</h3>
                </div>
            </button>


            {isModalOpen && (
                <div className="fixed inset-0  backdrop-blur-[2px] z-40 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
            )}


            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 border border-green-400">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">New Project</h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Name
                                </label>
                                <input
                                    onChange={handleChange}
                                    name="projectName"
                                    type="text"
                                    placeholder="Enter Project name"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client Contact Name
                                </label>
                                <input
                                    onChange={handleChange}
                                    name="clientContactName"
                                    type="text"
                                    placeholder="Enter name"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client Email
                                </label>
                                <input
                                    onChange={handleChange}
                                    name="clientEmail"
                                    type="email"
                                    placeholder="Enter email"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client Country
                                </label>
                                <input
                                    onChange={handleChange}
                                    name="clientCountry"
                                    type="text"
                                    placeholder="Enter country"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Payment Type
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            onChange={handleChange}
                                            type="radio"
                                            name="paymentType"
                                            value="hourly"
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Hourly</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            onChange={handleChange}
                                            type="radio"
                                            name="paymentType"
                                            value="fixed"
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Fixed Price</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            onChange={handleChange}
                                            type="radio"
                                            name="paymentType"
                                            value="retainer"
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Retainer</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-4'>
                            {!success &&
                                <button type='submit' className="w-full bg-green-400 hover:bg-green-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors">
                                    Add
                                </button>}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                        <p className={`${success ? "text text-green-500": "text-red-400"} mt-5 w-fit mx-auto`}>{message}</p>
                    </form>
                </div>
            )}
        </div>
    );
}
