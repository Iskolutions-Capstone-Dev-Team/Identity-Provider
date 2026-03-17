import TableRowFade from "../TableRowFade";
import { shortenId } from "../../utils/shortenId";
import DataTableSkeleton from "../DataTableSkeleton";

function getStatusClassName(status) {
  if (status === "active") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "inactive") {
    return "border border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border border-rose-200 bg-rose-50 text-rose-700";
}

function getFullName(user) {
  return [user.givenName, user.middleName, user.surname]
    .filter(Boolean)
    .join(" ");
}

export default function UserPoolTable({ loading = false, users = [], onView, onEdit, onDelete, showDeleteAction = false }) {
  if (loading) {
    return (
      <DataTableSkeleton
        theme="userpool"
        columns={[
          { header: "ID", type: "text", width: "w-16" },
          { header: "Email", type: "text", width: "w-32" },
          { header: "Name", type: "stackedText" },
          { header: "Roles", type: "badges" },
          { header: "Status", type: "badge", width: "w-20" },
          { header: "Created", type: "text", width: "w-24" },
          { header: "Actions", type: "actions" },
        ]}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[#7b0d15]/10 bg-white/65 shadow-[0_22px_55px_-38px_rgba(43,3,7,0.55)]">
      <div className="overflow-x-auto">
        <table className="table w-full min-w-[56rem]">
          <thead>
            <tr className="bg-[linear-gradient(135deg,#7b0d15_0%,#2b0307_100%)]">
              <th className="border-b border-white/10 px-6 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90 text-left">ID</th>
              <th className="border-b border-white/10 px-6 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90 text-left">Email</th>
              <th className="border-b border-white/10 px-6 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90 text-left">Name</th>
              <th className="border-b border-white/10 px-6 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90 text-left">Roles</th>
              <th className="border-b border-white/10 px-6 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90 text-center">Status</th>
              <th className="border-b border-white/10 px-6 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90 text-left">Created</th>
              <th className="border-b border-white/10 px-6 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white/90 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm font-medium text-[#8f6f76]">
                  No users found
                </td>
              </tr>
            )}

            {users.map((user, index) => (
              <TableRowFade
                key={user.id}
                keyId={user.id}
                className={`transition-colors duration-300 ${
                  index % 2 === 0
                    ? "bg-white/70 hover:bg-[#fff4dc]/70"
                    : "bg-[#fff8f3]/80 hover:bg-[#fff4dc]/80"
                }`}
              >
                <td className="border-b border-[#7b0d15]/10 px-6 py-4 text-sm text-[#4a1921]">
                  <div className="tooltip tooltip-right" data-tip={user.id}>
                    <span className="inline-flex cursor-pointer rounded-full border border-[#7b0d15]/10 bg-[#7b0d15]/5 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[#7b0d15]">
                      {shortenId(user.id)}
                    </span>
                  </div>
                </td>

                <td className="border-b border-[#7b0d15]/10 px-6 py-4 text-sm font-medium text-[#5a0b12]">
                  {user.email}
                </td>

                <td className="border-b border-[#7b0d15]/10 px-6 py-4 text-sm text-[#4a1921] whitespace-nowrap">
                  {getFullName(user)}
                </td>

                <td className="border-b border-[#7b0d15]/10 px-6 py-4 text-sm text-[#4a1921]">
                  <div className="flex flex-wrap gap-2">
                    {user.roles?.map((role, roleIndex) => (
                      <span key={`${role}-${roleIndex}`} className="inline-flex rounded-full border border-[#7b0d15]/10 bg-[#7b0d15]/5 px-3 py-1 text-xs font-semibold text-[#7b0d15]">
                        {role}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="border-b border-[#7b0d15]/10 px-6 py-4 text-sm text-[#4a1921] text-center">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClassName(user.status)}`}>
                    {user.status}
                  </span>
                </td>

                <td className="border-b border-[#7b0d15]/10 px-6 py-4 text-sm whitespace-nowrap text-[#6b4850]">
                  {user.createdAt}
                </td>

                <td className="border-b border-[#7b0d15]/10 px-6 py-4 text-sm text-[#4a1921] text-center">
                  <div className="flex justify-center gap-2">
                    <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#7b0d15]/10 bg-white/65 text-[#7b0d15] shadow-[0_14px_35px_-28px_rgba(43,3,7,0.5)] transition duration-300 hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]" onClick={() => onView(user)} aria-label={`View ${user.username}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                      </svg>
                    </button>

                    <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#7b0d15]/10 bg-white/65 text-[#7b0d15] shadow-[0_14px_35px_-28px_rgba(43,3,7,0.5)] transition duration-300 hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]" onClick={() => onEdit(user)} aria-label={`Edit ${user.username}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"/>
                      </svg>
                    </button>

                    {showDeleteAction && (
                      <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#7b0d15]/10 bg-white/65 text-[#7b0d15] shadow-[0_14px_35px_-28px_rgba(43,3,7,0.5)] transition duration-300 hover:border-[#f8d24e]/70 hover:bg-[#fff4dc] hover:text-[#5a0b12]" onClick={() => onDelete(user)} aria-label={`Delete ${user.username}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </TableRowFade>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}