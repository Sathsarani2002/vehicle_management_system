import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { Search, Filter, Trash2, CheckCircle, XCircle, Clock, Pencil } from 'lucide-react';

export default function BookingManagement() {
  const { bookings, updateBookingStatus, updateBooking, deleteBooking, serviceCategories } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    customerName: '',
    phone: '',
    customerEmail: '',
    vehicleNumber: '',
    serviceType: '',
    date: '',
    time: '',
    status: 'Pending',
    paymentMethod: 'Pay To The Center',
    paymentStatus: 'Unpaid',
    transactionId: '',
  });

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesDate = !dateFilter || booking.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

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
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Booking ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error(error.message || 'Failed to update booking status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBooking(id);
      toast.success('Booking deleted successfully');
      setDeleteId(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete booking');
    }
  };

  const handleEditStart = (booking) => {
    setEditingBookingId(booking.id);
    setEditFormData({
      customerName: booking.customerName || '',
      phone: booking.phone || '',
      customerEmail: booking.customerEmail || '',
      vehicleNumber: booking.vehicleNumber || '',
      serviceType: booking.serviceType || '',
      date: booking.date || '',
      time: booking.time || '',
      status: booking.status || 'Pending',
      paymentMethod: booking.paymentMethod || 'Pay To The Center',
      paymentStatus: booking.paymentStatus || 'Unpaid',
      transactionId: booking.transactionId || '',
    });
  };

  const handleEditSave = async () => {
    if (
      !editFormData.customerName ||
      !editFormData.phone ||
      !editFormData.vehicleNumber ||
      !editFormData.serviceType ||
      !editFormData.date ||
      !editFormData.time
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editFormData.paymentMethod !== 'Pay To The Center' && !editFormData.transactionId) {
      toast.error('Transaction/reference ID is required for bank/online payments');
      return;
    }

    try {
      await updateBooking(editingBookingId, {
        ...editFormData,
        vehicleNumber: editFormData.vehicleNumber.toUpperCase(),
        transactionId: editFormData.paymentMethod === 'Pay To The Center' ? '' : editFormData.transactionId,
      });
      toast.success('Booking details updated successfully');
      setEditingBookingId(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update booking');
    }
  };

  const handleEditCancel = () => {
    setEditingBookingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
        <p className="text-gray-600 mt-1">
          Manage and track all service bookings
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, vehicle, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by date"
            />
          </div>

          {/* Active Filters */}
          {(searchQuery || statusFilter !== 'all' || dateFilter) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="ml-1">×</button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('all')} className="ml-1">×</button>
                </span>
              )}
              {dateFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Date: {dateFilter}
                  <button onClick={() => setDateFilter('')} className="ml-1">×</button>
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDateFilter('');
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredBookings.length}</span> of{' '}
          <span className="font-medium text-gray-900">{bookings.length}</span> bookings
        </p>
      </div>

      {editingBookingId && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Edit Booking #{editingBookingId}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input
                  value={editFormData.customerName}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={editFormData.customerEmail}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, customerEmail: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Vehicle Number</Label>
                <Input
                  value={editFormData.vehicleNumber}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, vehicleNumber: e.target.value.toUpperCase() }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select
                  value={editFormData.serviceType}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, serviceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceCategories.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={editFormData.time}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={editFormData.paymentMethod}
                  onValueChange={(value) => {
                    setEditFormData((prev) => ({
                      ...prev,
                      paymentMethod: value,
                      paymentStatus: value === 'Pay To The Center' ? 'Unpaid' : 'Paid',
                      transactionId: value === 'Pay To The Center' ? '' : prev.transactionId,
                    }));
                  }}
                >
                  <SelectTrigger>
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
                <Label>Payment Status</Label>
                <Select
                  value={editFormData.paymentStatus}
                  onValueChange={(value) => setEditFormData((prev) => ({ ...prev, paymentStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Transaction / Ref ID</Label>
                <Input
                  value={editFormData.transactionId}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, transactionId: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleEditSave}>Save Booking</Button>
              <Button variant="outline" onClick={handleEditCancel}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Vehicle</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Payment</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date & Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-gray-600">#{booking.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{booking.customerName}</p>
                          <p className="text-sm text-gray-600">{booking.phone}</p>
                          {booking.customerEmail && <p className="text-xs text-gray-500">{booking.customerEmail}</p>}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono font-medium text-gray-900">{booking.vehicleNumber}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-900">{booking.serviceType}</td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-900">{booking.paymentMethod || '-'}</p>
                        <p className="text-xs text-gray-600">{booking.paymentStatus || 'Unpaid'}</p>
                        {booking.transactionId && <p className="text-xs text-gray-500">Ref: {booking.transactionId}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900">{booking.date}</p>
                          <p className="text-sm text-gray-600">{booking.time}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {/* Status Actions */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditStart(booking)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          {booking.status === 'Pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(booking.id, 'Approved')}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(booking.id, 'Rejected')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {booking.status === 'Approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(booking.id, 'Completed')}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          {(booking.status === 'Completed' || booking.status === 'Rejected' || booking.status === 'Cancelled') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(booking.id, 'Pending')}
                              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                            >
                              <Clock className="w-4 h-4 mr-1" />
                              Reopen
                            </Button>
                          )}
                          
                          {/* Delete */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteId(booking.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
