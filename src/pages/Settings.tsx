import React from "react";
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Save } from 'lucide-react';

export const Settings = () => {
  const { currentUser, schools, reminderSettings, updateSchool, updateReminderSettings } = useStore();

  const currentSchool = schools.find(s => s.id === currentUser?.school_id);
  const currentSettings = reminderSettings.find(s => s.school_id === currentUser?.school_id);

  const [schoolData, setSchoolData] = useState({
    school_name: '', address: '', phone: '', email: ''
  });

  const [remindersData, setRemindersData] = useState({
    fee_due_day: 10,
    reminder_before_days: 5,
    enable_before_due_reminder: true,
    enable_due_date_reminder: true,
    enable_late_fee_reminder: true,
    before_due_message_template: '',
    due_date_message_template: '',
    late_fee_message_template: ''
  });

  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currentSchool) {
      setSchoolData({
        school_name: currentSchool.school_name,
        address: currentSchool.address,
        phone: currentSchool.phone,
        email: currentSchool.email
      });
    }
    if (currentSettings) {
      setRemindersData({
        fee_due_day: currentSettings.fee_due_day,
        reminder_before_days: currentSettings.reminder_before_days,
        enable_before_due_reminder: currentSettings.enable_before_due_reminder,
        enable_due_date_reminder: currentSettings.enable_due_date_reminder,
        enable_late_fee_reminder: currentSettings.enable_late_fee_reminder,
        before_due_message_template: currentSettings.before_due_message_template,
        due_date_message_template: currentSettings.due_date_message_template,
        late_fee_message_template: currentSettings.late_fee_message_template
      });
    }
  }, [currentSchool, currentSettings]);

  const handleSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentSchool) {
      updateSchool(currentSchool.id, schoolData);
      showSuccess();
    }
  };

  const handleRemindersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.school_id) {
      updateReminderSettings({ ...remindersData, school_id: currentUser.school_id });
      showSuccess();
    }
  };

  const showSuccess = () => {
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 relative">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      {successMsg && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-6 py-3 rounded-lg shadow-md z-50">
          {successMsg}
        </div>
      )}

      {/* School Profile Settings */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">School Profile</h2>
        <form onSubmit={handleSchoolSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
              <input required value={schoolData.school_name} onChange={e=>setSchoolData({...schoolData, school_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" value={schoolData.email} onChange={e=>setSchoolData({...schoolData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input required value={schoolData.phone} onChange={e=>setSchoolData({...schoolData, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input required value={schoolData.address} onChange={e=>setSchoolData({...schoolData, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
             <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
               <Save size={18} /> Save Profile
             </button>
          </div>
        </form>
      </section>

      {/* Reminder Settings */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Auto Fee Reminder Settings</h2>
        <form onSubmit={handleRemindersSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Fee Due Date (Day of Month)</label>
                 <input type="number" min="1" max="31" required value={remindersData.fee_due_day} onChange={e=>setRemindersData({...remindersData, fee_due_day: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Days before to send early reminder</label>
                 <input type="number" min="1" max="15" required value={remindersData.reminder_before_days} onChange={e=>setRemindersData({...remindersData, reminder_before_days: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded" />
               </div>
               <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2">
                     <input type="checkbox" checked={remindersData.enable_before_due_reminder} onChange={e=>setRemindersData({...remindersData, enable_before_due_reminder: e.target.checked})} />
                     <span className="text-sm">Enable 'Before Due Date' Reminders</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input type="checkbox" checked={remindersData.enable_due_date_reminder} onChange={e=>setRemindersData({...remindersData, enable_due_date_reminder: e.target.checked})} />
                     <span className="text-sm">Enable 'On Due Date' Reminders</span>
                  </label>
                  <label className="flex items-center gap-2">
                     <input type="checkbox" checked={remindersData.enable_late_fee_reminder} onChange={e=>setRemindersData({...remindersData, enable_late_fee_reminder: e.target.checked})} />
                     <span className="text-sm">Enable 'Late Fee' Reminders</span>
                  </label>
               </div>
            </div>

            <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Before Due Date Template</label>
                 <textarea rows={4} value={remindersData.before_due_message_template} onChange={e=>setRemindersData({...remindersData, before_due_message_template: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"></textarea>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">On Due Date Template</label>
                 <textarea rows={4} value={remindersData.due_date_message_template} onChange={e=>setRemindersData({...remindersData, due_date_message_template: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"></textarea>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee Template</label>
                 <textarea rows={4} value={remindersData.late_fee_message_template} onChange={e=>setRemindersData({...remindersData, late_fee_message_template: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"></textarea>
               </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
             <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4">
               <Save size={18} /> Save Reminder Settings
             </button>
          </div>
        </form>
      </section>

    </div>
  );
};
