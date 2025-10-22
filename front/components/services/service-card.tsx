'use client';

import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  Eye, 
  MapPin, 
  Building2,
  Plane
} from 'lucide-react';
import { ServiceCard as ServiceCardType } from '@/lib/types';

interface ServiceCardProps {
  service: ServiceCardType;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const getOfficeIcon = () => {
    switch (service.officeType.toLowerCase()) {
      case 'hotels':
        return <Building2 className="w-8 h-8 text-yellow-600" />;
      case 'banks':
        return <Building2 className="w-8 h-8 text-blue-600" />;
      case 'health centers':
        return <Building2 className="w-8 h-8 text-red-600" />;
      default:
        return <Building2 className="w-8 h-8 text-gray-600" />;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-center h-24 bg-gray-50 rounded-lg">
          {getOfficeIcon()}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="space-y-2">
          {/* Office Name and Distance */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-800">
              {service.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Plane className="w-4 h-4" />
              <span>{service.distance} km</span>
            </div>
          </div>
          
          {/* Office Type */}
          <div className="text-sm text-gray-500">
            {service.officeType}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2">
        <div className="w-full space-y-2">
          {/* Two buttons side by side */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm"
              size="sm"
            >
              <Send className="h-4 w-4 mr-1" />
              Send Request
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 hover:bg-gray-50 text-sm"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Order
            </Button>
          </div>
          
          {/* Full width button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full hover:bg-gray-50 text-sm"
          >
            <MapPin className="h-4 w-4 mr-1" />
            View Map
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
