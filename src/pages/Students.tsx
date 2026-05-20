import React from "react";
import { useState } from 'react';
import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, X } from 'lucide-react';

export const Students = () => {
  const { currentUser, students, addStudent } = useStore();
  const schoolStudents = students.filter(s => s.school_id === currentUser?.school_id);

  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_name: '', father_name: '', class: '', section: '',
    roll_no: '', mobile: '', monthly_fee: 0, transport_fee: 0,
    admission_fee: 0, previous_due: 0, status: 'active' as const
  });

  const filteredStudents = schoolStudents.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.mobile.includes(searchTerm) ||
                          student.roll_no.includes(searchTerm);
    const matchesClass = classFilter ? student.class === classFilter : true;
    const matchesSection = sectionFilter ? student.section === sectionFilter : true;
    const matchesStatus = statusFilter ? student.status === statusFilter : true;
    return matchesSearch && matchesClass && matchesSection && matchesStatus;
  });

  const uniqueClasses = Array.from(new Set(schoolStudents.map(s => s.class)));
  const uniqueSections = Array.from(new Set(schoolStudents.map(s => s.section).filter(Boolean)));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(currentUser?.school_id) {
       addStudent({
           ...formData,
           school_id: currentUser.school_id,
           monthly_fee: Number(formData.monthly_fee),
           transport_fee: Number(formData.transport_fee),
           admission_fee: Number(formData.admission_fee),
           previous_due: Number(formData.previous_due),
       });
       setIsAddModalOpen(false);
       setFormData({
           student_name: '', father_name: '', class: '', section: '',
           roll_no: '', mobile: '', monthly_fee: 0, transport_fee: 0,
           admission_fee: 0, previous_due: 0, status: 'active'
       });
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Student Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, roll no, mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-4">
           <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
              >
                 <option value="">All Classes</option>
                 {uniqueClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
           </div>

           <select
             value={sectionFilter}
             onChange={(e) => setSectionFilter(e.target.value)}
             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
           >
              <option value="">All Sections</option>
              {uniqueSections.map(s => <option key={s} value={s}>Section {s}</option>)}
           </select>
           <select
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
           >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
           </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Father Name</th>
                <th className="px-4 py-3">Class (Sec)</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Monthly Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 font-medium">{student.roll_no}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{student.student_name}</td>
                  <td className="px-4 py-3 text-gray-600">{student.father_name}</td>
                  <td className="px-4 py-3 text-gray-600">{student.class} {student.section && `(${student.section})`}</td>
                  <td className="px-4 py-3 text-gray-600">{student.mobile}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">₹{student.monthly_fee}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link to={`/school-admin/students/${student.id}`} className="text-blue-600 hover:underline">Ledger</Link>
                    <Link to={`/school-admin/collect-fee?student=${student.id}`} className="text-green-600 hover:underline">Collect</Link>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                 <h2 className="text-xl font-bold text-gray-800">Add New Student</h2>
                 <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                    <X size={24} />
                 </button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label><input required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.student_name} onChange={e=>setFormData({...formData, student_name: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Father Name *</label><input required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.father_name} onChange={e=>setFormData({...formData, father_name: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Class *</label><input required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.class} onChange={e=>setFormData({...formData, class: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Section</label><input className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.section} onChange={e=>setFormData({...formData, section: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Roll No *</label><input required className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.roll_no} onChange={e=>setFormData({...formData, roll_no: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label><input required type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.mobile} onChange={e=>setFormData({...formData, mobile: e.target.value})} placeholder="919876543210" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Monthly Tuition Fee *</label><input required type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.monthly_fee} onChange={e=>setFormData({...formData, monthly_fee: Number(e.target.value)})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Transport Fee</label><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.transport_fee} onChange={e=>setFormData({...formData, transport_fee: Number(e.target.value)})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Previous Due</label><input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" value={formData.previous_due} onChange={e=>setFormData({...formData, previous_due: Number(e.target.value)})} /></div>
                 </div>
                 <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Student</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
