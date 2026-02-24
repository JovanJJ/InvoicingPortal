export default function ProjectsList({projects}) {
  

  const getStatusColor = (status) => {
    return status === "active"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  const getStatusText = (status) => {
    return status === "active" ? "Active" : "Done";
  };
  const paidPercentage = '60'

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Projects List</h2>
        
        <div className="flex items-center gap-4 flex-1 max-w-2xl ml-8">
          <input
            type="text"
            placeholder="Search by status or client name..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
          />
          <input
            type="date"
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        {projects.map((project) => {
          return(
            <a
            key={project._id}
            href={`/projects/${project._id}`}
            className="block group hover:no-underline"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{project.clientName}</p>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {getStatusText(project.status)}
                    </span>
                    <span className="text-sm text-gray-600">
                      <strong>{project.totalLoggedHours}</strong> hours spent
                    </span>
                  </div>
                </div>
              </div>

              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-600">
                    Payment Progress
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {paidPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${paidPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </a>
          );
          
        })}
      </div>
    </div>
  );
}
