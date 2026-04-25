import DashboardStats from "@/components/DashboardStats";

export const metadata = {
  title: "Projects",
  description: "View and manage your projects.",
};

export default function Home({ searchParams }) {

  return(
    <main className="bg-white">
      <DashboardStats searchParams={searchParams} />
    </main>
  )
}
