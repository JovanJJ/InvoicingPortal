"use client";

import { commitMessage } from "@/lib/actions";
import { useState } from "react";
import Loading from "@/app/loading";

export default function OpenDescription({ handleStop, setOpenDescription, setIsModalOpen, handleResume, setMessage, message, timerId, wasRunning }) {
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    setMessage(e.target.value);
  }

  const handleCommit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await commitMessage(message, timerId);
      await handleStop();
      setOpenDescription(false);
    } finally {
      setIsLoading(false);
    }
  }


  return (
    isLoading ? (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm">
        <Loading />
      </div>
    )
      :
      (
        <div className="fixed inset-0 backdrop-blur-[2px] z-40 transition-opacity">
          <div className="flex items-center justify-center h-full w-full z-50 border border-green-400">
            <form className="bg-white p-6 rounded-lg shadow-lg z-50 border border-green-400 max-w-xl w-full">
              <h2 className="text-lg font-semibold mb-4 z-50">Describe what you did</h2>
              <textarea
                onChange={handleChange}
                className='outline-none border border-gray-400 p-2 w-full rounded-xs min-h-[150px]'>

              </textarea>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleCommit}
                  className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                >
                  Commit
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsModalOpen(false);
                    setOpenDescription(false);
                    if (wasRunning) {
                      await handleResume();
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )
  );
}