"use client"

import { useState } from "react";
import { updateClient } from "@/lib/actions";

export default function ClientsCardsGrid({ projectsAndClients, countries }) {
    const [isEditing, setIsEditing] = useState("");
    const [updatedClient, setUpdatedClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const filteredCountries = countries?.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handleStartEdit = (item) => {
        setIsEditing(item._id);
        setUpdatedClient({
            _id: item._id,
            clientName: item.clientName || "",
            clientEmail: item.clientEmail || "",
            clientCountry: item.clientCountry || "",
            address: item.address || "",
            taxIdType: item.taxIdType || "",
            taxIdNumber: item.taxIdNumber || ""
        });
        setSearchTerm(item.clientCountry || "");
    }

    const selectCountry = (country) => {
        setUpdatedClient({ ...updatedClient, clientCountry: country.name });
        setSearchTerm(country.name);
        setShowDropdown(false);
    }

    const handleClientUpdate = (e) => {
        setUpdatedClient({
            ...updatedClient,
            [e.target.name]: e.target.value
        });
    }

    const handleSaveClient = async () => {
        const clientId = updatedClient._id;
        setIsEditing("");
        await updateClient(clientId, updatedClient);
        setUpdatedClient(null);
    }

    return (
        <div className="grid items-center grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {projectsAndClients?.map((item) => (
                <div key={item._id} className="w-full max-w-[400px] mx-auto aspect-square border rounded-2xl border-gray-300">
                    <div className="relative mx-auto w-2/3 text-center py-2">
                        <div className=" text-gray-500">Client Name: </div>
                        {isEditing === item._id ? (
                            <input
                                type="text"
                                name="clientName"
                                value={updatedClient?.clientName || ""}
                                onChange={handleClientUpdate}
                                className="border border-gray-300 p-1 rounded text-sm bg-white text-center w-full"
                            />
                        ) : (
                            <div className="">{item.clientName}</div>
                        )}
                        <div className="border-b border-green-200 "></div>
                    </div>
                    <div className="relative mx-auto w-2/3 text-center py-2">
                        <div className=" text-gray-500">Client Email: </div>
                        {isEditing === item._id ? (
                            <input
                                type="text"
                                name="clientEmail"
                                value={updatedClient?.clientEmail || ""}
                                onChange={handleClientUpdate}
                                className="border border-green-200 p-1 rounded text-sm bg-white text-center w-full"
                            />
                        ) : (
                            <div className="">{item.clientEmail || "No Email"}</div>
                        )}
                        <div className="border-b border-green-200 "></div>
                    </div>
                    <div className="relative mx-auto w-2/3 text-center py-2">
                        <div className=" text-gray-500">Client Country: </div>
                        {isEditing === item._id ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search country..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowDropdown(true);
                                        setUpdatedClient(prev => ({ ...prev, clientCountry: e.target.value }));
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    className="border border-green-200 p-1 rounded text-sm bg-white text-center w-full"
                                />
                                {showDropdown && filteredCountries.length > 0 && (
                                    <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto left-0">
                                        {filteredCountries.map((country) => (
                                            <li
                                                key={country.code || country._id}
                                                onClick={() => selectCountry(country)}
                                                className="px-4 py-2 hover:bg-green-50 cursor-pointer text-gray-900 border-b border-gray-100 last:border-0 text-sm text-left"
                                            >
                                                {country.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <div className="">{item.clientCountry || "N/A"}</div>
                        )}
                        <div className="border-b border-green-200 "></div>
                    </div>
                    <div className="relative mx-auto w-2/3 text-center py-2">
                        <div className=" text-gray-500">Client Address: </div>
                        {isEditing === item._id ? (
                            <input
                                type="text"
                                name="address"
                                value={updatedClient?.address || ""}
                                onChange={handleClientUpdate}
                                className="border border-green-200 p-1 rounded text-sm bg-white text-center w-full"
                            />
                        ) : (
                            <div className="">{item.address || "No Address"}</div>
                        )}
                        <div className="border-b border-green-200 "></div>
                    </div>
                    <div className="relative mx-auto w-2/3 text-center py-2">
                        <div className=" text-gray-500">Client Tax ID (Type / Number):</div>
                        {isEditing === item._id ? (
                            <div className="flex flex-col gap-1 justify-center">
                                <select
                                    name="taxIdType"
                                    value={updatedClient?.taxIdType || ""}
                                    onChange={handleClientUpdate}
                                    className="border border-green-200 p-1 rounded text-sm bg-white text-center w-1/3"
                                >
                                    <option value="">Type</option>
                                    <option value="VAT">VAT</option>
                                    <option value="EIN">EIN</option>
                                    <option value="PIB">PIB</option>
                                </select>
                                <input
                                    type="text"
                                    name="taxIdNumber"
                                    placeholder="Number"
                                    value={updatedClient?.taxIdNumber || ""}
                                    onChange={handleClientUpdate}
                                    className="border border-green-200 p-1 rounded text-sm bg-white text-center w-2/3"
                                />
                            </div>
                        ) : (
                            <div className="">
                                {item.taxIdType || "N/A"} {item.taxIdNumber ? `/ ${item.taxIdNumber}` : ""}
                            </div>
                        )}
                        <div className="border-b border-green-200 "></div>
                    </div>
                    <div className="py-2 px-2 border-t border-green-200">
                        <div className=" text-gray-500">Projects belong to:</div>
                        <div className="flex">
                            <div className="flex flex-wrap gap-2 mt-1">
                                {item.projects?.length > 0 ? (
                                    item.projects.map((proj) => (
                                        <div key={proj._id} className="border border-green-200 p-1 rounded text-sm bg-white">
                                            {proj.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-400 italic text-sm">No projects</div>
                                )}
                            </div>

                            <div className="flex-1 flex items-end justify-end">
                                <div onClick={isEditing === item._id ? handleSaveClient : () => handleStartEdit(item)} className="px-2 italic text-red-300 hover:text-red-400 active:text-red-400 cursor-pointer">{isEditing === item._id ? "Save" : "Edit"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}