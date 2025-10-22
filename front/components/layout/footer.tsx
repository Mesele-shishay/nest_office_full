'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Phone, 
  Mail, 
  Building2 
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary-600 text-white py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-6 w-6" />
              <h3 className="font-bold text-lg">TUGZA Ed Innovation</h3>
            </div>
            <p className="text-primary-200 mb-4">
              Providing innovative educational solutions and services.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:text-primary-200 hover:bg-primary-700"
              >
                <Facebook className="h-6 w-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:text-primary-200 hover:bg-primary-700"
              >
                <Twitter className="h-6 w-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:text-primary-200 hover:bg-primary-700"
              >
                <Instagram className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">CONTACT</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span className="text-sm">0925439304</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span className="text-sm">0937072856</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span className="text-sm">0704046263</span>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <h3 className="font-bold text-lg mb-4">EMAIL</h3>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span className="text-sm">tugzaoffice@gmail.com</span>
            </div>
          </div>
        </div>

        <Separator className="bg-primary-500 mb-6" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-primary-200 text-sm">
            © 2025 TUGZA Ed Innovation. C 2025. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-primary-200 hover:text-white p-0 h-auto"
            >
              Privacy Policy
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-primary-200 hover:text-white p-0 h-auto"
            >
              Terms of Service
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
