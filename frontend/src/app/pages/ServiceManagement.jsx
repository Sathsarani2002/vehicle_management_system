import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
import { Plus, Wrench, Pencil, Trash2 } from 'lucide-react';

export default function ServiceManagement() {
  const { serviceCategories, addServiceCategory, updateServiceCategory, deleteServiceCategory } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addServiceCategory(formData);
      toast.success('Service category added successfully!');
      setFormData({ name: '', description: '' });
      setShowAddForm(false);
    } catch (error) {
      toast.error(error.message || 'Failed to add service category');
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description });
    setShowAddForm(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await updateServiceCategory(editingId, {
        name: formData.name,
        description: formData.description,
      });
      toast.success('Service category updated successfully!');
      setEditingId(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to update service category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteServiceCategory(id);
      toast.success('Service category deleted successfully');
      setDeleteId(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete service category');
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600 mt-1">
            Manage service categories and offerings
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Add Service Form */}
      {(showAddForm || editingId) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Service Category' : 'Add New Service Category'}</CardTitle>
            <CardDescription>
              {editingId ? 'Update the service information below' : 'Create a new service offering for customers'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Engine Tune-up"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this service includes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Save Changes' : 'Add Service'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Service Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Wrench className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl">{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{category.description}</p>
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Service ID: <span className="font-mono">#{category.id}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(category)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => setDeleteId(category.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {serviceCategories.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No service categories yet
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding your first service category
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Service Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Services</p>
              <p className="text-3xl font-bold text-gray-900">{serviceCategories.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Offerings</p>
              <p className="text-3xl font-bold text-green-600">{serviceCategories.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Categories</p>
              <p className="text-3xl font-bold text-blue-600">{serviceCategories.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the service category from future bookings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
