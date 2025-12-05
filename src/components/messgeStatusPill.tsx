// export default function StatusPill({ status }: { status: string }) {
//   const base =
//     "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
//   const map: Record<string, string> = {
//     failed: "bg-red-50 text-red-700 ring-1 ring-red-200",
//     delivered: "bg-green-50 text-green-700 ring-1 ring-green-200",
//     read: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
//     sent: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
//   };

//   const cls = map[status] ?? "bg-gray-50 text-gray-700 ring-1 ring-gray-200";
//   const translated = statusMap[status] ?? status;

//   return <span className={`${base} ${cls}`}>{translated}</span>;
// }