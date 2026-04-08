import Image from "next/image";

export default function StatsCards({ activeProjects, earnings, projectsValue, totalLoggedHours, chargeMoney, currency }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">Received (based on active projects)</p>
            <h2 className="text-4xl font-bold text-gray-900">{earnings} {currency}</h2>

          </div>
          <div className="rounded-lg">
            <Image src="/coin.svg" alt="money" width={40} height={40} />
          </div>
        </div>

      </div>


      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm font-medium mb-2">Money to Charge</p>
            <h2 className="text-4xl font-bold text-gray-900">{chargeMoney} {currency}</h2>
          </div>
          <div className="rounded-lg">
            <Image src="/money-payment.svg" alt="money" width={40} height={40} />
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
          <div className="rounded-lg">
            <Image src="/active-projects.svg" alt="money" width={40} height={40} />
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-t border-gray-100">
            <span className="text-gray-600">Total Cost</span>
            <span className="font-semibold text-gray-900">{currency} {projectsValue.projectsValue}</span>
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
