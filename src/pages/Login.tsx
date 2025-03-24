
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock login - normally would check credentials with backend
    setTimeout(() => {
      // For demo, we'll just make admin@nogura.com an admin account
      if (email === 'admin@nogura.com' && password === 'password') {
        toast.success('Logged in as admin');
        navigate('/admin');
      } else if (email && password) {
        toast.success('Logged in successfully');
        navigate('/');
      } else {
        toast.error('Invalid credentials');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Layout>
      <div className="container py-20 flex justify-center items-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-subtle border border-border p-8 animate-scale-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Sign In</h1>
              <p className="text-muted-foreground mt-2">Welcome back to Nogura</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <a href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account?</span>{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="text-center text-xs text-muted-foreground">
                <p>For demo, use:</p>
                <p className="mt-1">Email: admin@nogura.com</p>
                <p>Password: password</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
