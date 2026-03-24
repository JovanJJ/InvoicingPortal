import ProjectHeader from '@/components/ProjectHeader';
import Stopwatch from '@/components/Stopwatch';
import HoursChart from '@/components/HoursChart';
import { fetchProjectById, fetchClient, fetchUser, fetchCurrencies } from '@/lib/actions';
import getSession from '@/lib/auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


export default async function project({ params }) {
  const { id } = await params;
  const project = await fetchProjectById(id);
  const client = await fetchClient(project.clientId);
  const session = await getSession(authOptions);
  const userId = session.user?.id;
  const user = await fetchUser(userId);
  const currencies = await fetchCurrencies();

  if (!project || !client || !user) {
    return <div>Not found</div>;
  }

  const userData = {
    ...user,
    bankAccounts: user.bankAccounts.map((acc) => ({
      ...acc,
      _id: acc._id?.toString()
    }))
  }

  return (
    <main className="bg-white">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Project Page</h1>
      </div>

      <ProjectHeader project={project} client={client} userImage={user.logo} bankAccounts={userData.bankAccounts} currencies={currencies} />

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