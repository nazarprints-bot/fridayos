import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { Users, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const SchoolDashboard = () => {
  const { currentUser, schools, students, fees } = useStore();

  const currentSchool = schools.find(s => s.id === currentUser?.school_id);
  const schoolStudents = students.filter(s => s.school_id === currentUser?.school_id);
  const schoolFees = fees.filter(f => f.school_id === currentUser?.school_id);

  const totalStudents = schoolStudents.length;

  const today = new Date();
  const todayCollection = schoolFees
    .filter(f => f.payment_date && new Date(f.payment_date).toDateString() === today.toDateString())
    .reduce((sum, fee) => sum + fee.paid_amount, 0);

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const thisMonthCollection = schoolFees
    .filter(f => f.payment_date && isWithinInterval(new Date(f.payment_date), { start: monthStart, end: monthEnd }))
    .reduce((sum, fee) => sum + fee.paid_amount, 0);

  const pendingFees = schoolStudents.reduce((sum, student) => sum + student.previous_due, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{currentSchool?.school_name}</h1>
          <p className="text-gray-500 text-sm">{currentSchool?.address}</p>
        </div>
        <div className="hidden sm:block">
           {/* Placeholder for Logo */}
           <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
              {currentSchool?.school_name.charAt(0)}
           </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
             <Users size={24} />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Total Students</div>
            <div className="text-2xl font-bold text-gray-800">{totalStudents}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
             <CreditCard size={24} />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Today Collection</div>
            <div className="text-2xl font-bold text-green-600">₹{todayCollection.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
             <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Month Collection</div>
            <div className="text-2xl font-bold text-purple-600">₹{thisMonthCollection.toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
             <Clock size={24} />
          </div>
          <div>
            <div className="text-gray-500 text-sm font-medium">Pending Dues</div>
            <div className="text-2xl font-bold text-red-600">₹{pendingFees.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
         <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
         <div className="flex flex-wrap gap-3">
            <Link to="/school-admin/students" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors">
              Manage Students
            </Link>
            <Link to="/school-admin/collect-fee" className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors">
              Collect Fee
            </Link>
            <Link to="/school-admin/pending-fees" className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors">
              View Pending List
            </Link>
            <Link to="/school-admin/reports" className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors">
              Generate Reports
            </Link>
         </div>
      </div>
    </div>
  );
};
