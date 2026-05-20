import { useStore } from '../store';
import { FileText, Download } from 'lucide-react';

export const Reports = () => {
  const { currentUser, fees } = useStore();
  const schoolFees = fees.filter(f => f.school_id === currentUser?.school_id);

  // Group by month
  const monthlyData = schoolFees.reduce((acc, fee) => {
    const key = `${fee.month} ${fee.year}`;
    if (!acc[key]) {
      acc[key] = { collected: 0, pending: 0, count: 0 };
    }
    acc[key].collected += fee.paid_amount;
    acc[key].pending += fee.due_amount;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { collected: number, pending: number, count: number }>);

  // Group by payment mode
  const modeData = schoolFees.reduce((acc, fee) => {
    const mode = fee.payment_mode || 'Unknown';
    if (!acc[mode]) {
      acc[mode] = 0;
    }
    acc[mode] += fee.paid_amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Monthly Collection Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                 <FileText size={20} className="text-blue-500" /> Monthly Summary
              </h2>
              <button className="text-gray-400 hover:text-gray-600">
                 <Download size={18} />
              </button>
           </div>
           <div className="space-y-3">
              {Object.entries(monthlyData).map(([month, data]) => (
                 <div key={month} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                    <div>
                       <div className="font-medium text-gray-800">{month}</div>
                       <div className="text-xs text-gray-500">{data.count} transactions</div>
                    </div>
                    <div className="text-right">
                       <div className="font-bold text-green-600">₹{data.collected}</div>
                       <div className="text-xs text-red-500">Pending: ₹{data.pending}</div>
                    </div>
                 </div>
              ))}
              {Object.keys(monthlyData).length === 0 && (
                 <div className="text-center text-gray-500 py-4">No data available</div>
              )}
           </div>
        </div>

        {/* Payment Mode Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                 <FileText size={20} className="text-purple-500" /> Collection by Mode
              </h2>
           </div>
           <div className="space-y-3">
              {Object.entries(modeData).map(([mode, amount]) => {
                 const total = Object.values(modeData).reduce((a,b) => a+b, 0);
                 const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
                 return (
                    <div key={mode} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                       <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-gray-800">{mode}</span>
                          <span className="font-bold text-gray-800">₹{amount}</span>
                       </div>
                       <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                       </div>
                    </div>
                 );
              })}
              {Object.keys(modeData).length === 0 && (
                 <div className="text-center text-gray-500 py-4">No data available</div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
