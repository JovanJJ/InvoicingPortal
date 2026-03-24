

import { fetchInvoices, fetchProjectsNames, fetchClientNames } from "@/lib/actions";
import InvoicesList from "@/components/InvoicesList";
import getSession from "@/lib/auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";


export default async function InvoicePage({ searchParams }) {
  const session = await getSession(authOptions);

  const id = session.user.id;

  const params = await searchParams;

  const invoices = await fetchInvoices(id, params);

  const projectNames = await fetchProjectsNames(id.toString());
  const clientNames = await fetchClientNames(id.toString());

  return (
    <InvoicesList invoices={invoices} projectNames={projectNames} clientNames={clientNames} />
  );
}
