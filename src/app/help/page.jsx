import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Sign in with Google",
    description:
      "Start by signing in with your Google account. This gives you quick access to the app so you can begin creating projects, tracking time, and managing invoices right away.",
  },
  {
    number: "02",
    title: "Go to Projects",
    description:
      "After signing in, open the Projects page. This is your main workspace for organizing client work and managing everything related to each job.",
  },
  {
    number: "03",
    title: "Create a New Project",
    description:
      "Click to create a new project whenever you start working with a new client or begin a new task. Each project helps keep your time, billing, and invoice data organized.",
  },
  {
    number: "04",
    title: "Add Project and Client Info",
    description:
      "Fill in the essential project details, along with the client information. Adding accurate basics at the start makes the rest of your workflow much smoother.",
  },
  {
    number: "05",
    title: "Complete the Project Details",
    description:
      "Open the project page and fill in the remaining fields. Make sure you add your rate, deadlines, status, and other important details so progress tracking and invoicing stay accurate.",
  },
  {
    number: "06",
    title: "Start the Timer",
    description:
      "When you begin working, start the timer inside the project. This helps you record billable time automatically and gives you a clear overview of your work.",
  },
  {
    number: "07",
    title: "Save a Commit Message",
    description:
      "When you stop the timer, add a commit message or short work note. Use it to describe what you completed so your logs stay clear and your invoice items make sense later.",
  },
  {
    number: "08",
    title: "Open Invoice Preview and Save",
    description:
      "Once you have enough tracked work, open the invoice preview and save the invoice. This creates a draft that you can review and improve before sending it to the client.",
  },
  {
    number: "09",
    title: "Go to Invoices",
    description:
      "Open the Invoices page and expand the invoice you created. You can use the filter bar at the top to quickly find invoices by client, project, or status.",
  },
  {
    number: "10",
    title: "Customize and Send",
    description:
      "Review the invoice carefully, then add, remove, or update any details you need. When everything looks right, send it directly to your client through Gmail.",
  },
];

const tips = [
  "Add your hourly rate and payment details early so invoices are ready when you need them.",
  "Use clear commit messages because they help both you and your clients understand the work that was done.",
  "Review invoices before sending to make sure dates, totals, and client details are correct.",
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fff7_0%,#ffffff_35%,#f5fbff_100%)]">
      <section className="border-b border-emerald-100 bg-[radial-gradient(circle_at_top,#d9f99d_0%,#f0fdf4_32%,transparent_70%)]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:px-10">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-emerald-200 bg-white/80 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 shadow-sm">
              Help Guide
            </p>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
              Learn the full workflow in a few simple steps
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 md:text-xl">
              This guide walks you through the typical flow of the app, from
              signing in to sending your first invoice.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition-colors hover:bg-emerald-700"
              >
                Start With Login
              </Link>
              <Link
                href="/projects"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                Open Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 md:px-10">
        <div className="mb-10 grid gap-4 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm md:grid-cols-3">
          <div className="rounded-[1.5rem] bg-emerald-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Best for
            </p>
            <p className="mt-3 text-base leading-7 text-slate-700">
              Freelancers and small teams who want a clean way to track work
              and send professional invoices.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-amber-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
              Main flow
            </p>
            <p className="mt-3 text-base leading-7 text-slate-700">
              Create a project, track your time, save your work logs, then
              generate and customize an invoice.
            </p>
          </div>
          <div className="rounded-[1.5rem] bg-sky-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              Final step
            </p>
            <p className="mt-3 text-base leading-7 text-slate-700">
              Review the invoice, make any changes you need, and send it to
              your client with Gmail.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {steps.map((step) => (
            <article
              key={step.number}
              className="grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 md:grid-cols-[120px_1fr]"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-emerald-500 to-lime-400 text-2xl font-black text-white shadow-lg shadow-emerald-200">
                {step.number}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {step.title}
                </h2>
                <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 md:px-10">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-8 text-white shadow-xl">
          <h2 className="text-3xl font-black tracking-tight">Helpful Tips</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {tips.map((tip) => (
              <div
                key={tip}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              >
                <p className="leading-7 text-slate-200">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
