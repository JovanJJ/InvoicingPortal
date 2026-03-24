import PaymentProgressBar from "./PaymentProgressBar";
import SearchInput from "./SearchInput";

export default function ProjectsList({ projects }) {

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Projects List</h2>

        <SearchInput />
      </div>

      <div className="space-y-4">

        {
          projects.map((project) => {
            return (
              <PaymentProgressBar project={project} projectId={project._id.toString()} key={project._id} />
            );
          }
          )}
      </div>
    </div>
  );
}
