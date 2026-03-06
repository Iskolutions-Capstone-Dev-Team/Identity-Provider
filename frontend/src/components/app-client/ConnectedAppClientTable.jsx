import TableRowFade from "../TableRowFade";

const getClientId = (client) => client?.id ?? client?.clientId ?? "";

export default function ConnectedAppClientTable({ clients, onView, onEdit, onDelete, onRotateSecret }) {
    return (
        <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="table w-full">
                {/* head */}
                <thead>
                    <tr className="bg-[#991b1b]">
                    <th className="text-white w-16 text-center">Logo</th>
                    <th className="text-white text-center">Name</th>
                    <th className="text-white text-center">Client ID</th>
                    <th className="text-white text-center">Created</th>
                    <th className="text-white text-center">Secret</th>
                    <th className="text-white text-center">Actions</th>
                    </tr>
                </thead>

                {/* body */}
                <tbody>
                    {clients.length === 0 && (
                        <tr>
                            <td colSpan={6} className="text-center py-10 text-gray-500">No app clients found</td>
                        </tr>
                    )}
                    {clients.map((c) => (
                        <TableRowFade key={c.clientId || c.id}>
                            <td className="text-center border-gray-200">
                                <div className="avatar">
                                    <div className="mask mask-squircle w-10 h-10 bg-gray-100 border border-gray-200">
                                        {c.image ? (
                                            <img src={ c.image.startsWith("data:") ? c.image : `${c.image}`} alt={c.name} className="object-cover"/>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-[#991b1b] font-bold text-xs">
                                                {c.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="text-[#991b1b] text-center border-gray-200">{c.name}</td>
                            <td className="text-[#991b1b] text-center border-gray-200">{c.id || c.clientId}</td>
                            <td className="text-[#991b1b] text-center border-gray-200">{c.created}</td>
                            <td className="text-center border-gray-200">
                                <button type="button" className="btn btn-ghost p-2 border-none rounded-xl text-[#991b1b] hover:bg-[#ffd700]/30 hover:scale-110 hover:shadow-xl transition-all" onClick={() => onRotateSecret?.({ id: getClientId(c), name: c.name })}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                                    </svg>
                                </button>
                            </td>
                            <td className="gap-2 text-center border-gray-200">
                                <div className="flex gap-2 justify-center">
                                    <button type="button" className="btn btn-ghost p-2 border-none rounded-xl text-[#991b1b] hover:bg-[#ffd700]/30 hover:scale-110 hover:shadow-xl transition-all" onClick={() => onView?.(c)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    </button>
                                    <button type="button" className="btn btn-ghost p-2 border-none rounded-xl text-[#991b1b] hover:bg-[#ffd700]/30 hover:scale-110 hover:shadow-xl transition-all" onClick={() => onEdit?.(c)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                        </svg>
                                    </button>
                                    <button type="button" className="btn btn-ghost p-2 border-none rounded-xl text-[#991b1b] hover:bg-[#ffd700]/30 hover:scale-110 hover:shadow-xl transition-all" onClick={() => onDelete?.(getClientId(c))}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
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
