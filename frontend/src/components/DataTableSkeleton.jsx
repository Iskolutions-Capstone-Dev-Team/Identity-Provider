const DEFAULT_ROWS = 5;
const DEFAULT_TEXT_WIDTH = "w-24";
const SKELETON_STYLE = { animation: "none" };

const TABLE_THEMES = {
  default: {
    wrapperClassName: "overflow-hidden rounded-2xl border border-gray-200",
    tableClassName: "table w-full",
    headerRowClassName: "bg-[#991b1b]",
    headerCellClassName: "text-center text-white",
    bodyCellClassName: "border-gray-200",
    skeletonToneClassName: "bg-gray-300",
  },
  userpool: {
    wrapperClassName:
      "overflow-hidden rounded-[1.75rem] border border-[#7b0d15]/10 bg-white/65 shadow-[0_22px_55px_-38px_rgba(43,3,7,0.55)]",
    tableClassName: "table w-full min-w-[62rem] lg:min-w-0 lg:table-fixed",
    headerRowClassName:
      "bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)]",
    headerCellClassName:
      "border-b border-white/10 px-6 py-4 text-left text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90",
    bodyCellClassName: "border-b border-[#7b0d15]/10 px-6 py-5",
    skeletonToneClassName: "bg-[#e8d8dc]",
  },
};

function renderCellContent(type, width, skeletonToneClassName) {
  if (type === "avatar") {
    return (
      <div className="flex justify-center">
        <div className={`skeleton h-10 w-10 rounded-full ${skeletonToneClassName}`} style={SKELETON_STYLE}/>
      </div>
    );
  }

  if (type === "stackedText") {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`skeleton h-4 w-20 ${skeletonToneClassName}`} style={SKELETON_STYLE}/>
        <div className={`skeleton h-4 w-28 ${skeletonToneClassName}`} style={SKELETON_STYLE}/>
      </div>
    );
  }

  if (type === "badge") {
    return (
      <div className="flex justify-center">
        <div className={`skeleton h-6 rounded-full ${width || "w-16"} ${skeletonToneClassName}`} style={SKELETON_STYLE}/>
      </div>
    );
  }

  if (type === "badges") {
    return (
      <div className="flex justify-center gap-2">
        <div className={`skeleton h-6 w-16 rounded-full ${skeletonToneClassName}`} style={SKELETON_STYLE}/>
        <div className={`skeleton h-6 w-12 rounded-full ${skeletonToneClassName}`} style={SKELETON_STYLE}/>
      </div>
    );
  }

  if (type === "button") {
    return (
      <div className="flex justify-center">
        <div className={`skeleton h-9 w-16 rounded-lg ${skeletonToneClassName}`} style={SKELETON_STYLE}/>
      </div>
    );
  }

  if (type === "iconButton") {
    return (
      <div className="flex justify-center">
        <div className={`skeleton h-10 w-10 rounded-xl ${skeletonToneClassName}`} style={SKELETON_STYLE}/>
      </div>
    );
  }

  if (type === "actions") {
    return (
      <div className="flex justify-center gap-2">
        <div className={`skeleton h-10 w-10 rounded-xl ${skeletonToneClassName}`} style={SKELETON_STYLE}/>
        <div className={`skeleton h-10 w-10 rounded-xl ${skeletonToneClassName}`} style={SKELETON_STYLE}/>
        <div className={`skeleton h-10 w-10 rounded-xl ${skeletonToneClassName}`} style={SKELETON_STYLE}/>
      </div>
    );
  }

  return (
    <div className={`mx-auto skeleton h-4 ${width || DEFAULT_TEXT_WIDTH} ${skeletonToneClassName}`} style={SKELETON_STYLE}/>
  );
}

export default function DataTableSkeleton({ columns = [], rows = DEFAULT_ROWS, theme = "default" }) {
  const styles = TABLE_THEMES[theme] || TABLE_THEMES.default;

  return (
    <div className={styles.wrapperClassName} aria-hidden="true">
      <div className="overflow-x-auto">
        <table className={styles.tableClassName}>
          <thead>
            <tr className={styles.headerRowClassName}>
              {columns.map((column) => (
                <th key={column.header} className={styles.headerCellClassName}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={`${column.header}-${rowIndex}`} className={styles.bodyCellClassName}
                  >
                    {renderCellContent(
                      column.type,
                      column.width,
                      styles.skeletonToneClassName,
                    )}
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