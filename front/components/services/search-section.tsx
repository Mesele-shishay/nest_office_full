'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Building2, 
  Package, 
  ChevronDown
} from 'lucide-react';
import { TabType } from '@/lib/types';
import { locations } from '@/lib/constants';

interface SearchSectionProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedCity: string;
  onCityChange: (city: string) => void;
}

export function SearchSection({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedLocation,
  onLocationChange,
  selectedCountry,
  onCountryChange,
  selectedState,
  onStateChange,
  selectedCity,
  onCityChange
}: SearchSectionProps) {
  return (
    <div className="bg-primary-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <Card className="max-w-4xl mx-auto shadow-lg border-0 rounded-2xl sm:rounded-3xl">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          {/* Tabs Section */}
          <div className="mb-4 sm:mb-6">
            <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabType)}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg sm:rounded-xl p-1">
                <TabsTrigger 
                  value="offices" 
                  className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-md sm:rounded-lg text-sm sm:text-base py-2"
                >
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Offices</span>
                  <span className="xs:hidden">Offices</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="items"
                  className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-md sm:rounded-lg text-sm sm:text-base py-2"
                >
                  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Items</span>
                  <span className="xs:hidden">Items</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for offices..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base bg-gray-100 border-0 rounded-lg sm:rounded-xl"
              />
            </div>
          </div>

          {/* Filter Section */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-white text-xs sm:text-sm">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              Select Location
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-white text-xs sm:text-sm">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 fill-black" />
              Newest First
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
            </Badge>
          </div>

          {/* Location Selection */}
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Choose Location</h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Select value={selectedCountry} onValueChange={onCountryChange}>
                <SelectTrigger className="w-full sm:w-48 h-10 sm:h-12 bg-gray-100 border-0 rounded-lg sm:rounded-xl text-sm sm:text-base">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethiopia">Ethiopia</SelectItem>
                  <SelectItem value="kenya">Kenya</SelectItem>
                  <SelectItem value="uganda">Uganda</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedState} onValueChange={onStateChange}>
                <SelectTrigger className="w-full sm:w-48 h-10 sm:h-12 bg-gray-100 border-0 rounded-lg sm:rounded-xl text-sm sm:text-base">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="addis-ababa">Addis Ababa</SelectItem>
                  <SelectItem value="oromia">Oromia</SelectItem>
                  <SelectItem value="amhara">Amhara</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCity} onValueChange={onCityChange}>
                <SelectTrigger className="w-full sm:w-48 h-10 sm:h-12 bg-gray-100 border-0 rounded-lg sm:rounded-xl text-sm sm:text-base">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="addis-ababa">Addis Ababa</SelectItem>
                  <SelectItem value="bahir-dar">Bahir Dar</SelectItem>
                  <SelectItem value="dire-dawa">Dire Dawa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
