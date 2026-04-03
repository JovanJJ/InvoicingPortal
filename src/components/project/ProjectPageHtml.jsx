"use client";

import { useState } from "react";
import formatDuration from "../formatDuration";
import CommitsList from "../CommitsList";
import watchFrame from "../../../public/watch-frame.png";
import Image from "next/image";

export default function ProjectPageHtml({ status, handleStart, handlePause, commitList, setWasRunning, setIsModalOpen, handleResume, seconds, handleAbort }) {
    const [abortMessage, setAbortMessage] = useState(false);
    return (
        <>
            {abortMessage &&
                <div className="fixed inset-0 backdrop-blur-[2px] z-40 transition-opacity">
                    <div className="flex items-center justify-center h-full w-full z-50 border border-green-400">
                        <div className="bg-white p-6 rounded-lg shadow-lg z-50 border border-green-400">

                            <p className="z-50">Are you sure you want to abort timer? Your work log wont be saved.</p>
                            <div className="flex justify-end mt-4">
                                <button
                                    className="bg-green-500 cursor-pointer text-white px-4 py-2 rounded mr-2"
                                    onClick={async () => {
                                        await handleAbort();
                                        setAbortMessage(false);
                                    }}
                                >
                                    Yes
                                </button>
                                <button
                                    className="bg-gray-200 text-black px-4 py-2 rounded cursor-pointer"
                                    onClick={() => setAbortMessage(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div >
            }
            <div className="w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <div className="flex flex-col items-center justify-center">
                        <div className="relative w-80 h-80 ">
                            <Image src={watchFrame} alt="img" fill />


                            <div className="absolute inset-0 top-8 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-gray-900">
                                        {formatDuration(seconds)}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">{status}</p>
                                </div>
                            </div>
                        </div>


                        <div className="flex gap-3">
                            {status === 'noWatch' && (
                                <button className='bg-green-500 text-white px-4 py-2 rounded' onClick={handleStart}>Start</button>
                            )}

                            {status === 'running' && (
                                <>
                                    <button className='bg-yellow-400 text-white px-4 py-2 rounded' onClick={handlePause}>Pause</button>
                                    <button
                                        className='bg-gray-500 text-white px-4 py-2 rounded'
                                        onClick={async () => {
                                            setWasRunning(true);
                                            await handlePause();
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        Stop
                                    </button>
                                    <button onClick={() => setAbortMessage(true)} className='bg-red-500 text-white px-4 py-2 rounded'>Abort</button>
                                </>
                            )}

                            {status === 'paused' && (
                                <>
                                    <button className='bg-yellow-400 text-white px-4 py-2 rounded' onClick={handleResume}>Resume</button>
                                    <button
                                        className='bg-gray-500 text-white px-4 py-2 rounded'
                                        onClick={() => {
                                            setWasRunning(false);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        Stop
                                    </button>
                                    <button onClick={() => setAbortMessage(true)} className='bg-red-500 text-white px-4 py-2 rounded'>Abort</button>
                                </>
                            )}
                        </div>
                    </div>

                    <CommitsList commitList={commitList} />
                </div>
            </div>
        </>
    );
}