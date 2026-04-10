"use client"

import formatDurationForInvoice from "./FormatDurationForInvoice";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/app/loading";
import { updateEntry, deleteTimeEntry, calculateProjectValue, calculateLogedHours } from "@/lib/actions";

export default function CommitsList({ lineItems }) {
  const router = useRouter();
  const [isDelete, setIsDelete] = useState(false);
  const [isEditing, setIsEditing] = useState("");
  const [formData, setFormData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  //const [commitList, setCommitList] = useState(false);


  useEffect(() => {

    setFormData(
      lineItems.map((entry) => {
        return {
          _id: entry._id.toString(),
          projectId: entry.projectId,
          billable: entry.billable,
          duration: entry.duration,
          description: entry.description,
          invoiceId: entry.invoiceId,
          createdAt: new Date(entry.createdAt).toISOString().split('T')[0],
          updatedAt: new Date(entry.updatedAt).toISOString().split('T')[0],
        }
      })
    );
  }, [lineItems]);
  const formatDateLocal = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  };

  const handleChange = (e, id) => {
    setFormData((prev) => {
      return prev.map((entry) => {
        if (entry._id === id) {
          return {
            ...entry,
            [e.target.name]: e.target.value
          }
        } else {
          return entry
        }
      });
    })
  }

  const pluckEntry = async (id, projectId) => {
    try {
      setIsLoading(true)
      const updates = formData.find(entry => entry._id === id);
      await updateEntry(updates);
      await calculateLogedHours(projectId);
      await calculateProjectValue(projectId);
      setIsEditing(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }

  }

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      await deleteTimeEntry(id);
      setIsEditing("");
      setIsDelete("");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }


  return (
    isLoading ? (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm">
        <Loading />
      </div>
    ) : (
      <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
        <h3 className="text-lg font-bold text-gray-900 ">Work Log</h3>
        <span className="block mb-6 text-[14px] text-gray-500">You can change logs when you edit invoice preview</span>

        <div className="space-y-6  max-h-96 overflow-y-auto">
          {lineItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No commits yet. Stop the stopwatch to log your work.
            </p>
          ) : (
            [...formData].reverse().map((commit, index) => (
              <div
                key={index}
                className="border-l-4 border-b-4 border-green-500 bg-gray-50 rounded p-4 pr-0 hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between gap-3 mb-1">
                  {isEditing === commit._id
                    ?
                    <div className="flex flex-col">
                      <span className="text-gray-500">minutes</span>
                      <input type="text" name="duration" value={commit.duration} onChange={(e) => handleChange(e, commit._id)} placeholder="duration in minutes" className="border text-center w-fit outline-none rounded p-1 max-w-37 border-gray-300" />
                    </div>
                    :
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDurationForInvoice(commit.duration * 60)}
                    </p>
                  }
                  <div className="flex gap-3">
                    {!isDelete && !isEditing && <p onClick={() => setIsEditing(commit._id.toString())} className="text-gray-600 hover:text-black cursor-pointer">edit</p>}
                    {isEditing === commit._id &&
                      <div className="flex gap-3">
                        <p onClick={() => pluckEntry(commit._id, commit.projectId)} className="text-green-500 hover:text-green-700 cursor-pointer">update</p>
                        <p onClick={() => setIsEditing(false)} className="text-red-500 hover:text-red-700 cursor-pointer">cancel</p>
                      </div>}
                    {isDelete === commit._id &&
                      <div className="flex gap-3">
                        <p onClick={() => handleDelete(commit._id)} className="text-red-400 hover:text-red-600 cursor-pointer">confirm</p>
                        <p onClick={() => setIsDelete(false)} className="text-gray-600 hover:text-black cursor-pointer">cancel</p>
                      </div>
                    }
                    {!isEditing && !isDelete && <p onClick={() => setIsDelete(commit._id)} className="text-red-400 hover:text-red-600 cursor-pointer">delete</p>}
                  </div>
                </div>
                {isEditing === commit._id
                  ?
                  <div className="flex flex-col">
                    <span className="text-gray-500">date</span>
                    <input type="date" name="updatedAt" value={commit.updatedAt || commit.createdAt} onChange={(e) => handleChange(e, commit._id)} className="block border border-gray-300 rounded p-1 mb-1" />
                  </div>
                  :
                  <p className="text-xs text-gray-600">{commit.updatedAt || commit.createdAt}</p>
                }
                {isEditing === commit._id
                  ?
                  <div className="flex flex-col">
                    <span className="text-gray-500">description</span>
                    <textarea name="description" value={commit.description} onChange={(e) => handleChange(e, commit._id)} className="outline-none border border-gray-300 rounded p-1 w-full sm:w-2/3" />
                  </div>
                  :
                  <p className="mt-5">{commit.description}</p>
                }
              </div>
            ))
          )}
        </div>
      </div >
    )
  );
}
