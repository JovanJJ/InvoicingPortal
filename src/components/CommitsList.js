
import formatDuration from "./formatDuration";

export default function CommitsList({ commitList }) {
  let orderedList = [...commitList].reverse();


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 h-full">
      <h3 className="text-lg font-bold text-gray-900 ">Work Log</h3>
      <span className="block mb-6 text-[14px] text-gray-500">You can change logs when you edit invoice preview</span>

      <div className="space-y-6  max-h-96 overflow-y-auto">
        {commitList.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No commits yet. Stop the stopwatch to log your work.
          </p>
        ) : (
          orderedList.map((commit, index) => (
            <div
              key={index}
              className="border-l-4 border-b-4 border-green-500 bg-gray-50 rounded p-4 hover:bg-gray-100 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {formatDuration(commit.duration)}
              </p>
              <p className="text-xs text-gray-600">{commit.createdAt}</p>
              <p className="mt-5">{commit.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
