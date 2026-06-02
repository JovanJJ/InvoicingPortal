'use client';

import { useState } from 'react';
import { handleCreateProject } from '@/lib/actions';
import Image from 'next/image';
import Loading from '@/app/loading';

export default function NewProjectCard({ countries }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredCountries = countries?.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const selectCountry = (country) => {
        setFormData({ ...formData, clientCountry: country.name });
        setSearchTerm(country.name);
        setShowDropdown(false);
    }

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


                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Client Country
                                </label>
                                <input
                                    type="text"
                                    placeholder="Select or search country..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowDropdown(true);
                                        setFormData(prev => ({ ...prev, clientCountry: e.target.value }));
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                />
                                {showDropdown && filteredCountries.length > 0 && (
                                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredCountries.map((country) => (
                                            <li
                                                key={country.code || country._id}
                                                onClick={() => selectCountry(country)}
                                                className="px-4 py-2 hover:bg-green-50 cursor-pointer text-gray-900 border-b border-gray-100 last:border-0 text-sm"
                                            >
                                                {country.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
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
