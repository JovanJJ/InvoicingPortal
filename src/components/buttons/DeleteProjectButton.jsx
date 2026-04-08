"use client"
import { useState } from "react";
import { deleteProject } from "@/lib/actions";
export default function DeleteProjectButton({ projectId, projectName }) {
    const [isDelete, setIsDelete] = useState(false);

    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDelete(true);
    };

    const handleConfirmClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteProject(projectId);
    };

    const handleCancelDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDelete(false);
    };

    return (
        isDelete
            ?
            <div className="flex gap-3">
                <button onClick={handleConfirmClick} className="font-extrabold text-gray-600 hover:text-red-600 transition-colors cursor-pointer">Confirm</button>
                <button onClick={handleCancelDelete} className="font-extrabold text-gray-600 hover:text-black transition-colors cursor-pointer">Cancel</button>
            </div>
            :
            <button onClick={handleDeleteClick} className="text-red-500 hover:text-red-700 underline transition-colors">Delete {projectName}</button>
    );
}