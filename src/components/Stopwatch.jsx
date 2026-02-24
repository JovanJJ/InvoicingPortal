'use client';

import { useState, useEffect, useRef } from 'react';
import CommitsList from './CommitsList';
import { startTimer, pauseTimer, resumeTimer, stopTimer, getRunningTimer, commitMessage, fetchCommitMessages } from '@/lib/actions';
import formatDuration from './formatDuration';

export default function Stopwatch({ projectId, userId }) {
  const [timerId, setTimerId] = useState(null);
  const [status, setStatus] = useState("noWatch");
  const [seconds, setSeconds] = useState(0);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startedAt, setStartedAt] = useState(0);
  const [serverOffset, setServerOffset] = useState(0);
  const intervalRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wasRunning, setWasRunning] = useState(false);
  const [openDescription, setOpenDescription] = useState(false);
  const [message, setMessage] = useState("");
  const [commitList, setCommitList] = useState([]);
  const [updateList, setUpdateList] = useState(false);
  
  
  useEffect(() => {
    async function checkExistingTimer() {
      if (!projectId) return;
      const existing = await getRunningTimer(projectId)

      if (!existing) {
        setLoading(false)
        return
      }

      setTimerId(existing._id)
      setAccumulatedSeconds(existing.accumulatedSeconds)

      const clientNow = Date.now()
      const serverNow = new Date(existing.serverTime).getTime()
      const drift = serverNow - clientNow
      setServerOffset(drift)

      if (existing.status === 'running') {
        const startTime = new Date(existing.timerStartedAt).getTime()
        setStartedAt(startTime)

        const sessionSeconds = Math.floor((clientNow + drift - startTime) / 1000)
        setSeconds(existing.accumulatedSeconds + sessionSeconds)
        setStatus('running')
      }

      if (existing.status === 'paused') {
        setSeconds(existing.accumulatedSeconds)
        setStatus('paused')
      }

      setLoading(false)
    }

    checkExistingTimer()
  }, [projectId])


  useEffect(() => {
    const getCommitMessages = async () => {
      const {list, success} = await fetchCommitMessages(projectId);
      setCommitList(list);
    }
    getCommitMessages();
  }, []);


  useEffect(() => {
    if (status !== 'running' || !startedAt) return

    intervalRef.current = setInterval(() => {
      const currentClientTime = Date.now()
      const sessionSeconds = Math.floor(
        (currentClientTime + serverOffset - startedAt) / 1000
      )
      setSeconds(accumulatedSeconds + sessionSeconds)
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [status, startedAt, accumulatedSeconds, serverOffset])

 
  const handleChange = (e) => {
    setMessage(e.target.value);
  }


  const handleStart = async () => {
    const entry = await startTimer(projectId, userId);
    setTimerId(entry.timerId)
    setStartedAt(new Date(entry.startedAt).getTime())
    setAccumulatedSeconds(0)
    setSeconds(0)
    setStatus('running')

  }

  const handlePause = async () => {
    const accumulated = await pauseTimer(timerId)
    clearInterval(intervalRef.current)
    setAccumulatedSeconds(accumulated)
    setSeconds(accumulated)
    setStartedAt(null)
    setStatus('paused')
  }

  const handleResume = async () => {
    const { accumulatedSeconds: acc, timerStartedAt } = await resumeTimer(timerId)
    setAccumulatedSeconds(acc)
    setStartedAt(new Date(timerStartedAt).getTime())
    setStatus('running')

  }

  const handleStop = async () => {
    const totalDuration = await stopTimer(timerId)
    clearInterval(intervalRef.current)
    setSeconds(0)
    setTimerId(null)
    setStartedAt(null)
    setAccumulatedSeconds(0)
    setStatus('noWatch')
    setIsModalOpen(false)
  }
  if (loading) return <div>Loading timer...</div>

  return (
    <>
    {openDescription &&
    <div className="fixed inset-0 backdrop-blur-[2px] z-40 transition-opacity">
          <div className="flex items-center justify-center h-full w-full z-50 border border-green-400">
            <form className="bg-white p-6 rounded-lg shadow-lg z-50 border border-green-400 max-w-xl w-full">
              <h2 className="text-lg font-semibold mb-4 z-50">Description</h2>
              <textarea 
              onChange={handleChange}
              className='outline-none border border-gray-400 p-2 w-full rounded-xs min-h-[150px]'>

              </textarea>
              <div className="flex justify-end mt-4">
                <button
                onClick={
               async () => {
               await commitMessage(message, timerId);
               await handleStop();
               
               setOpenDescription(false);
               }
                }
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
    }
      {isModalOpen &&
        <div className="fixed inset-0 backdrop-blur-[2px] z-40 transition-opacity">
          <div className="flex items-center justify-center h-full w-full z-50 border border-green-400">
            <div className="bg-white p-6 rounded-lg shadow-lg z-50 border border-green-400">
              <h2 className="text-lg font-semibold mb-4 z-50">Stop Timer</h2>
              <p className="z-50">Are you sure you want to stop the timer?</p>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => {setOpenDescription(true); setIsModalOpen(false)}}
                >
                  Stop
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
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
      }
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">

                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="#ECFDF5"
                  stroke="#E0F2FE"
                  strokeWidth="2"
                />

                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 90}`}
                  strokeDashoffset={`${2 * Math.PI * 90 * 0.3}`}
                />
              </svg>


              <div className="absolute inset-0 flex items-center justify-center">
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
                  <button className='bg-blue-500 text-white px-4 py-2 rounded' onClick={handlePause}>Pause</button>
                  <button
                    className='bg-red-500 text-white px-4 py-2 rounded'
                    onClick={async () => {
                      setWasRunning(true);
                      await handlePause();
                      setIsModalOpen(true);
                    }}
                  >
                    Stop
                  </button>
                </>
              )}

              {status === 'paused' && (
                <>
                  <button className='bg-green-500 text-white px-4 py-2 rounded' onClick={handleResume}>Resume</button>
                  <button
                    className='bg-red-500 text-white px-4 py-2 rounded'
                    onClick={() => {
                      setWasRunning(false);
                      setIsModalOpen(true);
                    }}
                  >
                    Stop
                  </button>
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
