"use client";


export default function IsModalOpen({setOpenDescription, setIsModalOpen, handleResume, wasRunning}) {
    return(
        <div className="fixed inset-0 backdrop-blur-[2px] z-40 transition-opacity">
          <div className="flex items-center justify-center h-full w-full z-50 border border-green-400">
            <div className="bg-white p-6 rounded-lg shadow-lg z-50 border border-green-400">
              <h2 className="text-lg font-semibold mb-4 z-50">Stop Timer</h2>
              <p className="z-50">Are you sure you want to stop the timer and commit message?</p>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-green-500 cursor-pointer text-white px-4 py-2 rounded mr-2"
                  onClick={() => {setOpenDescription(true); setIsModalOpen(false)}}
                >
                  Yes
                </button>
                <button
                  className="bg-gray-200 text-black px-4 py-2 rounded"
                  onClick={async () => {
                    setIsModalOpen(false);
                    if (wasRunning) {
                      await handleResume();
                    }
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
    );
}