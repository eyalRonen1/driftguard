export function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left py-4 px-4 text-sm text-gray-500 font-medium">Feature</th>
            <th className="py-4 px-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                PageLifeguard
              </div>
            </th>
            <th className="py-4 px-4 text-sm text-gray-500 font-medium text-center">Visualping</th>
            <th className="py-4 px-4 text-sm text-gray-500 font-medium text-center">Distill.io</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {[
            { feature: "AI-Powered Summaries", us: true, vp: "Basic", di: "Basic" },
            { feature: "Importance Scoring (1-10)", us: true, vp: false, di: false },
            { feature: "Smart Noise Filtering", us: true, vp: false, di: false },
            { feature: "Plain English Alerts", us: true, vp: false, di: false },
            { feature: "Email Alerts", us: true, vp: true, di: true },
            { feature: "Slack Alerts", us: true, vp: true, di: false },
            { feature: "CSS Selector Targeting", us: true, vp: true, di: true },
            { feature: "Visual Change Detection", us: "Coming soon", vp: true, di: false },
            { feature: "Free Plan", us: "3 monitors", vp: "2 monitors", di: "25 monitors*" },
            { feature: "Starting Price", us: "$19/mo", vp: "$10/mo", di: "$15/mo" },
          ].map((row) => (
            <tr key={row.feature} className="hover:bg-gray-50">
              <td className="py-3 px-4 text-sm text-gray-700">{row.feature}</td>
              <td className="py-3 px-4 text-center">
                <CellValue value={row.us} highlight />
              </td>
              <td className="py-3 px-4 text-center">
                <CellValue value={row.vp} />
              </td>
              <td className="py-3 px-4 text-center">
                <CellValue value={row.di} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2 text-center">* Distill.io free plan has limited check frequency</p>
    </div>
  );
}

function CellValue({ value, highlight }: { value: boolean | string; highlight?: boolean }) {
  if (value === true) {
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${highlight ? "bg-green-100" : "bg-green-50"}`}>
        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`text-xs font-medium ${highlight ? "text-blue-600" : "text-gray-500"}`}>
      {value}
    </span>
  );
}
