import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type Role = 'super_admin' | 'school_admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  school_id: string | null;
  created_at: string;
}

export interface School {
  id: string;
  school_name: string;
  address: string;
  phone: string;
  email: string;
  logo_url: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  student_name: string;
  father_name: string;
  class: string;
  section: string;
  roll_no: string;
  mobile: string;
  monthly_fee: number;
  transport_fee: number;
  admission_fee: number;
  previous_due: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Fee {
  id: string;
  school_id: string;
  student_id: string;
  month: string;
  year: string;
  tuition_fee: number;
  transport_fee: number;
  extra_charges: number;
  discount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  payment_status: 'paid' | 'partial' | 'pending';
  payment_mode: 'Cash' | 'UPI' | 'Bank' | 'Other' | null;
  payment_date: string | null;
  receipt_no: string | null;
  created_at: string;
}

export interface Receipt {
  id: string;
  school_id: string;
  student_id: string;
  fee_id: string;
  receipt_no: string;
  amount_paid: number;
  payment_mode: 'Cash' | 'UPI' | 'Bank' | 'Other';
  receipt_date: string;
  pdf_url: string;
  created_at: string;
}

export interface ReminderSettings {
  id: string;
  school_id: string;
  fee_due_day: number;
  reminder_before_days: number;
  enable_before_due_reminder: boolean;
  enable_due_date_reminder: boolean;
  enable_late_fee_reminder: boolean;
  reminder_channel: 'WhatsApp' | 'SMS' | 'Email';
  before_due_message_template: string;
  due_date_message_template: string;
  late_fee_message_template: string;
  created_at: string;
  updated_at: string;
}

interface AppState {
  users: User[];
  schools: School[];
  students: Student[];
  fees: Fee[];
  receipts: Receipt[];
  reminderSettings: ReminderSettings[];
  currentUser: User | null;

  login: (email: string) => void;
  logout: () => void;
  addSchool: (school: Omit<School, 'id' | 'created_at'>, adminEmail: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'created_at'>) => void;
  collectFee: (fee: Omit<Fee, 'id' | 'created_at' | 'receipt_no'>) => void;
  updateSchool: (id: string, updates: Partial<School>) => void;
  updateReminderSettings: (settings: Partial<ReminderSettings>) => void;
}

const initialSchools: School[] = [
  {
    id: 'school_1',
    school_name: 'Global Public English School',
    address: '123 Global Avenue, Delhi',
    phone: '9876543210',
    email: 'admin@globalpublic.com',
    logo_url: '',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'school_2',
    school_name: 'Bright Future Academy',
    address: '456 Bright Street, Mumbai',
    phone: '9876543211',
    email: 'admin@brightfuture.com',
    logo_url: '',
    status: 'active',
    created_at: new Date().toISOString(),
  }
];

const initialUsers: User[] = [
  {
    id: 'user_1',
    email: 'super@admin.com',
    role: 'super_admin',
    school_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'user_2',
    email: 'admin@globalpublic.com',
    role: 'school_admin',
    school_id: 'school_1',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user_3',
    email: 'admin@brightfuture.com',
    role: 'school_admin',
    school_id: 'school_2',
    created_at: new Date().toISOString(),
  }
];

const initialStudents: Student[] = [
  {
    id: 'student_1',
    school_id: 'school_1',
    student_name: 'Aarav Sharma',
    father_name: 'Rajesh Sharma',
    class: '10',
    section: 'A',
    roll_no: '101',
    mobile: '919876543210',
    monthly_fee: 2500,
    transport_fee: 500,
    admission_fee: 0,
    previous_due: 0,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'student_2',
    school_id: 'school_1',
    student_name: 'Vihaan Patel',
    father_name: 'Sanjay Patel',
    class: '9',
    section: 'B',
    roll_no: '201',
    mobile: '919876543211',
    monthly_fee: 2400,
    transport_fee: 0,
    admission_fee: 0,
    previous_due: 500,
    status: 'active',
    created_at: new Date().toISOString(),
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: initialUsers,
      schools: initialSchools,
      students: initialStudents,
      fees: [],
      receipts: [],
      reminderSettings: [],
      currentUser: null,

      login: (email) => {
        const user = get().users.find((u) => u.email === email);
        if (user) {
          set({ currentUser: user });
        } else {
            // For testing: auto create if not found
            if(email === 'super@admin.com') {
               const newUser: User = { id: uuidv4(), email, role: 'super_admin', school_id: null, created_at: new Date().toISOString() };
               set((state) => ({ users: [...state.users, newUser], currentUser: newUser }));
            }
        }
      },

      logout: () => set({ currentUser: null }),

      addSchool: (schoolData, adminEmail) => {
        const schoolId = uuidv4();
        const newSchool: School = { ...schoolData, id: schoolId, created_at: new Date().toISOString() };
        const newUser: User = { id: uuidv4(), email: adminEmail, role: 'school_admin', school_id: schoolId, created_at: new Date().toISOString() };

        const newSettings: ReminderSettings = {
           id: uuidv4(),
           school_id: schoolId,
           fee_due_day: 10,
           reminder_before_days: 5,
           enable_before_due_reminder: true,
           enable_due_date_reminder: true,
           enable_late_fee_reminder: true,
           reminder_channel: 'WhatsApp',
           before_due_message_template: "Dear Parent,\nThis is a gentle reminder from {school_name}.\n\nStudent Name: {student_name}\nClass: {class}\nFee Month: {month} {year}\nDue Date: {due_date}\nAmount Payable: ₹{amount}\n\nKindly pay the school fee before the due date to avoid pending dues.\n\nRegards,\n{school_name}",
           due_date_message_template: "Dear Parent,\nToday is the fee due date for {student_name} of Class {class}.\n\nFee Month: {month} {year}\nAmount Payable: ₹{amount}\n\nKindly clear the fee today.\n\nRegards,\n{school_name}",
           late_fee_message_template: "Dear Parent,\nThe school fee for {student_name} of Class {class} is still pending.\n\nFee Month: {month} {year}\nPending Amount: ₹{due_amount}\n\nPlease clear the pending fee as soon as possible.\n\nRegards,\n{school_name}",
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString()
        }

        set((state) => ({
          schools: [...state.schools, newSchool],
          users: [...state.users, newUser],
          reminderSettings: [...state.reminderSettings, newSettings]
        }));
      },

      addStudent: (studentData) => {
        const newStudent: Student = { ...studentData, id: uuidv4(), created_at: new Date().toISOString() };
        set((state) => ({ students: [...state.students, newStudent] }));
      },

      collectFee: (feeData) => {
        const receiptNo = `SFM-${new Date().getFullYear()}-${String(get().receipts.length + 1).padStart(4, '0')}`;
        const feeId = uuidv4();

        const newFee: Fee = { ...feeData, id: feeId, receipt_no: receiptNo, created_at: new Date().toISOString() };

        const newReceipt: Receipt = {
          id: uuidv4(),
          school_id: feeData.school_id,
          student_id: feeData.student_id,
          fee_id: feeId,
          receipt_no: receiptNo,
          amount_paid: feeData.paid_amount,
          payment_mode: feeData.payment_mode || 'Cash',
          receipt_date: feeData.payment_date || new Date().toISOString(),
          pdf_url: '',
          created_at: new Date().toISOString()
        };

        set((state) => {
            // Update student previous due
            const updatedStudents = state.students.map(s => {
                if (s.id === feeData.student_id) {
                    return { ...s, previous_due: feeData.due_amount };
                }
                return s;
            });

            return {
                fees: [...state.fees, newFee],
                receipts: [...state.receipts, newReceipt],
                students: updatedStudents
            };
        });
      },

      updateSchool: (id, updates) => {
        set((state) => ({
          schools: state.schools.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },

      updateReminderSettings: (settings) => {
          set((state) => {
             const existing = state.reminderSettings.find(s => s.school_id === settings.school_id);
             if (existing) {
                 return {
                     reminderSettings: state.reminderSettings.map(s => s.school_id === settings.school_id ? { ...s, ...settings, updated_at: new Date().toISOString() } : s)
                 }
             } else {
                 return {
                     reminderSettings: [...state.reminderSettings, { ...settings, id: uuidv4(), updated_at: new Date().toISOString() } as ReminderSettings]
                 }
             }
          });
      }
    }),
    {
      name: 'school-fee-manager-storage',
    }
  )
);
