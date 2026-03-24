import StatsCards from "./StatsCards";
import NewProjectCard from "./NewProjectCard";
import ProjectsList from "./ProjectsList";
import getSession from "@/lib/auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchProjectList, projectsValueInBaseCurrency, fetchLoggedHours, calculateEarnings, moneyToCharge } from "@/lib/actions";



export default async function DashboardStats({ searchParams }) {

    const { search } = await searchParams;

    const session = await getSession(authOptions);
    const id = session.user?.id;
    const projectsList = await fetchProjectList(id, search);
    const earnings = await calculateEarnings(id, "USD");
    const projectsValue = await projectsValueInBaseCurrency(id, "USD");
    const totalLoggedHours = await fetchLoggedHours(id);
    const chargeMoney = await moneyToCharge(id, "USD");

    return (
        <section className="w-full py-12 px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
                <StatsCards earnings={earnings.earnings} activeProjects={projectsList.length} projectsValue={projectsValue} totalLoggedHours={totalLoggedHours.totalLoggedHours} chargeMoney={chargeMoney} />
                <NewProjectCard />
                <ProjectsList projects={projectsList} />
            </div>
        </section>
    );
}
