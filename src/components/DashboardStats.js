import StatsCards from "./StatsCards";
import NewProjectCard from "./NewProjectCard";
import ProjectsList from "./ProjectsList";
import getSession from "@/lib/auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchProjectList, projectsValueInBaseCurrency, fetchLoggedHours, calculateEarnings, moneyToCharge, fetchProjects, projectDashStats, fetchUserDefaultCurrnecy } from "@/lib/actions";
import DashStatsPerProject from "./DashStatsPerProjects";



export default async function DashboardStats({ searchParams }) {

    const { search } = await searchParams;
    const { stats } = await searchParams;

    const session = await getSession(authOptions);
    const id = session.user?.id;
    const { success, currency } = await fetchUserDefaultCurrnecy(id);
    const projectsList = await fetchProjectList(id, search);
    const earnings = await calculateEarnings(id, currency);
    const projectsValue = await projectsValueInBaseCurrency(id, currency);
    const totalLoggedHours = await fetchLoggedHours(id);
    const chargeMoney = await moneyToCharge(id, currency);
    const { message, projects } = await fetchProjects();
    const values = await projectDashStats(stats, currency) || { dashStats: { projectValue: 0, totalPaid: 0, moneyToCharge: 0 } };

    return (
        <section className="w-full py-12 px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
                <StatsCards earnings={earnings.earnings} activeProjects={projectsList.length} projectsValue={projectsValue} totalLoggedHours={totalLoggedHours.totalLoggedHours} chargeMoney={chargeMoney} currency={currency} />
                <DashStatsPerProject projects={projects} projectStats={values} currency={currency} />
                <NewProjectCard />
                <ProjectsList projects={projectsList} />
            </div>
        </section>
    );
}
