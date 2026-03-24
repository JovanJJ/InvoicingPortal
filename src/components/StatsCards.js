export default function StatsCards({ activeProjects, earnings, projectsValue, totalLoggedHours, chargeMoney }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">Received (based on active projects)</p>
            <h2 className="text-4xl font-bold text-gray-900">{earnings} USD</h2>

          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

      </div>


      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">Money to Charge</p>
            <h2 className="text-4xl font-bold text-gray-900">{chargeMoney} USD</h2>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.414l4 4 1.414-1.414A2 2 0 0120 6.828V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              <path d="M10 8a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
        </div>
        <p className="text-gray-500 text-xs">Pending invoices awaiting payment</p>
      </div>


      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">Active Projects</p>
            <h2 className="text-4xl font-bold text-gray-900">{activeProjects}</h2>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-t border-gray-100">
            <span className="text-gray-600">Total Cost</span>
            <span className="font-semibold text-gray-900">${projectsValue.projectsValue}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-gray-100">
            <span className="text-gray-600">Hours Spent</span>
            <span className="font-semibold text-gray-900">{totalLoggedHours}h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
