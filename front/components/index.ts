/**
 * Components Main Barrel Export
 * 
 * This is the main entry point for all components in the application.
 * It provides organized access to components by category.
 * 
 * Directory Structure:
 * - ui/: Reusable UI primitives (buttons, inputs, cards, etc.)
 * - layout/: Layout components (header, footer)
 * - auth/: Authentication components (login, signup forms)
 * - services/: Service-related components (service cards, grids, search)
 * - common/: Shared components used across the app (pagination, etc.)
 * 
 * Usage Examples:
 * - import { Button, Card } from '@/components/ui'
 * - import { Header, Footer } from '@/components/layout'
 * - import { LoginForm, SignupForm } from '@/components/auth'
 * - import { ServiceCard, ServicesGrid } from '@/components/services'
 * - import { Pagination } from '@/components/common'
 * 
 * For convenience, you can also import directly from specific directories:
 * - import { Button } from '@/components/ui/button'
 * - import { Header } from '@/components/layout/header'
 */

// Re-export all component categories for easy access
export * from './ui'
export * from './layout'
export * from './auth'
export * from './services'
export * from './common'
