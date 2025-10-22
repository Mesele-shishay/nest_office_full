'use client';

import { SignupHero } from '@/components/auth/signup-hero';
import { SignupForm } from '@/components/auth/signup-form';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  nationalIdImage: File | null;
}

export default function SignupPage() {
  const handleSignup = async (formData: SignupFormData) => {
    // Handle signup logic here
    console.log('Signup attempt with:', formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // You can add actual authentication logic here
    // For now, we'll just log the form data
    console.log('Signup successful for:', formData.email);
  };

  return (
    <div className="min-h-screen bg-gray-50"> 
      <div className="flex flex-col lg:flex-row">
        <SignupHero />
        <SignupForm onSubmit={handleSignup} />
      </div>
    </div>
  );
}
