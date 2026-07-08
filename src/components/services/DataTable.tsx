interface DataTableColumn {
  key: string;
  header: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
}

interface DataTableProps {
  columns: DataTableColumn[];
  rows: Record<string, unknown>[];
  caption?: string;
}

export function DataTable({ columns, rows, caption }: DataTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        {caption && (
          <caption className="bg-gray-50 px-5 py-3 text-left text-sm font-semibold text-slate-700">
            {caption}
          </caption>
        )}
        <thead>
          <tr className="border-b border-gray-200 bg-primary">
            {columns.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b border-gray-100 transition-colors odd:bg-white even:bg-gray-50 hover:bg-primary-light/5"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3 text-slate-700">
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}