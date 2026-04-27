"use client"

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Loading from "@/app/loading";

export default function DashStatsPerProject({ projects, projectStats, currency }) {
    const [isPending, startTransition] = useTransition();
    const { projectValue, totalPaid, moneyToCharge } = projectStats.dashStats;
    const router = useRouter();

    const handleStatsQuery = (e) => {
        const q = e.target.value;
        startTransition(() => {
            if (q) {
                router.push(`/projects?stats=${q}`);
            } else {
                router.push(`/projects`);
            }
        });
    }


    return (
        <div className="mt-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md p-5 transition-shadow">
            <h2 className="text-2xl font-bold text-gray-900">Stats per project</h2>
            <div className="flex flex-col md:flex-row gap-5 mt-2 ">
                <div className="flex gap-3">
                    <div className="">Project:</div>
                    <select
                        className="outline-none border rounded border-gray-300"
                        onChange={handleStatsQuery}
                    >
                        <option value="">Select</option>
                        {
                            projects.map((project) => (
                                <option key={project._id || ""} value={project._id || ""}>{project.name || ""}</option>
                            ))
                        }
                    </select>
                </div>
                {isPending ?
                    <div className="flex items-center gap-3 px-6 py-1">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
                        <span className="text-sm font-medium text-gray-400">Loading stats...</span>
                    </div>
                    :
                    <>
                        <div className="border-r border-gray-400"></div>
                        <div>Project value: {projectValue} {currency}</div>
                        <div className="border-r border-gray-400"></div>
                        <div>Received: {totalPaid} {currency}</div>
                        <div className="border-r border-gray-400"></div>
                        <div>Money to charge: {moneyToCharge} {currency}</div>
                    </>
                }
            </div>
        </div>
    );
}