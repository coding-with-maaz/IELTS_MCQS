import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useLoginMutation, useGetCurrentUserQuery } from '@/store/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [login, { isLoading }] = useLoginMutation();
  const { data: userData } = useGetCurrentUserQuery();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && userData?.success && userData.data?.user) {
      const { role, profile } = userData.data.user;
      navigate(role === 'admin' ? '/dashboard' : '/', { replace: true });
    }
  }, [userData, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await login(formData).unwrap();
      
      if (!result.success) {
        toast({
          title: 'Error',
          description: result.message || 'Login failed',
          variant: 'destructive',
        });
        return;
      }

      // Store user data and token in both localStorage and Redux store
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      localStorage.setItem('user_role', result.data.user.role);
      if (result.data.user.profile.testType) {
        localStorage.setItem('test_type', result.data.user.profile.testType);
      }

      // Update Redux store
      dispatch(setCredentials({
        user: result.data.user,
        token: result.data.token
      }));

      toast({
        title: 'Welcome back!',
        description: `Successfully logged in as ${result.data.user.name} (${result.data.user.profile.testType})`,
      });

      // Navigate based on user role
      if (result.data.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: error.data?.message || error.message || 'Failed to login. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up any subscriptions or pending requests
    };
  }, []);

  // Add function to check if user is already logged in
  const checkAuthStatus = () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          // Update Redux store with stored credentials
          dispatch(setCredentials({
            user: userData,
            token: token
          }));
          navigate(userData.role === 'admin' ? '/dashboard' : '/', { replace: true });
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('user_role');
          localStorage.removeItem('test_type');
        }
      }
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="Enter your email"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={() => navigate('/register')}
          >
            Create an account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 