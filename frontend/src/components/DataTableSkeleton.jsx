const DEFAULT_ROWS = 5;
const DEFAULT_TEXT_WIDTH = "w-24";
const SKELETON_TONE_CLASS = "bg-gray-100";

function renderCellContent(type, width) {
  if (type === "avatar") {
    return (
      <div className="flex justify-center">
        <div className={`skeleton h-10 w-10 rounded-full ${SKELETON_TONE_CLASS}`} />
      </div>
    );
  }

  if (type === "stackedText") {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`skeleton h-4 w-20 ${SKELETON_TONE_CLASS}`} />
        <div className={`skeleton h-4 w-28 ${SKELETON_TONE_CLASS}`} />
      </div>
    );
  }

  if (type === "badge") {
    return (
      <div className="flex justify-center">
        <div className={`skeleton h-6 rounded-full ${width || "w-16"} ${SKELETON_TONE_CLASS}`} />
      </div>
    );
  }

  if (type === "badges") {
    return (
      <div className="flex justify-center gap-2">
        <div className={`skeleton h-6 w-16 rounded-full ${SKELETON_TONE_CLASS}`} />
        <div className={`skeleton h-6 w-12 rounded-full ${SKELETON_TONE_CLASS}`} />
      </div>
    );
  }

  if (type === "button") {
    return (
      <div className="flex justify-center">
        <div className={`skeleton h-9 w-16 rounded-lg ${SKELETON_TONE_CLASS}`} />
      </div>
    );
  }

  if (type === "iconButton") {
    return (
      <div className="flex justify-center">
        <div className={`skeleton h-10 w-10 rounded-xl ${SKELETON_TONE_CLASS}`} />
      </div>
    );
  }

  if (type === "actions") {
    return (
      <div className="flex justify-center gap-2">
        <div className={`skeleton h-10 w-10 rounded-xl ${SKELETON_TONE_CLASS}`} />
        <div className={`skeleton h-10 w-10 rounded-xl ${SKELETON_TONE_CLASS}`} />
        <div className={`skeleton h-10 w-10 rounded-xl ${SKELETON_TONE_CLASS}`} />
      </div>
    );
  }

  return (
    <div
      className={`mx-auto skeleton h-4 ${width || DEFAULT_TEXT_WIDTH} ${SKELETON_TONE_CLASS}`}
    />
  );
}

export default function DataTableSkeleton({
  columns = [],
  rows = DEFAULT_ROWS,
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-gray-200"
      aria-hidden="true"
    >
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="bg-[#991b1b]">
              {columns.map((column) => (
                <th
                  key={column.header}
                  className="text-center text-white"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={`${column.header}-${rowIndex}`} className="border-gray-200">
                    {renderCellContent(column.type, column.width)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
