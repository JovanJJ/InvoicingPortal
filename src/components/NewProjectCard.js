'use client';

import { useState } from 'react';
import { handleCreateProject } from '@/lib/actions';
import Image from 'next/image';
import Loading from '@/app/loading';

export default function NewProjectCard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);

        try {
            const result = await handleCreateProject(formData);
            setMessage(result?.message || "");
            setSuccess(result?.success || false);

            if (result?.success) {
                setTimeout(() => {
                    setMessage("");
                    setSuccess("");
                    setIsModalOpen(false);
                    setFormData({});
                }, 4000);
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="mt-8 relative">
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full block hover:no-underline bg-white border border-gray-200 rounded-lg p-12 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-green-400 group"
            >
                <div className="flex flex-col items-center justify-center">
                    <div className="bg-green-100 p-6 rounded-lg mb-4 group-hover:bg-green-200 transition-colors">
                        <Image src="/add-project.svg" alt="money" width={70} height={70} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">New Project</h3>
                </div>
            </button>


            {isModalOpen && (
                <div className="fixed inset-0  backdrop-blur-[2px] z-40 transition-opacity" onClick={() => !isLoading && setIsModalOpen(false)}></div>
            )}


            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleSubmit} className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-8 border border-green-400">
                        {isLoading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/60 backdrop-blur-sm">
                                <Loading />
                            </div>
                        )}
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">New Project</h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Project Name
                                </label>
                                <input
                                    onChange={handleChange}
                                    value={formData.projectName || ""}
                                    name="projectName"
                                    type="text"
                                    placeholder="Enter Project name"
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client Contact Name
                                </label>
                                <input
                                    onChange={handleChange}
                                    value={formData.clientContactName || ""}
                                    name="clientContactName"
                                    type="text"
                                    placeholder="Enter name"
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client Email
                                </label>
                                <input
                                    onChange={handleChange}
                                    value={formData.clientEmail || ""}
                                    name="clientEmail"
                                    type="email"
                                    placeholder="Enter email"
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client Country
                                </label>
                                <input
                                    onChange={handleChange}
                                    value={formData.clientCountry || ""}
                                    name="clientCountry"
                                    type="text"
                                    placeholder="Enter country"
                                    disabled={isLoading}
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
                                            checked={formData.paymentType === "hourly"}
                                            disabled={isLoading}
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
                                            checked={formData.paymentType === "fixed"}
                                            disabled={isLoading}
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
                                            checked={formData.paymentType === "retainer"}
                                            disabled={isLoading}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Retainer</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className='flex gap-4'>
                            {!success &&
                                <button type='submit' disabled={isLoading} className="w-full bg-green-400 hover:bg-green-300 disabled:bg-green-200 disabled:cursor-not-allowed text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors">
                                    {isLoading ? "Creating..." : "Add"}
                                </button>}
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isLoading}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                        <p className={`${success ? "text text-green-500" : "text-red-400"} mt-5 w-fit mx-auto`}>{message}</p>
                    </form>
                </div>
            )}
        </div>
    );
}
