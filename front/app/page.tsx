'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { SearchSection } from '@/components/services/search-section';
import { ServicesGrid } from '@/components/services/services-grid';
import { PagePagination } from '@/components/common/pagination';
import { Footer } from '@/components/layout/footer';
import { mockServices, categories } from '@/lib/constants';
import { TabType } from '@/lib/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('offices');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Select Location');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const filteredServices = selectedCategory === 'all' 
    ? mockServices 
    : mockServices.filter(service => {
        const categoryName = categories.find(cat => cat.id === selectedCategory)?.name;
        return service.category === categoryName;
      });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8 pt-32">
        <SearchSection
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          selectedState={selectedState}
          onStateChange={setSelectedState}
          selectedCity={selectedCity}
          onCityChange={setSelectedCity}
        />

        <ServicesGrid
          services={filteredServices}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* <PagePagination
          currentPage={currentPage}
          totalPages={4}
          onPageChange={setCurrentPage}
        /> */}
      </main>

      <Footer />
    </div>
  );
}
