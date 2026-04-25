import ProjectHeader from '@/components/ProjectHeader';
import Stopwatch from '@/components/Stopwatch';
import HoursChart from '@/components/HoursChart';
import { fetchProjectById, fetchClient, fetchUser, fetchCurrencies, fetchBankIban, fetchPaymentPercentage, fetchCommitMessages } from '@/lib/actions';
import getSession from '@/lib/auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = await fetchProjectById(id);
  
  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: project.name,
    description: `Details and time tracking for ${project.name}`,
  };
}

export default async function project({ params }) {
  const { id } = await params;
  const project = await fetchProjectById(id);
  const client = await fetchClient(project.clientId);
  const session = await getSession(authOptions);
  const userId = session.user?.id;
  const user = await fetchUser(userId);
  const currencies = await fetchCurrencies();
  const bankIban = await fetchBankIban(user._id.toString(), project.bankAccountId?.toString());
  const paymentDetails = await fetchPaymentPercentage(id);
  const commitMessages = await fetchCommitMessages(id);
  const { fixedRate, currency, totalPaid, paymentPercentage } = paymentDetails;

  const fixedRateProgressData = {
    projectName: project.name,
    clientName: client.clientName,
    projectStatus: project.status,
    totalLoggedHours: project.totalLoggedHours,
    fixedRate: fixedRate,
    totalPaid: totalPaid,
    currency: currency,
    paymentPercentage: paymentPercentage
  }

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
    <main className="bg-white relative">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Project Page</h1>
      </div>

      <ProjectHeader project={project} client={client} userImage={user.logo} bankAccounts={userData.bankAccounts} currencies={currencies} />

      <section className="w-full py-8 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <Stopwatch projectId={project.projectId} userId={userId} project={project} client={client} userData={userData} bankIban={bankIban} fixedRateProgressData={fixedRateProgressData} lineItems={commitMessages.list} />
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