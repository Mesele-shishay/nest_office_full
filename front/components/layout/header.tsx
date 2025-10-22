'use client';

import { Button } from '@/components/ui/button'; 
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  UserPlus, 
  LogIn, 
  Menu,
  X,
  Phone,
  Mail
} from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
      {/* Top Bar */}
      <div className="bg-primary-800 py-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>0925439304</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>tugzaiit@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-primary-500" />

      {/* Main Header */}
      <div className="py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">All Place Online</h1>
              <p className="text-primary-200 text-sm">Your Digital Service Hub</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button 
              variant="ghost" 
              className="text-white hover:text-primary-200 hover:bg-white/10"
            >
              About Us
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-primary-700 hover:bg-primary-800 text-white border-0 shadow-md"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Register Office
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white text-primary-700 hover:bg-primary-50 border-0 shadow-md"
              asChild
            >
              <a href="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </a>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <Separator className="bg-primary-500 mb-4" />
            <nav className="flex flex-col gap-3">
              <Button 
                variant="ghost" 
                className="text-white hover:text-primary-200 hover:bg-white/10 justify-start"
              >
                About Us
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-primary-700 hover:bg-primary-800 text-white border-0 justify-start"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Register Office
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                className="bg-white text-primary-700 hover:bg-primary-50 border-0 justify-start"
                asChild
              >
                <a href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </a>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
