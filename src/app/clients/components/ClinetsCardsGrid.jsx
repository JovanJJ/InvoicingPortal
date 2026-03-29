"use client"

import { useState } from "react";
import { updateClient } from "@/lib/actions";

export default function ClientsCardsGrid({ projectsAndClients }) {
    const [isEditing, setIsEditing] = useState("");
    const [updatedClient, setUpdatedClient] = useState(null);

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
                <div key={item._id} className="w-full max-w-[400px] mx-auto aspect-square border rounded-2xl border-green-200 bg-blue-50">
                    <div className="relative mx-auto w-2/3 text-center py-2">
                        <div className=" text-gray-500">Client Name: </div>
                        {isEditing === item._id ? (
                            <input
                                type="text"
                                name="clientName"
                                value={updatedClient?.clientName || ""}
                                onChange={handleClientUpdate}
                                className="border border-green-200 p-1 rounded text-sm bg-white text-center w-full"
                            />
                        ) : (
                            <div className="">{item.clientName}</div>
                        )}
                        <div className="border-b border-green-200 "></div>
                        <div onClick={isEditing === item._id ? handleSaveClient : () => handleStartEdit(item)} className="absolute top-1/2 px-2 right-0 italic text-red-300 hover:text-red-400 active:text-red-400 cursor-pointer">{isEditing === item._id ? "Save" : "Edit"}</div>
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
                        <div onClick={isEditing === item._id ? handleSaveClient : () => handleStartEdit(item)} className="absolute top-1/2 px-2 right-0 italic text-red-300 hover:text-red-400 active:text-red-400 cursor-pointer">{isEditing === item._id ? "Save" : "Edit"}</div>
                    </div>
                    <div className="relative mx-auto w-2/3 text-center py-2">
                        <div className=" text-gray-500">Client Country: </div>
                        {isEditing === item._id ? (
                            <input
                                type="text"
                                name="clientCountry"
                                value={updatedClient?.clientCountry || ""}
                                onChange={handleClientUpdate}
                                className="border border-green-200 p-1 rounded text-sm bg-white text-center w-full"
                            />
                        ) : (
                            <div className="">{item.clientCountry || "N/A"}</div>
                        )}
                        <div className="border-b border-green-200 "></div>
                        <div onClick={isEditing === item._id ? handleSaveClient : () => handleStartEdit(item)} className="absolute top-1/2 px-2 right-0 italic text-red-300 hover:text-red-400 active:text-red-400 cursor-pointer">{isEditing === item._id ? "Save" : "Edit"}</div>
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
                        <div onClick={isEditing === item._id ? handleSaveClient : () => handleStartEdit(item)} className="absolute top-1/2 px-2 right-0 italic text-red-300 hover:text-red-400 active:text-red-400 cursor-pointer">{isEditing === item._id ? "Save" : "Edit"}</div>
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
                        <div onClick={isEditing === item._id ? handleSaveClient : () => handleStartEdit(item)} className="absolute top-1/2 px-2 right-0 italic text-red-300 hover:text-red-400 active:text-red-400 cursor-pointer">{isEditing === item._id ? "Save" : "Edit"}</div>
                    </div>
                    <div className="py-2 px-2 border-t border-green-200">
                        <div className=" text-gray-500">Projects belong to:</div>
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
                    </div>
                </div>
            ))}
        </div>
    );
}