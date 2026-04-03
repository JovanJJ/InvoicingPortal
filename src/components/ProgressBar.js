"use client";

import { useSession } from "next-auth/react";
import { fetchProgressPercentage } from "@/lib/actions";
import { useEffect, useState } from "react";

export default function ProgressBar({ estimatedHours, seconds, projectId }) {

  const [durationSeconds, setDurationSeconds] = useState(0);
  const totalSeconds = durationSeconds + seconds;
  const percentage = (totalSeconds / 3600) / estimatedHours * 100;

  const { data: session, status } = useSession();

  const userId = session?.user?.id;
  useEffect(() => {
    if (status === "authenticated" && session.user.id) {
      const getPercantage = async () => {
        const durationInHours = await fetchProgressPercentage(projectId);
        setDurationSeconds(durationInHours * 3600);
      }
      getPercantage();
    }
  }, [userId, status, session]);


  function formatDuration(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds === null || totalSeconds === undefined) {
      return "00:00:00"
    }

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = Math.floor(totalSeconds % 60)


    const pad = (n) => String(n).padStart(2, '0')

    return `${pad(hours)}h :${pad(minutes)}m :${pad(secs)}s`
  }


  return (
    <section className="w-full py-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Progress</h3>
            <span className="text-2xl font-bold text-green-600">{!percentage? 0 : percentage.toFixed()}% <span className="text-[18px]">(Estimated hours: {estimatedHours})</span></span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <div className="mt-4 flex justify-between text-xs text-gray-600">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </section >
  );
}
