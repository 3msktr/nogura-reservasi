
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { checkIfFirstUser } from '@/utils/adminUtils';
import { Separator } from '@/components/ui/separator';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user } = useAuth();

  useEffect(() => {
    // Redirect if user is already logged in
    if (user) {
      navigate('/');
    }
    
    // Check if this is the first user to sign up
    const checkFirstUser = async () => {
      const isFirst = await checkIfFirstUser();
      setIsFirstUser(isFirst);
    };
    
    checkFirstUser();
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Kata sandi tidak cocok');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, fullName);
      
      if (isFirstUser) {
        toast.success('Anda telah terdaftar sebagai pengguna admin pertama');
      } else {
        toast.success('Pendaftaran berhasil! Silakan periksa email Anda untuk mengonfirmasi akun Anda.');
      }
      
      // Navigation is handled in the signUp function
    } catch (error) {
      console.error('Error signing up:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // If this is the first user, they will be made admin automatically in the auth context
    } catch (error: any) {
      console.error('Google sign up error:', error);
      toast.error(error.message || 'Gagal mendaftar dengan Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-20 flex justify-center items-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-subtle border border-border p-8 animate-scale-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Buat Akun</h1>
              <p className="text-muted-foreground mt-2">Bergabunglah dengan Nogura untuk mulai memesan acara</p>
              {isFirstUser && (
                <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-md text-sm">
                  Anda akan terdaftar sebagai pengguna admin pertama
                </div>
              )}
            </div>

            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Nama Lengkap
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Alamat Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="anda@contoh.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Kata Sandi
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
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Membuat akun...' : 'Buat Akun'}
              </Button>

              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                  ATAU
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                Daftar dengan Google
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Sudah memiliki akun?</span>{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Masuk
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
