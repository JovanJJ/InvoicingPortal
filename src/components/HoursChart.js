import { getDailyHoursForProject } from "@/lib/actions";
import ProjectHoursChart from "./project/ProjectHoursChart";

export default async function HoursChart({ projectId }) {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const result = await getDailyHoursForProject(projectId, userTimezone);

  return (
    <div>
      <ProjectHoursChart projectId={projectId} />
    </div>
  );

}









