export default function HoursChart() {
  const mockData = [
    { day: 'Mon', hours: 4 },
    { day: 'Tue', hours: 6 },
    { day: 'Wed', hours: 8 },
    { day: 'Thu', hours: 5 },
    { day: 'Fri', hours: 7 },
    { day: 'Sat', hours: 3 },
    { day: 'Sun', hours: 2 },
  ];

  const maxHours = Math.max(...mockData.map((d) => d.hours));
  const totalHours = mockData.reduce((sum, d) => sum + d.hours, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-8">Hours Worked</h3>

      <div className="flex items-end justify-center gap-3 h-64 mb-8">
        {mockData.map((item, index) => {
          const barHeight = (item.hours / maxHours) * 100;
          return (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div className="relative w-full flex items-end justify-center h-48">
                <div className="w-full bg-gray-200 rounded-t-lg transition-all duration-300 hover:bg-green-400" style={{ height: `${barHeight}%` }}>
                  <div className="w-full h-full bg-green-500 rounded-t-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-white rotate-180" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                      {item.hours}h
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">{item.day}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600 mb-1">Total Hours This Week</p>
        <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
      </div>
    </div>
  );
}
