export interface ServiceCard {
  id: string;
  name: string;
  category: string;
  image: string;
  description?: string;
  distance: number; // Distance in kilometers
  officeType: string; // Type of office (e.g., "Hotels", "Banks", "Health Centers")
}

export interface Category {
  id: string;
  name: string;
}

export type TabType = 'offices' | 'items';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface SearchFilters {
  query: string;
  location: string;
  category: string;
  tab: TabType;
}
