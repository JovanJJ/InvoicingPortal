"use client"

import { useRouter, useSearchParams } from "next/navigation"
import BuildFilterUrl from "./BuildFilterUrl"

export default function InvoicesFilter({ invoices, projectNames, clientNames }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current values for default selects
    const currentClient = searchParams.get("client") || "";
    const currentStatus = searchParams.get("status") || "";
    const currentDate = searchParams.get("date") || "";
    const currentProject = searchParams.get("project") || "";

    const handleFilterChange = (key, value) => {
        const url = BuildFilterUrl({
            [key]: value,
            searchParams: searchParams.toString()
        });
        router.push(url);
    };

    return (
        <div className="max-w-4xl mx-auto pt-10  pb-10">
            <div className="flex flex-col md:flex-row flex gap-4 ">
                <div className="border-r-2 px-2 border-green-500 mr-5 flex items-center ">Filter by</div>

                <div>
                    <div className="border border-green-400 rounded p-1">Project -
                        <select
                            value={currentProject}
                            onChange={(e) => handleFilterChange("project", e.target.value)}
                        >
                            <option value="">All</option>
                            {projectNames.map((project) => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="border border-green-400 rounded p-1">Client -
                    <select
                        value={currentClient}
                        onChange={(e) => handleFilterChange("client", e.target.value)}
                    >
                        <option value="">All</option>
                        {clientNames.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <div className="border border-green-400 rounded p-1">Status -
                        <select
                            value={currentStatus}
                            onChange={(e) => handleFilterChange("status", e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="draft">draft</option>
                            <option value="sent">sent</option>
                            <option value="partially_paid">partially_paid</option>
                            <option value="paid">paid</option>
                            <option value="overdue">overdue</option>
                        </select>
                    </div>
                </div>
                <div className="border border-green-400 rounded p-1">
                    Date -
                    <select
                        value={currentDate}
                        onChange={(e) => handleFilterChange("date", e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                </div>
            </div>
        </div >
    )
}