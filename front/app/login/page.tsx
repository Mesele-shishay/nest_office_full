'use client';

import { LoginHero } from '@/components/auth/login-hero';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  const handleLogin = async (email: string) => {
    // Handle login logic here
    console.log('Login attempt with:', email);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // You can add actual authentication logic here
    // For now, we'll just log the email
    console.log('Login successful for:', email);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        <LoginHero />
        <LoginForm onSubmit={handleLogin} />
      </div>
    </div>
  );
}
