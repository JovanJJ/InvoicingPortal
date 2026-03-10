export default function formatDurationForInvoice(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours === 0) return `${minutes}min`           
  if (minutes === 0) return `${hours}h`             
  return `${hours}h ${minutes}min`                  
}