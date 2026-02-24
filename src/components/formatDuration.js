export default function formatDuration(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds === null || totalSeconds === undefined) {
      return "00:00:00"
    }

    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = Math.floor(totalSeconds % 60)

    
    const pad = (n) => String(n).padStart(2, '0')

    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
  }