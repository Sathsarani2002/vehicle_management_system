import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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
import { Search, Pencil, Trash2, Users } from 'lucide-react';

export default function UserManagement() {
  const { customerAccounts, updateCustomerAccount, deleteCustomerAccount, bookings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });

  const filteredUsers = customerAccounts.filter((user) => {
    if (!user) {
      return false;
    }

    const query = (searchQuery || '').toLowerCase();
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const phone = String(user.phone || '');

    return (
      name.includes(query) ||
      email.includes(query) ||
      phone.includes(searchQuery)
    );
  });

  const getUserBookingCount = (user) => {
    return bookings.filter(
      (booking) => booking.customerId === user.id || booking.customerEmail === user.email
    ).length;
  };

  const startEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: '',
    });
  };

  const saveEdit = async () => {
    if (!formData.name || !formData.phone || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    const emailInUse = customerAccounts.some((user) => {
      if (!user?.id || !user?.email) {
        return false;
      }
      return user.id !== editingUserId && user.email.toLowerCase() === formData.email.trim().toLowerCase();
    });

    if (emailInUse) {
      toast.error('Another user already uses this email address');
      return;
    }

    const updates = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim().toLowerCase(),
    };

    if (formData.password.trim()) {
      updates.password = formData.password.trim();
    }

    try {
      await updateCustomerAccount(editingUserId, updates);
      toast.success('Customer details updated successfully');
      setEditingUserId(null);
      setFormData({ name: '', phone: '', email: '', password: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to update customer details');
    }
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setFormData({ name: '', phone: '', email: '', password: '' });
  };

  const handleDelete = async (id) => {
    if (id === 'demo-customer-1') {
      toast.error('Demo customer cannot be deleted');
      setDeleteUserId(null);
      return;
    }

    try {
      await deleteCustomerAccount(id);
      toast.success('Customer account deleted successfully');
      setDeleteUserId(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete customer account');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-700 text-white p-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-blue-100 mt-1">View and manage all registered customers and their account details.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {editingUserId && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Edit Customer</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>New Password (optional)</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button onClick={saveEdit}>Save Changes</Button>
              <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registered Customers ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Bookings</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-500">No customers found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            {user.id === 'demo-customer-1' && (
                              <p className="text-xs text-blue-700">Demo account</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{user.phone}</td>
                      <td className="py-3 px-4 text-gray-900">{user.email}</td>
                      <td className="py-3 px-4 text-gray-900">{getUserBookingCount(user)}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(user.createdAt).toLocaleDateString('en-LK')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => setDeleteUserId(user.id)}
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

      <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The customer will no longer be able to log in with this account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteUserId && handleDelete(deleteUserId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
