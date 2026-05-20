import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { Printer, Download, Share2, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Receipt = () => {
  const { id } = useParams(); // receipt_no
  const { receipts, fees, students, schools } = useStore();

  const receipt = receipts.find(r => r.receipt_no === id);
  const fee = fees.find(f => f.id === receipt?.fee_id);
  const student = students.find(s => s.id === receipt?.student_id);
  const school = schools.find(s => s.id === receipt?.school_id);

  if (!receipt || !fee || !student || !school) {
    return <div className="p-8 text-center text-red-500">Receipt not found or data is incomplete.</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text(school.school_name, 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(school.address, 105, 28, { align: 'center' });
    doc.text(`Phone: ${school.phone}`, 105, 34, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(14, 40, 196, 40);

    // Title
    doc.setFontSize(14);
    doc.text('FEE RECEIPT', 105, 50, { align: 'center' });

    // Details
    doc.setFontSize(10);
    doc.text(`Receipt No: ${receipt.receipt_no}`, 14, 65);
    doc.text(`Date: ${new Date(receipt.receipt_date).toLocaleDateString()}`, 140, 65);

    doc.text(`Student Name: ${student.student_name}`, 14, 75);
    doc.text(`Roll No: ${student.roll_no}`, 140, 75);

    doc.text(`Father Name: ${student.father_name}`, 14, 85);
    doc.text(`Class: ${student.class} ${student.section ? `(${student.section})` : ''}`, 140, 85);

    doc.text(`Fee Month: ${fee.month} ${fee.year}`, 14, 95);

    // Table
    autoTable(doc, {
      startY: 105,
      head: [['Description', 'Amount (INR)']],
      body: [
        ['Tuition Fee', fee.tuition_fee],
        ['Transport Fee', fee.transport_fee],
        ['Extra Charges', fee.extra_charges],
        ['Discount', `-${fee.discount}`],
        ['Previous Due', (fee.total_amount - fee.tuition_fee - fee.transport_fee - fee.extra_charges + fee.discount)],
        [{ content: 'Total Amount', styles: { fontStyle: 'bold' } }, { content: fee.total_amount, styles: { fontStyle: 'bold' } }],
        [{ content: 'Paid Amount', styles: { fontStyle: 'bold', textColor: [0, 128, 0] } }, { content: fee.paid_amount, styles: { fontStyle: 'bold', textColor: [0, 128, 0] } }],
        [{ content: 'Remaining Due', styles: { fontStyle: 'bold', textColor: [255, 0, 0] } }, { content: fee.due_amount, styles: { fontStyle: 'bold', textColor: [255, 0, 0] } }],
      ],
      theme: 'grid',
      headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 1: { halign: 'right' } }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;

    doc.text(`Payment Mode: ${receipt.payment_mode}`, 14, finalY);

    doc.text('Authorized Signature', 140, finalY + 20);
    doc.line(135, finalY + 15, 190, finalY + 15);

    doc.save(`${receipt.receipt_no}.pdf`);
  };

  const handleShareWhatsApp = () => {
    const text = `Fee Receipt from ${school.school_name}%0A%0AReceipt No: ${receipt.receipt_no}%0AStudent: ${student.student_name}%0AAmount Paid: ₹${receipt.amount_paid}%0ADate: ${new Date(receipt.receipt_date).toLocaleDateString()}%0A%0AThank you!`;
    window.open(`https://wa.me/91${student.mobile}?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 print:m-0 print:max-w-none">
      {/* Actions Bar - Hidden in Print */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 print:hidden">
        <Link to="/school-admin/students" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
          <ArrowLeft size={18} /> Back
        </Link>
        <div className="flex gap-3">
          <button onClick={handleShareWhatsApp} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <Share2 size={18} /> WhatsApp
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <Download size={18} /> PDF
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
            <Printer size={18} /> Print
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
         <div className="text-center space-y-2 border-b-2 border-gray-800 pb-6 mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-900">{school.school_name}</h1>
            <p className="text-gray-600">{school.address}</p>
            <p className="text-gray-600">Phone: {school.phone}</p>
         </div>

         <div className="flex justify-between items-end mb-8">
            <div>
               <h2 className="text-xl font-bold tracking-widest text-gray-800 uppercase mb-4">FEE RECEIPT</h2>
               <div className="space-y-1 text-gray-800">
                  <p><span className="font-semibold w-24 inline-block">Receipt No:</span> {receipt.receipt_no}</p>
                  <p><span className="font-semibold w-24 inline-block">Date:</span> {new Date(receipt.receipt_date).toLocaleDateString()}</p>
               </div>
            </div>
            <div className="text-right space-y-1 text-gray-800">
               <p><span className="font-semibold">Fee Month:</span> {fee.month} {fee.year}</p>
            </div>
         </div>

         <div className="bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200 print:bg-white print:border-gray-800">
            <div className="grid grid-cols-2 gap-y-2">
               <p><span className="font-semibold w-28 inline-block text-gray-600">Student Name:</span> {student.student_name}</p>
               <p><span className="font-semibold w-20 inline-block text-gray-600">Roll No:</span> {student.roll_no}</p>
               <p><span className="font-semibold w-28 inline-block text-gray-600">Father Name:</span> {student.father_name}</p>
               <p><span className="font-semibold w-20 inline-block text-gray-600">Class:</span> {student.class} {student.section && `(${student.section})`}</p>
            </div>
         </div>

         <table className="w-full text-left border-collapse mb-8">
            <thead>
               <tr className="border-b-2 border-gray-800 text-gray-800">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount (₹)</th>
               </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-200">
               <tr>
                  <td className="py-2">Tuition Fee</td>
                  <td className="py-2 text-right">{fee.tuition_fee}</td>
               </tr>
               {fee.transport_fee > 0 && (
                  <tr>
                     <td className="py-2">Transport Fee</td>
                     <td className="py-2 text-right">{fee.transport_fee}</td>
                  </tr>
               )}
               {fee.extra_charges > 0 && (
                  <tr>
                     <td className="py-2">Extra Charges</td>
                     <td className="py-2 text-right">{fee.extra_charges}</td>
                  </tr>
               )}
               {fee.discount > 0 && (
                  <tr>
                     <td className="py-2 text-green-600">Discount</td>
                     <td className="py-2 text-right text-green-600">-{fee.discount}</td>
                  </tr>
               )}
               {(fee.total_amount - fee.tuition_fee - fee.transport_fee - fee.extra_charges + fee.discount) > 0 && (
                  <tr>
                     <td className="py-2">Previous Due</td>
                     <td className="py-2 text-right">{(fee.total_amount - fee.tuition_fee - fee.transport_fee - fee.extra_charges + fee.discount)}</td>
                  </tr>
               )}

               <tr className="font-bold text-gray-900 border-t-2 border-gray-800">
                  <td className="py-3">Total Amount</td>
                  <td className="py-3 text-right">₹{fee.total_amount}</td>
               </tr>
               <tr className="font-bold text-green-700">
                  <td className="py-2">Paid Amount</td>
                  <td className="py-2 text-right">₹{receipt.amount_paid}</td>
               </tr>
               {fee.due_amount > 0 && (
                  <tr className="font-bold text-red-600">
                     <td className="py-2">Remaining Due</td>
                     <td className="py-2 text-right">₹{fee.due_amount}</td>
                  </tr>
               )}
            </tbody>
         </table>

         <div className="flex justify-between items-end mt-16 text-sm text-gray-800">
            <div>
               <p><span className="font-semibold">Payment Mode:</span> {receipt.payment_mode}</p>
            </div>
            <div className="text-center">
               <div className="w-48 border-b border-gray-800 mb-2"></div>
               <p>Authorized Signature</p>
            </div>
         </div>

         <div className="mt-8 text-center text-xs text-gray-500 print:block hidden">
            This is a computer generated receipt.
         </div>
      </div>
    </div>
  );
};
