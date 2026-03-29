import ClientsCardsGrid from "./components/ClinetsCardsGrid";
import { fetchProjectsAndClients } from "@/lib/actions";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function ClientsPage() {
    const session = await getServerSession(authOptions);
    const id = session.user.id;
    const projectsAndClients = await fetchProjectsAndClients(id);
    return (
        <div className="h-screen">
            <h1 className="mx-auto w-fit text-3xl mt-10 font-semibold">Clients Page</h1>
            <div className="max-w-5xl mx-auto px-5">
                <ClientsCardsGrid projectsAndClients={projectsAndClients} />
            </div>
        </div >
    );
}