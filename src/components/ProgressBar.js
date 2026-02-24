export default function ProgressBar() {
  const progress = 45;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Progress</h3>
        <span className="text-2xl font-bold text-green-600">{progress}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="mt-4 flex justify-between text-xs text-gray-600">
        <span>0%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
