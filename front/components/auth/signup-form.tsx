'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Upload, X, Eye, EyeOff, User, Mail, Lock, Phone, AlertCircle, CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  nationalIdImage: File | null;
}

interface SignupFormProps {
  onSubmit: (formData: SignupFormData) => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  nationalIdImage?: string;
  general?: string;
}

export function SignupForm({ onSubmit }: SignupFormProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    nationalIdImage: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateName = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Full name is required';
    }
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return undefined;
  };

  const validatePhoneNumber = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Phone number is required';
    }
    const phoneRegex = /^(\+251|0)?[0-9]{9}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid Ethiopian phone number';
    }
    return undefined;
  };

  const validateNationalId = (file: File | null): string | undefined => {
    if (!file) {
      return 'National ID image is required';
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return 'File size must be less than 5MB';
    }
    if (!file.type.startsWith('image/')) {
      return 'Please upload an image file';
    }
    return undefined;
  };

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, nationalIdImage: file }));
    // Clear error when user uploads a file
    if (errors.nationalIdImage) {
      setErrors(prev => ({ ...prev, nationalIdImage: undefined }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const error = validateNationalId(file);
      if (error) {
        setErrors(prev => ({ ...prev, nationalIdImage: error }));
      } else {
        handleFileChange(file);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateNationalId(file);
      if (error) {
        setErrors(prev => ({ ...prev, nationalIdImage: error }));
      } else {
        handleFileChange(file);
      }
    }
  };

  const removeFile = () => {
    handleFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const phoneError = validatePhoneNumber(formData.phoneNumber);
    const nationalIdError = validateNationalId(formData.nationalIdImage);

    if (nameError || emailError || passwordError || phoneError || nationalIdError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
        phoneNumber: phoneError,
        nationalIdImage: nationalIdError,
      });
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ 
        general: 'Signup failed. Please check your information and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-[60vh] lg:min-h-screen lg:items-start lg:pt-8 lg:pb-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
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
            Create your account
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Join thousands of professionals finding their perfect workspace
          </p>
        </div>

        {/* Signup Form Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Get Started
            </CardTitle>
            <CardDescription className="text-slate-600">
              Fill in your details to create your account
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="name" 
                  className="text-sm font-medium text-slate-700 flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`h-11 text-sm transition-colors ${
                    errors.name 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-300 focus:border-primary-500 focus:ring-primary-200'
                  }`}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  aria-invalid={errors.name ? 'true' : 'false'}
                  required
                />
                {errors.name && (
                  <p 
                    id="name-error" 
                    className="text-sm text-red-600 flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-medium text-slate-700 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
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

              {/* Password Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="password" 
                  className="text-sm font-medium text-slate-700 flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`h-11 text-sm pr-10 transition-colors ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-slate-300 focus:border-primary-500 focus:ring-primary-200'
                    }`}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p 
                    id="password-error" 
                    className="text-sm text-red-600 flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="phone" 
                  className="text-sm font-medium text-slate-700 flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0912345678 or +251912345678"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={`h-11 text-sm transition-colors ${
                    errors.phoneNumber 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-slate-300 focus:border-primary-500 focus:ring-primary-200'
                  }`}
                  aria-describedby={errors.phoneNumber ? 'phone-error' : undefined}
                  aria-invalid={errors.phoneNumber ? 'true' : 'false'}
                  required
                />
                {errors.phoneNumber && (
                  <p 
                    id="phone-error" 
                    className="text-sm text-red-600 flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* National ID Upload Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  National ID Image
                </Label>
                <p className="text-xs text-slate-500">
                  Upload a clear photo of your National ID. Details should match the information provided above.
                </p>
                
                {/* File Upload Area */}
                <div className="space-y-3">
                  {/* Drag and Drop Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                      dragActive 
                        ? 'border-primary-500 bg-primary-50 scale-[1.02]' 
                        : errors.nationalIdImage
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {formData.nationalIdImage ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary-600" />
                          <span className="text-sm font-medium text-slate-700">{formData.nationalIdImage.name}</span>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-xs text-primary-600 font-medium">File uploaded successfully</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="h-8 w-8 mx-auto text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-600 mb-1">
                            Drag and drop your National ID image here
                          </p>
                          <p className="text-xs text-slate-500">
                            or{' '}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
                            >
                              browse files
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-11 border-slate-300 hover:border-primary-500 hover:text-primary-600"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    aria-label="Upload National ID image"
                  />
                </div>
                
                {errors.nationalIdImage && (
                  <p 
                    className="text-sm text-red-600 flex items-center gap-1"
                    role="alert"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {errors.nationalIdImage}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                aria-describedby="submit-description"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              
              <p 
                id="submit-description" 
                className="text-xs text-slate-500 text-center"
              >
                By creating an account, you agree to our{' '}
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
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="text-primary-600 font-medium hover:text-primary-700 hover:underline inline-flex items-center gap-1 transition-colors"
                >
                  Sign in
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
