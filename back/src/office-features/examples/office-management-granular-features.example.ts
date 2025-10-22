/**
 * OFFICE MANAGEMENT GRANULAR FEATURE SYSTEM
 *
 * This system allows admins to create feature groups with individual office management features
 * instead of treating the entire Office Management service as one monolithic feature.
 *
 * GRANULAR FEATURES AVAILABLE:
 * 1. Create Office - Create new office locations and configurations
 * 2. Update Office - Update office information, settings, and configurations
 * 3. Delete Office - Remove office locations and configurations
 * 4. View Office Details - View detailed office information and settings
 * 5. Office Statistics - View office management analytics and statistics
 * 6. Generate Office QR Code - Generate QR codes for office identification
 * 7. Office Name Management - Change and manage office names
 * 8. Office Location Management - Update office locations and coordinates
 *
 * EXAMPLE FEATURE GROUPS AN ADMIN CAN CREATE:
 *
 * 1. BASIC OFFICE MANAGEMENT (Free)
 *    - Create Office
 *    - View Office Details
 *    - Office Name Management
 *
 * 2. STANDARD OFFICE MANAGEMENT (Paid)
 *    - Create Office
 *    - Update Office
 *    - View Office Details
 *    - Office Name Management
 *    - Office Location Management
 *    - Generate Office QR Code
 *
 * 3. PREMIUM OFFICE MANAGEMENT (Paid)
 *    - All features included
 *
 * 4. OFFICE ANALYTICS ONLY (Paid)
 *    - Office Statistics
 *    - View Office Details
 *
 * 5. OFFICE QR MANAGEMENT (Free)
 *    - Generate Office QR Code
 *    - View Office Details
 *
 * HOW IT WORKS:
 *
 * 1. GRANULAR FEATURE REGISTRATION:
 *    Each method in OfficeManagementService is registered as an individual feature:
 *
 *    ```typescript
 *    const officeFeatureMappings = {
 *      'Create Office': 'createOffice',
 *      'Update Office': 'updateOffice',
 *      'Delete Office': 'deleteOffice',
 *      'View Office Details': 'getOfficeById',
 *      'Office Statistics': 'getOfficeManagementStatistics',
 *      'Generate Office QR Code': 'generateOfficeQRCode',
 *      'Office Name Management': 'updateOffice',
 *      'Office Location Management': 'updateOffice',
 *    };
 *    ```
 *
 * 2. CONTROLLER PROTECTION:
 *    Each endpoint is protected by individual granular features:
 *
 *    ```typescript
 *    @Post()
 *    @RequireGranularFeature('Create Office')
 *    async createOffice() { ... }
 *
 *    @Put(':targetOfficeId')
 *    @RequireGranularFeature('Update Office')
 *    async updateOffice() { ... }
 *
 *    @Get('statistics')
 *    @RequireGranularFeature('Office Statistics')
 *    async getOfficeManagementStatistics() { ... }
 *    ```
 *
 * 3. FEATURE GROUP CREATION:
 *    Admins can create custom feature groups by selecting specific features:
 *
 *    ```typescript
 *    const customGroup = {
 *      name: 'Custom Office Suite',
 *      appName: 'custom-office-suite',
 *      description: 'Custom office management features',
 *      isPaid: true,
 *      features: [
 *        'Create Office',
 *        'Office Statistics',
 *        'Generate Office QR Code'
 *      ]
 *    };
 *    ```
 *
 * 4. OFFICE ASSIGNMENT:
 *    Offices can be assigned different feature groups, giving them access to different
 *    combinations of office management features.
 *
 * BENEFITS:
 *
 * 1. GRANULAR CONTROL: Admins can create feature groups with specific combinations
 * 2. FLEXIBLE PRICING: Different tiers can have different feature combinations
 * 3. MODULAR DESIGN: Features can be mixed and matched as needed
 * 4. SCALABLE: Easy to add new office management features
 * 5. USER-FRIENDLY: Clear feature names make it easy to understand what's included
 *
 * USAGE EXAMPLES:
 *
 * 1. Small Office (Free Tier):
 *    - Can create offices and view details
 *    - Cannot update or delete offices
 *    - Cannot generate QR codes
 *
 * 2. Medium Office (Standard Tier):
 *    - Can create, update, and view offices
 *    - Can manage office names and locations
 *    - Can generate QR codes
 *    - Cannot delete offices or view statistics
 *
 * 3. Large Office (Premium Tier):
 *    - Full access to all office management features
 *    - Can delete offices
 *    - Can view detailed statistics
 *
 * 4. Analytics-Only Office:
 *    - Can only view office statistics
 *    - Cannot modify offices
 *
 * This system provides maximum flexibility for admins to create feature groups that
 * match their business needs and pricing strategies.
 */

export const OFFICE_MANAGEMENT_GRANULAR_FEATURES = {
  CREATE_OFFICE: 'Create Office',
  UPDATE_OFFICE: 'Update Office',
  DELETE_OFFICE: 'Delete Office',
  VIEW_OFFICE_DETAILS: 'View Office Details',
  OFFICE_STATISTICS: 'Office Statistics',
  GENERATE_QR_CODE: 'Generate Office QR Code',
  OFFICE_NAME_MANAGEMENT: 'Office Name Management',
  OFFICE_LOCATION_MANAGEMENT: 'Office Location Management',
} as const;

export const EXAMPLE_FEATURE_GROUPS = {
  BASIC: {
    name: 'Basic Office Management',
    features: [
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.CREATE_OFFICE,
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.VIEW_OFFICE_DETAILS,
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.OFFICE_NAME_MANAGEMENT,
    ],
    isPaid: false,
  },
  STANDARD: {
    name: 'Standard Office Management',
    features: [
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.CREATE_OFFICE,
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.UPDATE_OFFICE,
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.VIEW_OFFICE_DETAILS,
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.OFFICE_NAME_MANAGEMENT,
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.OFFICE_LOCATION_MANAGEMENT,
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.GENERATE_QR_CODE,
    ],
    isPaid: true,
  },
  PREMIUM: {
    name: 'Premium Office Management',
    features: Object.values(OFFICE_MANAGEMENT_GRANULAR_FEATURES),
    isPaid: true,
  },
  ANALYTICS_ONLY: {
    name: 'Office Analytics Only',
    features: [
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.OFFICE_STATISTICS,
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.VIEW_OFFICE_DETAILS,
    ],
    isPaid: true,
  },
  QR_MANAGEMENT: {
    name: 'Office QR Management',
    features: [
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.GENERATE_QR_CODE,
      OFFICE_MANAGEMENT_GRANULAR_FEATURES.VIEW_OFFICE_DETAILS,
    ],
    isPaid: false,
  },
} as const;
