"use client"
import { useState } from "react";
import { deleteProject } from "@/lib/actions";
import Loading from "@/app/loading";
export default function DeleteProjectButton({ projectId, projectName }) {
    const [isDelete, setIsDelete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleDeleteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDelete(true);
    };

    const handleConfirmClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            setIsLoading(true);
            await deleteProject(projectId);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDelete(false);
    };

    return (
        isLoading ? (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm">
                <Loading />
            </div>
        ) :
            isDelete
                ?
                <div className="flex gap-3">
                    <button onClick={handleConfirmClick} disabled={isLoading} className="font-extrabold text-gray-600 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Confirm</button>
                    <button onClick={handleCancelDelete} disabled={isLoading} className="font-extrabold text-gray-600 hover:text-black transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
                </div>
                :
                <button onClick={handleDeleteClick} disabled={isLoading} className="text-red-500 hover:text-red-700 underline transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Delete</button>
    );
}
