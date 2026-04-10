import { projectProgressPercentage, fetchPaymentPercentage } from "@/lib/actions";
import DeleteProjectButton from "./buttons/DeleteProjectButton";

export default async function PaymentProgressBar({ project, projectId }) {
    const paymentDetails = await fetchPaymentPercentage(projectId);
    const percentage = await projectProgressPercentage(projectId);
    const { fixedRate, currency, totalPaid, paymentPercentage } = paymentDetails;

    const getStatusColor = (status) => {
        return status === "active"
            ? "bg-blue-100 text-blue-800"
            : "bg-green-100 text-green-800";
    };

    const getStatusText = (status) => {
        return status === "active" ? "Active" : "Done";
    };

    return (
        project.paymentType === "hourly" ? (
            <a
                href={`/projects/${project._id}`}
                className="block group hover:no-underline"
            >
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                    {project.name}
                                </h3>
                                <DeleteProjectButton projectId={project._id.toString()} projectName={project.name} />
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{project.clientId.clientName}</p>
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
                                Progress based on estimated hours
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {percentage || 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>

                </div>
            </a>

        ) : (
            <a

                href={`/projects/${project._id}`}
                className="block group hover:no-underline"
            >
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                    {project.name}
                                </h3>
                                <DeleteProjectButton projectId={project._id.toString()} projectName={project.name} />
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{project.clientId.clientName}</p>
                            <div className="flex items-center gap-4">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                        project.status
                                    )}`}
                                >
                                    {getStatusText(project.status)}
                                </span>
                                <span className="text-sm text-gray-600">
                                    <strong>{project.totalLoggedHours}</strong> hours spent,
                                </span>
                                <span className="text-sm text-gray-600">
                                    Project rate: {fixedRate}{currency.toLowerCase()},
                                </span>
                                <span className="text-sm text-gray-600">
                                    Total paid: {totalPaid}{currency.toLowerCase()},
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-gray-600">
                                Based on payments progress
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                                {paymentPercentage || 0}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${paymentPercentage || 0}%` }}
                            ></div>
                        </div>
                    </div>



                </div>
            </a>
        )

    )


}
