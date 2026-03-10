'use client';

import { useState, useEffect, useRef } from 'react';
import { startTimer, pauseTimer, resumeTimer, stopTimer, getRunningTimer, commitMessage, fetchCommitMessages, abortTimer } from '@/lib/actions';
import OpenDescription from './project/OpenDescriptionHtml';
import IsModalOpen from './project/IsModalOpen';
import ProjectPageHtml from './project/ProjectPageHtml';
import ProgressBar from './ProgressBar';
import GenerateInvoiceButton from './PDF/PdfButton';

export default function Stopwatch({ projectId, userId, project, client, userData }) {
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
  const [user, setUser] = useState({});

console.log(seconds);
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
      const { list, success } = await fetchCommitMessages(projectId);
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

  const handleAbort = async () => {
    const deleted = await abortTimer(timerId);
    setTimerId(null);
    setStartedAt(0);
    setAccumulatedSeconds(0);
    setSeconds(0);
    setStatus("noWatch");
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
        <OpenDescription handleStop={handleStop} setOpenDescription={setOpenDescription} setIsModalOpen={setIsModalOpen} handleResume={handleResume} setMessage={setMessage} message={message} timerId={timerId} wasRunning={wasRunning} />
      }
      {isModalOpen &&
        <IsModalOpen setOpenDescription={setOpenDescription} setIsModalOpen={setIsModalOpen} handleResume={handleResume} wasRunning={wasRunning} />
      }
      <ProjectPageHtml status={status} handleStart={handleStart} handlePause={handlePause} commitList={commitList} setWasRunning={setWasRunning} setIsModalOpen={setIsModalOpen} handleResume={handleResume} seconds={seconds} handleAbort={handleAbort} />
      <ProgressBar estimatedHours={project.estimatedHours} seconds={seconds} />
      <GenerateInvoiceButton project={project} client={client} timeEntries={commitList} user={userData} />
    </>
  );
}
