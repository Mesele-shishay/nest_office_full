'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ServiceCard } from './service-card';
import { ServiceCard as ServiceCardType, Category } from '@/lib/types';
import { Building2, Filter, Grid, List, MapPin } from 'lucide-react';

interface ServicesGridProps {
  services: ServiceCardType[];
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function ServicesGrid({ 
  services, 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: ServicesGridProps) {
  const totalServices = services.length;
  const selectedCategoryName = categories.find(cat => cat.id === selectedCategory)?.name || 'All';

  return (
    <div className="mb-8">
      {/* Header Section */}
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <Building2 className="h-8 w-8 text-primary-600" />
            Nearby markets/services Office
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Discover and connect with local markets/service providers in your area
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm font-medium text-gray-700">
              {totalServices} Services Found
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Category: {selectedCategoryName}</span>
              <Button variant="ghost" size="sm" className="p-1">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-1">
              <Button variant="default" size="sm" className="bg-primary-600 hover:bg-primary-700 text-white">
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Separator className="mb-6" />
          
          {/* Category Filters */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Category
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedCategory === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange('all')}
                className={`rounded-full ${
                  selectedCategory === 'all'
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                All Services
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(category.id)}
                  className={`rounded-full ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {services.map((service, index) => (
            <ServiceCard key={`${service.id}-${index}`} service={service} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Services Found</h3>
            <p className="text-gray-500 mb-4">
              No services available for the selected category. Try selecting a different category.
            </p>
            <Button 
              variant="outline" 
              onClick={() => onCategoryChange('all')}
              className="mt-2"
            >
              View All Services
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
