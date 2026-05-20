import { useState } from 'react';
import { useStore } from '../store';
import { MessageCircle, CreditCard, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PendingFees = () => {
  const { currentUser, students, schools, reminderSettings } = useStore();

  const schoolStudents = students.filter(s => s.school_id === currentUser?.school_id && s.status === 'active');
  const pendingStudents = schoolStudents.filter(s => s.previous_due > 0);
  const currentSchool = schools.find(s => s.id === currentUser?.school_id);
  const settings = reminderSettings.find(s => s.school_id === currentUser?.school_id);

  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const filteredStudents = pendingStudents.filter(student => {
    const matchesSearch = student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.mobile.includes(searchTerm);
    const matchesClass = classFilter ? student.class === classFilter : true;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = Array.from(new Set(pendingStudents.map(s => s.class)));

  const handleWhatsAppReminder = (student: typeof pendingStudents[0]) => {
     if (!currentSchool) return;

     let message = settings?.late_fee_message_template ||
       "Dear Parent,\n\nThe school fee for {student_name} of Class {class} is still pending.\nPending Amount: ₹{due_amount}\n\nPlease clear the pending fee as soon as possible.\n\nRegards,\n{school_name}";

     message = message
       .replace('{school_name}', currentSchool.school_name)
       .replace('{student_name}', student.student_name)
       .replace('{class}', student.class)
       .replace('{due_amount}', student.previous_due.toString())
       .replace('{month}', new Date().toLocaleString('default', { month: 'long' }))
       .replace('{year}', new Date().getFullYear().toString());

     const encodedMessage = encodeURIComponent(message);
     window.open(`https://wa.me/91${student.mobile}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Pending Fee List</h1>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
           <select
             value={classFilter}
             onChange={(e) => setClassFilter(e.target.value)}
             className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
           >
              <option value="">All Classes</option>
              {uniqueClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
           </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Father Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Total Due</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{student.student_name}</td>
                  <td className="px-4 py-3 text-gray-600">{student.father_name}</td>
                  <td className="px-4 py-3 text-gray-600">{student.class} {student.section && `(${student.section})`}</td>
                  <td className="px-4 py-3 text-gray-600">{student.mobile}</td>
                  <td className="px-4 py-3 font-bold text-red-600">₹{student.previous_due}</td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleWhatsAppReminder(student)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle size={18} />
                    </button>
                    <Link
                      to={`/school-admin/collect-fee?student=${student.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Collect Fee"
                    >
                      <CreditCard size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No pending fees found.
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
