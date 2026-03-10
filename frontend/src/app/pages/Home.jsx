import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { Calendar, Clock, Car, User, Phone, Wrench, CreditCard, ListOrdered, LocateFixed } from 'lucide-react';
import logo from '../../assets/logo.png';
import premiumDetailingImage from '../../assets/premium_detailing.png';
import bnaCheckImage from '../../assets/BnA_check.png';

export default function Home() {
  const paymentSupportWhatsapp = '+94 77 123 4567';
  const paymentSupportWhatsappLink = 'https://wa.me/94771234567';
  const bankDetails = {
    bankName: 'Bank of Ceylon',
    branch: 'Colombo Fort',
    accountName: 'Autocare (Pvt) Ltd',
    accountNumber: '7465123098',
  };
  const navigate = useNavigate();
  const { addBooking, customerUser, logoutCustomer, serviceCategories, bookings } = useApp();
  const bookingFormId = 'booking-form';
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    vehicleNumber: '',
    serviceType: '',
    date: '',
    time: '',
    paymentMethod: 'Pay To The Center',
    paymentStatus: 'Unpaid',
    transactionId: '',
  });

  const redirectToCustomerLogin = () => {
    navigate('/website/login', { state: { redirectTo: '/website' } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerUser) {
      toast.error('Please login or register before booking an appointment');
      redirectToCustomerLogin();
      return;
    }

    // Validation
    if (!formData.customerName || !formData.phone || !formData.vehicleNumber ||
        !formData.serviceType || !formData.date || !formData.time || !formData.paymentMethod) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.paymentMethod !== 'Pay To The Center' && !formData.transactionId) {
      toast.error('Please enter transaction/reference ID for online payments');
      return;
    }

    // Add booking
    try {
      const newBooking = await addBooking({
        ...formData,
        customerId: customerUser.id,
        customerEmail: customerUser.email,
      });

      toast.success('Booking submitted successfully!');
      navigate(`/website/booking-confirmation/${newBooking.id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to submit booking');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const customerBookings = customerUser
    ? bookings
        .filter((booking) => booking.customerId === customerUser.id || booking.customerEmail === customerUser.email)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  useEffect(() => {
    if (!customerUser) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      customerName: prev.customerName || customerUser.name,
      phone: prev.phone || customerUser.phone,
    }));
  }, [customerUser]);

  return (
    <div className="min-h-screen mesh-bg">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="reveal-up flex items-center gap-3">
              <img src={logo} alt="Autocare logo" className="h-12 w-12 object-contain scale-[2.1] shrink-0" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Autocare</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {customerUser ? (
                <>
                  <span className="hidden sm:inline text-sm text-gray-600">Hi, {customerUser.name}</span>
                  <Button variant="ghost" onClick={logoutCustomer}>
                    Logout
                  </Button>
                </>
              ) : null}
              <Button
                onClick={() => {
                  if (!customerUser) {
                    toast.error('Please login first to book an appointment');
                    redirectToCustomerLogin();
                    return;
                  }

                  document.getElementById(bookingFormId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {!customerUser ? (
          <>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex justify-center">
                <div className="reveal-up max-w-3xl text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
                    <Wrench className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Professional Service</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Book Your Service Appointment</h2>
                  <p className="text-lg text-gray-600 mb-8 max-w-xl">
                    Fast booking, trusted technicians, and easy tracking. Login to schedule your vehicle service in just a few steps.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button size="lg" onClick={redirectToCustomerLogin}>Login to Continue</Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('/website/register')}>Create Account</Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Pick Service & Time', detail: 'Choose service category, date, and time slot that fits your schedule.', icon: Calendar },
                  { title: 'Pay Your Way', detail: 'Pay to center, bank deposit, or online transfer with slip sharing via WhatsApp.', icon: CreditCard },
                  { title: 'Track & Manage', detail: 'Track status updates, change booking, cancel if needed, and download slip.', icon: Car },
                ].map((item, index) => (
                  <Card key={item.title} className="shadow-lg hover-lift reveal-up" style={{ animationDelay: `${index * 80}ms` }}>
                    <CardContent className="pt-6">
                      <item.icon className="w-6 h-6 text-blue-700 mb-3" />
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600 mt-2">{item.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <div className="grid lg:grid-cols-3 gap-5">
                {[
                  {
                    title: 'General Service',
                    image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=900&q=80',
                  },
                  {
                    title: 'Engine Diagnostics',
                    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80',
                  },
                  {
                    title: 'Brake & AC Check',
                    image: bnaCheckImage,
                  },
                ].map((service, index) => (
                  <Card key={service.title} className="overflow-hidden shadow-xl hover-lift reveal-up" style={{ animationDelay: `${120 + index * 80}ms` }}>
                    <img src={service.image} alt={service.title} className="h-48 w-full object-cover" />
                    <CardContent className="pt-4">
                      <p className="font-semibold text-slate-900">{service.title}</p>
                      <p className="text-sm text-slate-600 mt-1">Modern tools, expert team, and quality checks on every visit.</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 text-white p-8 md:p-10 shadow-xl reveal-up">
                <p className="text-sm text-cyan-100 uppercase tracking-wide">Ready to begin?</p>
                <h3 className="text-3xl font-bold mt-2">Book your next service in under 2 minutes</h3>
                <p className="mt-3 text-slate-200">Sign in, fill in details, pay your preferred way, and track the entire process.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => document.getElementById(bookingFormId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  >
                    Start Here
                  </Button>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid lg:grid-cols-2 gap-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 text-white p-8 md:p-10 shadow-xl overflow-hidden reveal-up">
                <div>
                  <p className="text-sm uppercase tracking-wide text-blue-100">Customer Dashboard</p>
                  <h2 className="text-3xl md:text-4xl font-bold mt-2">Welcome back, {customerUser.name}</h2>
                  <p className="mt-3 text-blue-100 max-w-3xl">
                    Scroll down and complete your booking in a simple flow: appointment details, payment details, and order tracking.
                  </p>
                  <div className="mt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => document.getElementById(bookingFormId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    >
                      Start Booking
                    </Button>
                  </div>
                </div>

                <div className="relative hidden lg:block">
                  <img
                    src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=80"
                    alt="Vehicle service workshop"
                    className="h-56 w-full rounded-2xl object-cover shadow-2xl float-soft"
                  />
                  <div className="absolute -bottom-3 -left-3 glass-panel text-slate-900 rounded-xl px-3 py-2 text-sm shadow">
                    Real-time booking updates
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  'Fill customer and vehicle details',
                  'Choose date, time, and service type',
                  'Add payment method and reference',
                  'Submit and track or update booking',
                ].map((step, index) => (
                  <Card key={step} className="shadow-md hover-lift reveal-up" style={{ animationDelay: `${index * 80}ms` }}>
                    <CardContent className="pt-6">
                      <p className="text-xs font-semibold text-blue-700 mb-2">STEP {index + 1}</p>
                      <p className="text-sm text-gray-700">{step}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Premium Detailing',
                    image: premiumDetailingImage,
                  },
                  {
                    title: 'Engine Diagnostics',
                    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80',
                  },
                  {
                    title: 'Brake & Safety Check',
                    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=80',
                  },
                ].map((item, index) => (
                  <Card key={item.title} className="overflow-hidden shadow-lg hover-lift reveal-up" style={{ animationDelay: `${140 + index * 80}ms` }}>
                    <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
                    <CardContent className="pt-4">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-600 mt-1">Trusted technicians and modern tools for reliable service.</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <form onSubmit={handleSubmit} className="pb-16">
              <section id={bookingFormId} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Card className="shadow-xl hover-lift reveal-up">
                  <CardHeader>
                    <CardTitle>Booking Form</CardTitle>
                    <CardDescription>Enter customer and appointment details.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="customerName"
                          placeholder="Enter your full name"
                          value={formData.customerName}
                          onChange={(e) => handleInputChange('customerName', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+94 77 123 4567"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                      <div className="relative">
                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="vehicleNumber"
                          placeholder="ABC-123"
                          value={formData.vehicleNumber}
                          onChange={(e) => handleInputChange('vehicleNumber', e.target.value.toUpperCase())}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Service Type</Label>
                      <Select
                        value={formData.serviceType}
                        onValueChange={(value) => handleInputChange('serviceType', value)}
                      >
                        <SelectTrigger id="serviceType">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {serviceCategories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Preferred Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleInputChange('date', e.target.value)}
                          className="pl-10"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Preferred Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) => handleInputChange('time', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Card className="shadow-xl hover-lift reveal-up" style={{ animationDelay: '90ms' }}>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Select your payment method and add reference ID.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(value) => {
                          handleInputChange('paymentMethod', value);
                          handleInputChange('paymentStatus', value === 'Pay To The Center' ? 'Unpaid' : 'Paid');
                          if (value === 'Pay To The Center') {
                            handleInputChange('transactionId', '');
                          }
                        }}
                      >
                        <SelectTrigger id="paymentMethod">
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
                      <Label htmlFor="transactionId">Transaction / Reference ID</Label>
                      <Input
                        id="transactionId"
                        placeholder="Required for bank deposit / online transfer"
                        value={formData.transactionId}
                        onChange={(e) => handleInputChange('transactionId', e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                      <p className="font-medium">After payment, send your payment slip to WhatsApp</p>
                      <p className="mt-1">
                        WhatsApp Number: <span className="font-semibold">{paymentSupportWhatsapp}</span>
                      </p>
                      <a
                        href={paymentSupportWhatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-emerald-800 underline"
                      >
                        Open WhatsApp Chat
                      </a>
                    </div>

                    {(formData.paymentMethod === 'Bank Deposit' || formData.paymentMethod === 'Online Transfer') && (
                      <div className="md:col-span-2 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                        <p className="font-semibold mb-2">Bank Payment Details (Sri Lanka)</p>
                        <p>Bank: {bankDetails.bankName}</p>
                        <p>Branch: {bankDetails.branch}</p>
                        <p>Account Name: {bankDetails.accountName}</p>
                        <p>Account Number: {bankDetails.accountNumber}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="shadow-xl hover-lift reveal-up">
                    <CardHeader>
                      <CardTitle>Order Tracking</CardTitle>
                      <CardDescription>Track and manage your booking after submission.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border bg-emerald-50 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <LocateFixed className="w-4 h-4 text-emerald-700" />
                          <p className="font-medium text-emerald-900">Tracking Status</p>
                        </div>
                        <p className="text-sm text-emerald-800">
                          Booking can move through Pending, Approved, Completed, or Cancelled.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-xl hover-lift reveal-up" style={{ animationDelay: '90ms' }}>
                    <CardHeader>
                      <CardTitle>Your Recent Bookings</CardTitle>
                      <CardDescription>Open details to track, change, cancel, or download slip.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {customerBookings.length === 0 ? (
                        <p className="text-sm text-gray-600">No bookings yet. Submit your first appointment below.</p>
                      ) : (
                        customerBookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between rounded border p-3 hover:bg-slate-50 transition-colors">
                            <div>
                              <p className="text-sm font-medium text-gray-900">#{booking.id} • {booking.serviceType}</p>
                              <p className="text-xs text-gray-600">{booking.date} at {booking.time} • {booking.status}</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/website/booking-confirmation/${booking.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
                <Button type="submit" className="w-full md:w-auto" size="lg">
                  Book Appointment
                </Button>
              </section>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
