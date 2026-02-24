import ProjectHeader from '@/components/ProjectHeader';
import Stopwatch from '@/components/Stopwatch';
import ProgressBar from '@/components/ProgressBar';
import HoursChart from '@/components/HoursChart';
import { fetchProjectById, fetchClient } from '@/lib/actions';
import getSession from '@/lib/auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export default async function project({params}) {
    const { id } = await params;
    const project = await fetchProjectById(id);
    const client = await fetchClient(project.clientId);
    const session = await getSession(authOptions);
    const userId = session.user?.id;
    
  return (
    <main className="bg-white">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Project Page</h1>
      </div>
      <ProjectHeader project={project} client={client}/>

      <section className="w-full py-8 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Stopwatch projectId={project.projectId} userId={userId} />
        </div>
      </section>

      <section className="w-full py-8 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <ProgressBar />
        </div>
      </section>

      <section className="w-full py-8 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <HoursChart />
        </div>
      </section>
    </main>
  );
}