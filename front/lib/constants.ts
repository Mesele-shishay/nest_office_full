import { ServiceCard, Category } from './types';

// Color Configuration
export const COLORS = {
  primary: {
    50: '#f0fdfa',   // teal-50
    100: '#ccfbf1',  // teal-100
    200: '#99f6e4',  // teal-200
    500: '#14b8a6',  // teal-500
    600: '#00BCC8',  // custom teal
    700: '#0f766e',  // teal-700
    800: '#115e59',  // teal-800
  },
  // You can easily change the primary color by updating these values
  // For example, to change to blue:
  // primary: {
  //   50: '#eff6ff',   // blue-50
  //   100: '#dbeafe',  // blue-100
  //   200: '#bfdbfe',  // blue-200
  //   500: '#3b82f6',  // blue-500
  //   600: '#2563eb',  // blue-600
  //   700: '#1d4ed8',  // blue-700
  //   800: '#1e40af',  // blue-800
  // },
} as const;

export const mockServices: ServiceCard[] = [
  {
    id: "70 • 38676",
    name: "Fodiaz",
    category: "non gov",
    image: "fodiaz",
    description: "በወረፋ ላይ ያሉ ሰዎች",
    distance: 2.3,
    officeType: "Non-Government"
  },
  {
    id: "38587",
    name: "Hotbricks",
    category: "Hotels",
    image: "hotel",
    distance: 6.7,
    officeType: "Hotels"
  },
  {
    id: "38669",
    name: "Sigourney Willis",
    category: "Banks",
    image: "bank",
    distance: 1.2,
    officeType: "Banks"
  },
  {
    id: "144",
    name: "H2",
    category: "Hotels",
    image: "hotel",
    distance: 4.5,
    officeType: "Hotels"
  },
  {
    id: "38628",
    name: "tet",
    category: "Banks",
    image: "bank",
    distance: 3.1,
    officeType: "Banks"
  },
  {
    id: "144",
    name: "H1",
    category: "Hotels",
    image: "hotel",
    distance: 2.8,
    officeType: "Hotels"
  },
  {
    id: "144",
    name: "Libanos International Hotel",
    category: "Hotels",
    image: "hotel",
    distance: 5.2,
    officeType: "Hotels"
  },
  {
    id: "144",
    name: "H4",
    category: "Hotels",
    image: "hotel",
    distance: 3.9,
    officeType: "Hotels"
  },
  {
    id: "70",
    name: "Tem",
    category: "non gov",
    image: "map",
    distance: 1.8,
    officeType: "Health Centers"
  }
];

export const categories: Category[] = [
  { id: "all", name: "All" },
  { id: "boutique", name: "Boutique" },
  { id: "malls", name: "Malls" },
  { id: "banks", name: "Banks" },
  { id: "schools", name: "Schools" },
  { id: "hotels", name: "Hotels" },
  { id: "non-gov", name: "non gov" }
];

export const locations = [
  "Select Location",
  "Addis Ababa",
  "Dire Dawa",
  "Bahir Dar"
];
