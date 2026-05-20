import React from "react";
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore, Student } from '../store';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const YEARS = [new Date().getFullYear().toString(), (new Date().getFullYear() + 1).toString()];

export const CollectFee = () => {
  const { currentUser, students, collectFee, receipts } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const studentIdFromUrl = queryParams.get('student');

  const schoolStudents = students.filter(s => s.school_id === currentUser?.school_id && s.status === 'active');

  const [selectedStudentId, setSelectedStudentId] = useState(studentIdFromUrl || '');
  const [student, setStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    month: MONTHS[new Date().getMonth()],
    year: YEARS[0],
    tuition_fee: 0,
    transport_fee: 0,
    extra_charges: 0,
    discount: 0,
    paid_amount: 0,
    payment_mode: 'Cash' as const,
  });

  useEffect(() => {
    if (selectedStudentId) {
      const found = schoolStudents.find(s => s.id === selectedStudentId);
      if (found) {
        setStudent(found);
        const totalPayable = found.monthly_fee + found.transport_fee + found.previous_due;
        setFormData(prev => ({
          ...prev,
          tuition_fee: found.monthly_fee,
          transport_fee: found.transport_fee,
          paid_amount: totalPayable, // default to paying full
        }));
      }
    } else {
      setStudent(null);
    }
  }, [selectedStudentId, schoolStudents]);

  const previousDue = student ? student.previous_due : 0;
  const totalAmount = formData.tuition_fee + formData.transport_fee + formData.extra_charges + previousDue - formData.discount;
  const dueAmount = Math.max(0, totalAmount - formData.paid_amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !currentUser?.school_id) return;

    let payment_status: 'paid' | 'partial' | 'pending' = 'pending';
    if (dueAmount === 0) payment_status = 'paid';
    else if (formData.paid_amount > 0) payment_status = 'partial';

    collectFee({
      school_id: currentUser.school_id,
      student_id: student.id,
      month: formData.month,
      year: formData.year,
      tuition_fee: formData.tuition_fee,
      transport_fee: formData.transport_fee,
      extra_charges: formData.extra_charges,
      discount: formData.discount,
      total_amount: totalAmount,
      paid_amount: formData.paid_amount,
      due_amount: dueAmount,
      payment_status,
      payment_mode: formData.payment_mode,
      payment_date: new Date().toISOString(),
    });

    // Simple hack to navigate to the newest receipt
    // In a real app, collectFee should return the receipt ID
    setTimeout(() => {
      const newReceipts = useStore.getState().receipts;
      const latestReceipt = newReceipts[newReceipts.length - 1];
      if (latestReceipt) {
        navigate(`/school-admin/receipt/${latestReceipt.receipt_no}`);
      }
    }, 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Collect Fee</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">-- Search and select student --</option>
          {schoolStudents.map(s => (
            <option key={s.id} value={s.id}>
              {s.student_name} (Class {s.class} | Roll: {s.roll_no} | {s.father_name})
            </option>
          ))}
        </select>
      </div>

      {student && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-8">

          {/* Student Quick Info */}
          <div className="bg-blue-50 p-4 rounded-lg flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div><span className="text-gray-600">Name:</span> <span className="font-semibold">{student.student_name}</span></div>
            <div><span className="text-gray-600">Class:</span> <span className="font-semibold">{student.class} {student.section && `(${student.section})`}</span></div>
            <div><span className="text-gray-600">Monthly Fee:</span> <span className="font-semibold">₹{student.monthly_fee}</span></div>
            <div><span className="text-gray-600 text-red-600">Previous Due:</span> <span className="font-semibold text-red-600">₹{previousDue}</span></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fee Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Fee Details</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tuition Fee</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded" value={formData.tuition_fee} onChange={e => setFormData({...formData, tuition_fee: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Transport Fee</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded" value={formData.transport_fee} onChange={e => setFormData({...formData, transport_fee: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Extra Charges</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded" value={formData.extra_charges} onChange={e => setFormData({...formData, extra_charges: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Discount</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded" value={formData.discount} onChange={e => setFormData({...formData, discount: Number(e.target.value)})} />
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-4">
               <h3 className="font-semibold text-gray-800 border-b pb-2">Payment Summary</h3>

               <div className="bg-gray-50 p-4 rounded space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Current Fees:</span> <span>₹{formData.tuition_fee + formData.transport_fee + formData.extra_charges}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Previous Due:</span> <span className="text-red-600">₹{previousDue}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Discount:</span> <span className="text-green-600">-₹{formData.discount}</span></div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                    <span>Total Amount:</span> <span>₹{totalAmount}</span>
                  </div>
               </div>

               <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Paid Amount *</label>
                <input type="number" required max={totalAmount} className="w-full px-3 py-2 border border-gray-300 rounded font-bold text-green-700 bg-green-50" value={formData.paid_amount} onChange={e => setFormData({...formData, paid_amount: Number(e.target.value)})} />
               </div>

               <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Payment Mode *</label>
                <div className="flex gap-4">
                  {['Cash', 'UPI', 'Bank', 'Other'].map(mode => (
                     <label key={mode} className="flex items-center gap-1 text-sm">
                        <input type="radio" name="payment_mode" value={mode} checked={formData.payment_mode === mode} onChange={() => setFormData({...formData, payment_mode: mode as any})} />
                        {mode}
                     </label>
                  ))}
                </div>
               </div>

               <div className="bg-red-50 p-3 rounded text-sm flex justify-between border border-red-100">
                  <span className="text-red-800 font-medium">Remaining Due:</span>
                  <span className="text-red-800 font-bold">₹{dueAmount}</span>
               </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
             <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Cancel</button>
             <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium shadow-sm">
                Collect & Generate Receipt
             </button>
          </div>
        </form>
      )}
    </div>
  );
};
