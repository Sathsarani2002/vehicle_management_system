import React, { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ADMIN_TOKEN_STORAGE_KEY = 'vehicle-service-admin-token';
const CUSTOMER_TOKEN_STORAGE_KEY = 'vehicle-service-customer-token';

function getStoredToken(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveToken(key, token) {
  if (token) {
    localStorage.setItem(key, token);
  } else {
    localStorage.removeItem(key);
  }
}

async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

export function AppProvider({ children }) {
  const [adminToken, setAdminToken] = useState(() => getStoredToken(ADMIN_TOKEN_STORAGE_KEY));
  const [customerToken, setCustomerToken] = useState(() => getStoredToken(CUSTOMER_TOKEN_STORAGE_KEY));
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredToken(ADMIN_TOKEN_STORAGE_KEY)));
  const [bookings, setBookings] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [customerAccounts, setCustomerAccounts] = useState([]);
  const [customerUser, setCustomerUser] = useState(null);

  const refreshServices = async () => {
    const services = await apiRequest('/services');
    setServiceCategories(services);
    return services;
  };

  const refreshBookings = async (tokenToUse, role) => {
    if (!tokenToUse) {
      setBookings([]);
      return [];
    }

    const allBookings = await apiRequest('/bookings', { token: tokenToUse });
    setBookings(allBookings);

    if (role === 'customer') {
      return allBookings;
    }

    return allBookings;
  };

  const refreshCustomers = async (tokenToUse) => {
    if (!tokenToUse) {
      setCustomerAccounts([]);
      return [];
    }

    const customers = await apiRequest('/customers', { token: tokenToUse });
    setCustomerAccounts(customers);
    return customers;
  };

  useEffect(() => {
    async function bootstrap() {
      try {
        await refreshServices();
      } catch {
        setServiceCategories([]);
      }

      if (adminToken) {
        try {
          await refreshBookings(adminToken, 'admin');
          await refreshCustomers(adminToken);
          setIsAuthenticated(true);
        } catch {
          setIsAuthenticated(false);
          setAdminToken(null);
          saveToken(ADMIN_TOKEN_STORAGE_KEY, null);
        }
      }

      if (customerToken) {
        try {
          const me = await apiRequest('/auth/me', { token: customerToken });
          setCustomerUser(me.customer || null);

          if (!adminToken) {
            await refreshBookings(customerToken, 'customer');
          }
        } catch {
          setCustomerUser(null);
          setCustomerToken(null);
          saveToken(CUSTOMER_TOKEN_STORAGE_KEY, null);
        }
      }
    }

    bootstrap();
  }, []);

  const login = async (username, password) => {
    const payload = await apiRequest('/auth/admin/login', {
      method: 'POST',
      body: { username, password },
    });

    setAdminToken(payload.token);
    saveToken(ADMIN_TOKEN_STORAGE_KEY, payload.token);
    setIsAuthenticated(true);

    await Promise.all([refreshBookings(payload.token, 'admin'), refreshCustomers(payload.token), refreshServices()]);

    return true;
  };

  const logout = () => {
    setAdminToken(null);
    saveToken(ADMIN_TOKEN_STORAGE_KEY, null);
    setIsAuthenticated(false);
    setCustomerAccounts([]);

    if (customerToken) {
      refreshBookings(customerToken, 'customer').catch(() => setBookings([]));
    } else {
      setBookings([]);
    }
  };

  const registerCustomer = async (customerData) => {
    try {
      const payload = await apiRequest('/auth/customer/register', {
        method: 'POST',
        body: customerData,
      });

      setCustomerToken(payload.token);
      saveToken(CUSTOMER_TOKEN_STORAGE_KEY, payload.token);
      setCustomerUser(payload.customer);
      await refreshBookings(payload.token, 'customer');

      return { success: true, message: 'Registration successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const loginCustomer = async (email, password) => {
    try {
      const payload = await apiRequest('/auth/customer/login', {
        method: 'POST',
        body: { email, password },
      });

      setCustomerToken(payload.token);
      saveToken(CUSTOMER_TOKEN_STORAGE_KEY, payload.token);
      setCustomerUser(payload.customer);
      await refreshBookings(payload.token, 'customer');

      return { success: true, message: 'Login successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logoutCustomer = () => {
    setCustomerToken(null);
    saveToken(CUSTOMER_TOKEN_STORAGE_KEY, null);
    setCustomerUser(null);

    if (adminToken) {
      refreshBookings(adminToken, 'admin').catch(() => setBookings([]));
    } else {
      setBookings([]);
    }
  };

  const updateCustomerAccount = async (id, updates) => {
    if (!adminToken) {
      throw new Error('Admin session required');
    }

    const updated = await apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: updates,
      token: adminToken,
    });

    setCustomerAccounts((prev) => prev.map((customer) => (customer.id === id ? updated : customer)));

    if (customerUser?.id === id) {
      setCustomerUser(updated);
    }

    setBookings((prev) =>
      prev.map((booking) =>
        booking.customerId === id
          ? {
              ...booking,
              customerName: updated.name,
              customerEmail: updated.email,
              phone: updated.phone,
            }
          : booking
      )
    );

    return updated;
  };

  const deleteCustomerAccount = async (id) => {
    if (!adminToken) {
      throw new Error('Admin session required');
    }

    await apiRequest(`/customers/${id}`, {
      method: 'DELETE',
      token: adminToken,
    });

    setCustomerAccounts((prev) => prev.filter((customer) => customer.id !== id));
    setBookings((prev) => prev.filter((booking) => booking.customerId !== id));

    if (customerUser?.id === id) {
      logoutCustomer();
    }
  };

  const addBooking = async (bookingData) => {
    if (!customerToken) {
      throw new Error('Please login first to book an appointment');
    }

    const created = await apiRequest('/bookings', {
      method: 'POST',
      body: bookingData,
      token: customerToken,
    });

    setBookings((prev) => [created, ...prev]);
    return created;
  };

  const updateBookingStatus = async (id, status) => {
    if (!adminToken) {
      throw new Error('Admin session required');
    }

    const updated = await apiRequest(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status },
      token: adminToken,
    });

    setBookings((prev) => prev.map((booking) => (booking.id === id ? updated : booking)));
    return updated;
  };

  const updateBooking = async (id, updates) => {
    const token = adminToken || customerToken;
    if (!token) {
      throw new Error('Login required');
    }

    const updated = await apiRequest(`/bookings/${id}`, {
      method: 'PUT',
      body: updates,
      token,
    });

    setBookings((prev) => prev.map((booking) => (booking.id === id ? updated : booking)));
    return updated;
  };

  const cancelBooking = async (id) => {
    const token = adminToken || customerToken;
    if (!token) {
      throw new Error('Login required');
    }

    const updated = await apiRequest(`/bookings/${id}/cancel`, {
      method: 'PATCH',
      token,
    });

    setBookings((prev) => prev.map((booking) => (booking.id === id ? updated : booking)));
    return updated;
  };

  const deleteBooking = async (id) => {
    if (!adminToken) {
      throw new Error('Admin session required');
    }

    await apiRequest(`/bookings/${id}`, {
      method: 'DELETE',
      token: adminToken,
    });

    setBookings((prev) => prev.filter((booking) => booking.id !== id));
  };

  const addServiceCategory = async (categoryData) => {
    if (!adminToken) {
      throw new Error('Admin session required');
    }

    const created = await apiRequest('/services', {
      method: 'POST',
      body: categoryData,
      token: adminToken,
    });

    setServiceCategories((prev) => [...prev, created]);
    return created;
  };

  const updateServiceCategory = async (id, updates) => {
    if (!adminToken) {
      throw new Error('Admin session required');
    }

    const updated = await apiRequest(`/services/${id}`, {
      method: 'PUT',
      body: updates,
      token: adminToken,
    });

    setServiceCategories((prev) => prev.map((category) => (category.id === id ? updated : category)));
    return updated;
  };

  const deleteServiceCategory = async (id) => {
    if (!adminToken) {
      throw new Error('Admin session required');
    }

    await apiRequest(`/services/${id}`, {
      method: 'DELETE',
      token: adminToken,
    });

    setServiceCategories((prev) => prev.filter((category) => category.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        customerUser,
        registerCustomer,
        loginCustomer,
        logoutCustomer,
        customerAccounts,
        updateCustomerAccount,
        deleteCustomerAccount,
        bookings,
        addBooking,
        updateBookingStatus,
        updateBooking,
        cancelBooking,
        deleteBooking,
        serviceCategories,
        addServiceCategory,
        updateServiceCategory,
        deleteServiceCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
