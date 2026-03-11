import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Lock, Mail } from 'lucide-react';

export default function CustomerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginCustomer } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = location.state?.redirectTo || '/website';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await loginCustomer(email, password);

    if (result.success) {
      toast.success(result.message);
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block reveal-up">
          <img
            src="https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80"
            alt="Customer vehicle service"
            className="w-full h-[560px] object-cover rounded-3xl shadow-2xl hover-lift"
          />
        </div>

        <div className="w-full max-w-md mx-auto reveal-up" style={{ animationDelay: '120ms' }}>
        <Button variant="ghost" onClick={() => navigate('/website')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Website
        </Button>

        <Card className="shadow-xl hover-lift glass-panel">
          <CardHeader>
            <CardTitle className="text-2xl">Customer Login</CardTitle>
            <CardDescription>Log in to your account before booking an appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <p className="text-sm text-gray-600 mt-6 text-center">
              Do not have an account?{' '}
              <Link to="/website/register" className="text-blue-600 hover:underline font-medium">
                Register here
              </Link>
            </p>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
