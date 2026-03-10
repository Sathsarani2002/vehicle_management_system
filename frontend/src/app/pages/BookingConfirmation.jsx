import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { CheckCircle2, Calendar, Clock, Car, User, Phone, Wrench, CreditCard } from 'lucide-react';
import logo from '../../assets/logo.png';
import { jsPDF } from 'jspdf';

export default function BookingConfirmation() {
  const paymentSupportWhatsapp = '+94 77 123 4567';
  const paymentSupportWhatsappLink = 'https://wa.me/94771234567';
  const bankDetails = {
    bankName: 'Bank of Ceylon',
    branch: 'Colombo Fort',
    accountName: 'Autocare (Pvt) Ltd',
    accountNumber: '7465123098',
  };
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, updateBooking, cancelBooking } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const booking = bookings.find(b => b.id === id);

  const [editData, setEditData] = useState({
    vehicleNumber: booking?.vehicleNumber || '',
    serviceType: booking?.serviceType || '',
    date: booking?.date || '',
    time: booking?.time || '',
    paymentMethod: booking?.paymentMethod || 'Pay To The Center',
    transactionId: booking?.transactionId || '',
  });

  const trackingSteps = useMemo(() => {
    const currentStatus = booking?.status || 'Pending';
    const sequence = ['Pending', 'Approved', 'Completed'];
    const currentIndex = sequence.indexOf(currentStatus);

    return sequence.map((step, index) => ({
      title: step,
      done: currentStatus === 'Cancelled' ? false : index <= currentIndex,
    }));
  }, [booking?.status]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Booking not found</p>
            <Button onClick={() => navigate('/website')}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEditField = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!editData.vehicleNumber || !editData.serviceType || !editData.date || !editData.time) {
      toast.error('Please fill in all required booking fields');
      return;
    }

    if (editData.paymentMethod !== 'Pay To The Center' && !editData.transactionId) {
      toast.error('Please add transaction/reference ID for online payment methods');
      return;
    }

    try {
      await updateBooking(booking.id, {
        ...editData,
        vehicleNumber: editData.vehicleNumber.toUpperCase(),
        paymentStatus: editData.paymentMethod === 'Pay To The Center' ? 'Unpaid' : 'Paid',
      });
      setIsEditing(false);
      toast.success('Booking updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update booking');
    }
  };

  const handleCancelBooking = async () => {
    try {
      await cancelBooking(booking.id);
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const handleDownloadSlip = () => {
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const marginX = 14;
      const contentWidth = pageWidth - marginX * 2;
      let y = 18;

      const safeText = (value) => (value ? String(value) : '-');
      const statusColorMap = {
        Pending: { bg: [254, 243, 199], text: [146, 64, 14] },
        Approved: { bg: [219, 234, 254], text: [30, 64, 175] },
        Completed: { bg: [220, 252, 231], text: [22, 101, 52] },
        Rejected: { bg: [254, 226, 226], text: [153, 27, 27] },
        Cancelled: { bg: [254, 226, 226], text: [153, 27, 27] },
      };

      const drawFieldRow = (x, fieldY, label, value, width) => {
        const labelWidth = 34;
        const textWidth = width - labelWidth - 6;
        const wrappedValue = pdf.splitTextToSize(safeText(value), textWidth);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.setTextColor(55, 65, 81);
        pdf.text(`${label}:`, x + 4, fieldY);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(17, 24, 39);
        pdf.text(wrappedValue, x + labelWidth, fieldY);

        return Math.max(6, wrappedValue.length * 4 + 2);
      };

      const drawSection = (title, rows) => {
        const rowHeightEstimate = rows.reduce((sum, row) => {
          const wrapped = pdf.splitTextToSize(safeText(row.value), contentWidth - 44);
          return sum + Math.max(6, wrapped.length * 4 + 2);
        }, 0);

        const boxHeight = rowHeightEstimate + 16;

        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.roundedRect(marginX, y, contentWidth, boxHeight, 2, 2, 'FD');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(15, 23, 42);
        pdf.text(title, marginX + 4, y + 6);

        let rowY = y + 12;
        rows.forEach((row) => {
          const consumed = drawFieldRow(marginX, rowY, row.label, row.value, contentWidth);
          rowY += consumed;
        });

        y += boxHeight + 5;
      };

      pdf.setFillColor(13, 44, 84);
      pdf.rect(0, 0, pageWidth, 34, 'F');
      pdf.setFillColor(8, 145, 178);
      pdf.rect(0, 34, pageWidth, 2.5, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(17);
      pdf.text('Autocare Service Booking Slip', marginX, 13);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Reference ID: #${booking.id}`, marginX, 21);
      pdf.text(`Issued Date: ${new Date().toLocaleDateString('en-LK')}`, marginX, 27);

      const statusStyle = statusColorMap[booking.status] || { bg: [229, 231, 235], text: [31, 41, 55] };
      pdf.setFillColor(...statusStyle.bg);
      pdf.roundedRect(pageWidth - 50, 12, 36, 11, 3, 3, 'F');
      pdf.setTextColor(...statusStyle.text);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(safeText(booking.status), pageWidth - 45, 19);

      y = 45;

      drawSection('Customer Information', [
        { label: 'Name', value: booking.customerName },
        { label: 'Phone', value: booking.phone },
        { label: 'Email', value: booking.customerEmail },
      ]);

      drawSection('Appointment Details', [
        { label: 'Vehicle Number', value: booking.vehicleNumber },
        { label: 'Service Type', value: booking.serviceType },
        {
          label: 'Date',
          value: new Date(booking.date).toLocaleDateString('en-LK', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        },
        { label: 'Time', value: booking.time },
      ]);

      drawSection('Payment Summary', [
        { label: 'Method', value: booking.paymentMethod || 'Pay To The Center' },
        { label: 'Status', value: booking.paymentStatus || 'Unpaid' },
        { label: 'Reference ID', value: booking.transactionId || '-' },
      ]);

      pdf.setDrawColor(203, 213, 225);
      pdf.line(marginX, 281, pageWidth - marginX, 281);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      pdf.text('Please keep this slip for your records and present it at service check-in.', marginX, 286);
      pdf.text(`Support WhatsApp: ${paymentSupportWhatsapp}`, pageWidth - 80, 286);

      pdf.save(`Autocare_Slip_${booking.id}.pdf`);
      toast.success('Slip downloaded successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to download slip');
    }
  };

  return (
    <div className="min-h-screen mesh-bg">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b sticky top-0 z-20 no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Autocare logo" className="h-12 w-12 object-contain scale-[2.1] shrink-0" />
            <h1 className="text-2xl font-bold text-gray-900">Autocare</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="text-center mb-8 reveal-up no-print">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 pulse-ring">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-lg text-gray-600">
            Your service appointment has been successfully submitted
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="shadow-lg hover-lift reveal-up print-order-slip overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-800 text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2">
                  <img src={logo} alt="Autocare logo" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <CardTitle className="text-white">Service Booking Slip</CardTitle>
                  <CardDescription className="text-blue-100">
                    Reference ID: <span className="font-mono font-medium text-white">#{booking.id}</span>
                  </CardDescription>
                </div>
              </div>
              <div className="rounded-md bg-white/15 px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-wide text-blue-100">Issued On</p>
                <p className="text-sm font-semibold text-white">
                  {new Date().toLocaleDateString('en-LK', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 slip-content">
            <div className="grid md:grid-cols-2 gap-6 slip-grid">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{booking.customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{booking.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Number</p>
                    <p className="font-medium text-gray-900">{booking.vehicleNumber}</p>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Service Information</h3>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service Type</p>
                    <p className="font-medium text-gray-900">{booking.serviceType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.date).toLocaleDateString('en-LK', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">{booking.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-cyan-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment</p>
                    <p className="font-medium text-gray-900">{booking.paymentMethod || 'Pay To The Center'}</p>
                    <p className="text-sm text-gray-600">
                      {booking.paymentStatus || 'Unpaid'}
                      {booking.transactionId ? ` • Ref: ${booking.transactionId}` : ''}
                    </p>
                  </div>
                </div>

                {(booking.paymentMethod === 'Bank Deposit' || booking.paymentMethod === 'Online Transfer') && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Bank Payment Details</p>
                    <p className="text-sm text-blue-900">Bank: {bankDetails.bankName}</p>
                    <p className="text-sm text-blue-900">Branch: {bankDetails.branch}</p>
                    <p className="text-sm text-blue-900">A/C Name: {bankDetails.accountName}</p>
                    <p className="text-sm text-blue-900">A/C No: {bankDetails.accountNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'Approved'
                      ? 'bg-blue-100 text-blue-800'
                      : booking.status === 'Rejected'
                      ? 'bg-red-100 text-red-800'
                      : booking.status === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t no-print">
              <p className="text-sm text-gray-600 mb-3">Order Tracking</p>
              <div className="grid sm:grid-cols-3 gap-2">
                {trackingSteps.map((step) => (
                  <div
                    key={step.title}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      step.done ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    {step.title}
                  </div>
                ))}
              </div>
              {booking.status === 'Cancelled' && (
                <p className="mt-3 text-sm text-red-700">This booking has been cancelled.</p>
              )}
              {booking.status === 'Rejected' && (
                <p className="mt-3 text-sm text-red-700">This booking was rejected by the service team.</p>
              )}
            </div>

            {isEditing && booking.status !== 'Cancelled' && (
              <div className="mt-6 pt-6 border-t space-y-4 no-print">
                <h3 className="font-semibold text-gray-900">Change Booking</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editVehicle">Vehicle Number</Label>
                    <Input
                      id="editVehicle"
                      value={editData.vehicleNumber}
                      onChange={(e) => handleEditField('vehicleNumber', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editService">Service Type</Label>
                    <Input
                      id="editService"
                      value={editData.serviceType}
                      onChange={(e) => handleEditField('serviceType', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editDate">Date</Label>
                    <Input
                      id="editDate"
                      type="date"
                      value={editData.date}
                      onChange={(e) => handleEditField('date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editTime">Time</Label>
                    <Input
                      id="editTime"
                      type="time"
                      value={editData.time}
                      onChange={(e) => handleEditField('time', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editPaymentMethod">Payment Method</Label>
                    <Select
                      value={editData.paymentMethod}
                      onValueChange={(value) => {
                        handleEditField('paymentMethod', value);
                        if (value === 'Pay To The Center') {
                          handleEditField('transactionId', '');
                        }
                      }}
                    >
                      <SelectTrigger id="editPaymentMethod">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pay To The Center">Pay To The Center</SelectItem>
                        <SelectItem value="Bank Deposit">Bank Deposit</SelectItem>
                        <SelectItem value="Online Transfer">Online Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editRef">Transaction / Reference ID</Label>
                    <Input
                      id="editRef"
                      value={editData.transactionId}
                      onChange={(e) => handleEditField('transactionId', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSaveChanges}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Discard</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6 hover-lift reveal-up no-print" style={{ animationDelay: '90ms' }}>
          <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Our team will review your booking request</li>
            <li>• You will receive a confirmation call within 24 hours</li>
            <li>• Please arrive 10 minutes before your scheduled time</li>
            <li>• Keep your booking reference ID for future reference</li>
            <li>• You can change or cancel your booking from this page anytime before completion</li>
            <li>• After payment, send your payment slip on WhatsApp: {paymentSupportWhatsapp}</li>
            <li>• Bank details: {bankDetails.bankName}, {bankDetails.branch}, A/C {bankDetails.accountNumber}</li>
          </ul>
          <a
            href={paymentSupportWhatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-3 text-sm font-medium text-blue-900 underline"
          >
            Open WhatsApp Chat
          </a>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center reveal-up no-print" style={{ animationDelay: '150ms' }}>
          <Button onClick={() => navigate('/website')} variant="outline" size="lg">
            Book Another Service
          </Button>
          {booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
            <Button variant="outline" size="lg" onClick={() => setIsEditing(true)}>
              Change Booking
            </Button>
          )}
          {booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
            <Button variant="destructive" size="lg" onClick={handleCancelBooking}>
              Cancel Booking
            </Button>
          )}
          <Button onClick={handleDownloadSlip} size="lg">
            Download PDF Slip
          </Button>
        </div>
      </div>
    </div>
  );
}
