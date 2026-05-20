import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { School, Users, CreditCard, Activity, CheckCircle, XCircle } from 'lucide-react';

export const SuperAdminDashboard = () => {
  const { schools, students, fees } = useStore();

  const totalSchools = schools.length;
  const activeSchools = schools.filter(s => s.status === 'active').length;
  const inactiveSchools = totalSchools - activeSchools;
  const totalStudents = students.length;
  const totalCollection = fees.reduce((sum, fee) => sum + fee.paid_amount, 0);
  const totalPending = fees.reduce((sum, fee) => sum + fee.due_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Super Admin Dashboard</h1>
        <Link
          to="/super-admin/add-school"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add New School
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
            <School size={16} /> Total Schools
          </div>
          <div className="text-2xl font-bold text-gray-800">{totalSchools}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" /> Active Schools
          </div>
          <div className="text-2xl font-bold text-gray-800">{activeSchools}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
            <XCircle size={16} className="text-red-500" /> Inactive
          </div>
          <div className="text-2xl font-bold text-gray-800">{inactiveSchools}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
            <Users size={16} /> Total Students
          </div>
          <div className="text-2xl font-bold text-gray-800">{totalStudents}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
            <CreditCard size={16} className="text-blue-500" /> Total Collection
          </div>
          <div className="text-2xl font-bold text-green-600">₹{totalCollection.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="text-gray-500 text-sm font-medium mb-1 flex items-center gap-2">
            <Activity size={16} className="text-orange-500" /> Total Pending
          </div>
          <div className="text-2xl font-bold text-orange-600">₹{totalPending.toLocaleString()}</div>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-800">
          Registered Schools
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">School Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schools.map(school => {
                const schoolStudents = students.filter(s => s.school_id === school.id).length;
                return (
                  <tr key={school.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{school.school_name}</td>
                    <td className="px-4 py-3 text-gray-600">{school.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{school.email}</td>
                    <td className="px-4 py-3 text-gray-600">{schoolStudents}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        school.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {school.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(school.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                    </td>
                  </tr>
                );
              })}
              {schools.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No schools registered yet.
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
