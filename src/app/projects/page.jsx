import Image from "next/image";
import DashboardStats from "@/components/DashboardStats";

export default function Home({ searchParams }) {

  return(
    <main className="bg-white">
      <DashboardStats searchParams={searchParams} />
    </main>
  )
}
