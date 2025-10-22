'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Mail, Phone, AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';

interface LoginFormProps {
  onSubmit: (email: string) => void;
}

interface FormErrors {
  email?: string;
  general?: string;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Email or phone number is required';
    }
    
    // Check if it's an email or phone number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    
    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
      return 'Please enter a valid email address or phone number';
    }
    
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit(email);
    } catch (error) {
      setErrors({ 
        general: 'Login failed. Please check your credentials and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-[60vh] lg:min-h-screen">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors text-sm font-medium"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Welcome back
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Sign In
            </CardTitle>
            <CardDescription className="text-slate-600">
              Enter your email or phone number to access your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* General Error Alert */}
            {errors.general && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {errors.general}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-medium text-slate-700 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email or Phone Number
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="name@example.com or +251912345678"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  className={`h-11 text-sm transition-colors ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-300 focus:border-primary-500 focus:ring-primary-200'
                  }`}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  required
                />
                {errors.email && (
                  <p 
                    id="email-error" 
                    className="text-sm text-red-600 flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-describedby="submit-description"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <p 
                id="submit-description" 
                className="text-xs text-slate-500 text-center"
              >
                By continuing, you agree to our{' '}
                <Link 
                  href="/terms" 
                  className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link 
                  href="/privacy" 
                  className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
              </p>
            </form>

            <div className="relative">
              <Separator className="my-6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Or
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-primary-600 font-medium hover:text-primary-700 hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  Create account
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
