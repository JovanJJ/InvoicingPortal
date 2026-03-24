export default function BuildFilterUrl({ client, status, date, project, searchParams }) {
    const params = new URLSearchParams(searchParams);

    if (client !== undefined) {
        if (client) params.set("client", client);
        else params.delete("client");
    }

    if (project !== undefined) {
        if (project) params.set("project", project);
        else params.delete("project");
    }

    if (status !== undefined) {
        if (status) params.set("status", status);
        else params.delete("status");
    }

    if (date !== undefined) {
        if (date) params.set("date", date);
        else params.delete("date");
    }

    return `/invoices?${params.toString()}`;
}