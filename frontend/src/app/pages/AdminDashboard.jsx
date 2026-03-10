import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp 
} from 'lucide-react';

export default function AdminDashboard() {
  const { bookings } = useApp();

  // Calculate statistics
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const approvedBookings = bookings.filter(b => b.status === 'Approved').length;
  const completedBookings = bookings.filter(b => b.status === 'Completed').length;
  const rejectedBookings = bookings.filter(b => b.status === 'Rejected').length;
  const cancelledBookings = bookings.filter(b => b.status === 'Cancelled').length;
  const paidBookings = bookings.filter(b => b.paymentStatus === 'Paid').length;
  const unpaidBookings = bookings.filter(b => (b.paymentStatus || 'Unpaid') === 'Unpaid').length;

  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings,
      icon: Calendar,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: '+12%',
    },
    {
      title: 'Pending',
      value: pendingBookings,
      icon: Clock,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      trend: `${pendingBookings} waiting`,
    },
    {
      title: 'Approved',
      value: approvedBookings,
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: 'Ready to service',
    },
    {
      title: 'Completed',
      value: completedBookings,
      icon: CheckCircle,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      trend: 'Finished',
    },
    {
      title: 'Rejected',
      value: rejectedBookings,
      icon: XCircle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      trend: 'Declined',
    },
    {
      title: 'Cancelled',
      value: cancelledBookings,
      icon: AlertCircle,
      bgColor: 'bg-rose-100',
      iconColor: 'text-rose-600',
      trend: 'Customer cancelled',
    },
  ];

  // Recent bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 text-white p-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-blue-100 mt-1">
          Welcome back! Here's an overview of your service bookings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-2">{stat.trend}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">Paid</p>
              <p className="text-2xl font-bold text-emerald-800">{paidBookings}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4">
              <p className="text-sm text-amber-700">Unpaid</p>
              <p className="text-2xl font-bold text-amber-800">{unpaidBookings}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p>Pending reviews: <span className="font-semibold">{pendingBookings}</span></p>
            <p>Ready/approved jobs: <span className="font-semibold">{approvedBookings}</span></p>
            <p>Completed this cycle: <span className="font-semibold">{completedBookings}</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings
                .filter(b => b.date === new Date().toISOString().split('T')[0])
                .slice(0, 3)
                .map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.serviceType}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{booking.time}</p>
                  </div>
                ))}
              {bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No appointments today</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings
                .filter(b => b.status === 'Pending')
                .slice(0, 3)
                .map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.vehicleNumber}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                      Review
                    </span>
                  </div>
                ))}
              {pendingBookings === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">All caught up! 🎉</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-lg font-bold text-gray-900">
                  {totalBookings > 0 
                    ? Math.round((completedBookings / totalBookings) * 100) 
                    : 0}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0}%` 
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-600">Approved</p>
                  <p className="text-xl font-bold text-green-600">{approvedBookings}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Rejected</p>
                  <p className="text-xl font-bold text-red-600">{rejectedBookings}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Vehicle</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customerName}</p>
                        <p className="text-sm text-gray-600">{booking.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{booking.vehicleNumber}</td>
                    <td className="py-3 px-4 text-gray-900">{booking.serviceType}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-gray-900">{booking.date}</p>
                        <p className="text-sm text-gray-600">{booking.time}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
