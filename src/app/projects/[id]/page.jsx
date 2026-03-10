import ProjectHeader from '@/components/ProjectHeader';
import Stopwatch from '@/components/Stopwatch';
import ProgressBar from '@/components/ProgressBar';
import HoursChart from '@/components/HoursChart';
import ProfileUpload from '@/components/ProfileUpload';
import { fetchProjectById, fetchClient, fetchUser } from '@/lib/actions';
import getSession from '@/lib/auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export default async function project({params}) {
    const { id } = await params;
    const project = await fetchProjectById(id);
    const client = await fetchClient(project.clientId);
    const session = await getSession(authOptions);
    const userId = session.user?.id;
    const user = await fetchUser(userId);
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      logo: user.logo,
      bankAccount: "BankaIntesa: 1231545646456-15646",
     }
    
  return (
    <main className="bg-white">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Project Page</h1>
      </div>
      <ProfileUpload currentImage={user.logo} />
      <ProjectHeader project={project} client={client}/>

      <section className="w-full py-8 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Stopwatch projectId={project.projectId} userId={userId} project={project} client={client} userData={userData} />
        </div>
      </section>

      

      <section className="w-full py-8 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <HoursChart projectId={project.projectId} />
        </div>
      </section>
    </main>
  );
}