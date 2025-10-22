'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Building, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export function SignupHero() {
  return (
    <div className="flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex flex-col justify-between p-4 sm:p-6 md:p-8 lg:p-8 xl:p-10 min-h-[30vh] sm:min-h-[35vh] lg:min-h-screen lg:justify-start lg:gap-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-16 left-12 w-40 h-40 bg-white rounded-full"></div>
        <div className="absolute top-40 right-16 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-24 left-16 w-48 h-48 bg-white rounded-full"></div>
        <div className="absolute bottom-40 right-12 w-36 h-36 bg-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full"></div>
      </div>

      {/* Logo Section */}
      <div className="relative z-10">
        <Link href="/" className="inline-block">
          <div className="flex items-center gap-3 mb-8 hover:opacity-90 transition-opacity cursor-pointer">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-600 font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl sm:text-2xl">All Place Online</h1>
              <p className="text-primary-100 text-sm">Your workspace marketplace</p>
            </div>
          </div>
        </Link>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            <Users className="h-3 w-3 mr-1" />
            10K+ Users
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            <Building className="h-3 w-3 mr-1" />
            500+ Spaces
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            <MapPin className="h-3 w-3 mr-1" />
            50+ Cities
          </Badge>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-md space-y-6">
        {/* Main Testimonial */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl hidden lg:block">
          <CardContent className="p-6">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-white text-base sm:text-lg leading-relaxed mb-4">
              &ldquo;All Place Online has revolutionized how we find and connect with workspaces across Ethiopia. The platform is intuitive and the community is amazing.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">SM</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Sarah Mekonnen</p>
                <p className="text-primary-100 text-xs">Freelance Designer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </div>
  );
}
