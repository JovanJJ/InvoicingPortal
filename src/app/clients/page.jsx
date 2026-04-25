import ClientsCardsGrid from "./components/ClinetsCardsGrid";
import { fetchProjectsAndClients } from "@/lib/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Clients",
    description: "View and manage your clients.",
};

export default async function ClientsPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }
    const id = session.user.id;

    const projectsAndClients = await fetchProjectsAndClients(id) || [];

    return (
        <div className="">
            <h1 className="mx-auto w-fit text-3xl mt-10 font-semibold">Clients Page</h1>
            <div className="max-w-5xl mx-auto px-5">
                {projectsAndClients.length === 0 ?
                    (<div className="mt-10 font-extrabold">No Clients to display. <span className="text-[1rem] font-normal">(Clienst will be visible after you <Link href="/projects" className="underline" >create project)</Link></span></div>)
                    :
                    (<ClientsCardsGrid projectsAndClients={projectsAndClients} />)
                }

            </div>
        </div >
    );
}