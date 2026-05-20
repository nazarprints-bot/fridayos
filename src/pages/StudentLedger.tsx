import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, Printer, FileText } from 'lucide-react';

export const StudentLedger = () => {
  const { id } = useParams();
  const { students, fees } = useStore();

  const student = students.find(s => s.id === id);
  const studentFees = fees.filter(f => f.student_id === id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (!student) {
    return <div>Student not found.</div>;
  }

  const totalPaid = studentFees.reduce((sum, fee) => sum + fee.paid_amount, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/school-admin/students" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
           <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Student Ledger</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 justify-between items-start">
         <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">{student.student_name}</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
               <div><span className="font-medium">Father Name:</span> {student.father_name}</div>
               <div><span className="font-medium">Class:</span> {student.class} {student.section && `(${student.section})`}</div>
               <div><span className="font-medium">Roll No:</span> {student.roll_no}</div>
               <div><span className="font-medium">Mobile:</span> {student.mobile}</div>
            </div>
         </div>
         <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-w-[200px] space-y-2">
             <div className="flex justify-between text-sm"><span className="text-gray-600">Monthly Fee:</span> <span className="font-semibold">₹{student.monthly_fee}</span></div>
             <div className="flex justify-between text-sm"><span className="text-gray-600">Total Paid:</span> <span className="font-semibold text-green-600">₹{totalPaid}</span></div>
             <div className="flex justify-between text-sm"><span className="text-gray-600">Current Due:</span> <span className="font-semibold text-red-600">₹{student.previous_due}</span></div>
             <div className="pt-2 mt-2 border-t border-gray-200">
                <Link to={`/school-admin/collect-fee?student=${student.id}`} className="block w-full text-center py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
                   Collect Balance
                </Link>
             </div>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-4 border-b border-gray-100 font-semibold text-gray-800 flex justify-between items-center">
            <span>Fee History</span>
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800">
               <Printer size={16} /> Print Ledger
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-600">
                  <tr>
                     <th className="px-4 py-3">Month/Year</th>
                     <th className="px-4 py-3">Total Amount</th>
                     <th className="px-4 py-3">Paid Amount</th>
                     <th className="px-4 py-3">Due Amount</th>
                     <th className="px-4 py-3">Status</th>
                     <th className="px-4 py-3">Receipt No</th>
                     <th className="px-4 py-3">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {studentFees.map(fee => (
                     <tr key={fee.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{fee.month} {fee.year}</td>
                        <td className="px-4 py-3">₹{fee.total_amount}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">₹{fee.paid_amount}</td>
                        <td className="px-4 py-3 text-red-600 font-medium">₹{fee.due_amount}</td>
                        <td className="px-4 py-3">
                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              fee.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                              fee.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                           }`}>
                              {fee.payment_status.toUpperCase()}
                           </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{fee.receipt_no}</td>
                        <td className="px-4 py-3">
                           {fee.receipt_no && (
                              <Link to={`/school-admin/receipt/${fee.receipt_no}`} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                 <FileText size={16} /> View
                              </Link>
                           )}
                        </td>
                     </tr>
                  ))}
                  {studentFees.length === 0 && (
                     <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                           No fee records found for this student.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
