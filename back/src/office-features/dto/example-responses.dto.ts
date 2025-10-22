import { ApiProperty } from '@nestjs/swagger';

/**
 * Example API responses for Swagger documentation
 * These classes demonstrate realistic response structures
 */

export class ExampleFeatureGroupResponse {
  @ApiProperty({
    description: 'Example feature group response',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Premium Office Suite',
      appName: 'premium-office-suite',
      description:
        'Complete premium office management solution with advanced features',
      isPaid: true,
      features: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Advanced Analytics Dashboard',
          description:
            'Provides detailed analytics and reporting capabilities for office operations',
          isActive: true,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-20T14:45:00.000Z',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Custom Branding',
          description:
            'Allows customization of office interface with company branding',
          isActive: true,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-20T14:45:00.000Z',
        },
      ],
      tokens: [
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          tokenName: 'PREMIUM_OFFICE_SUITE_TOKEN',
          expiresInDays: 30,
          isActive: true,
          description: 'Monthly premium subscription token for office suite',
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-20T14:45:00.000Z',
        },
      ],
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-20T14:45:00.000Z',
    },
  })
  data: any;
}

export class ExampleOfficeActiveFeaturesResponse {
  @ApiProperty({
    description: 'Example office active features response',
    example: {
      officeId: '550e8400-e29b-41d4-a716-446655440004',
      features: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Advanced Analytics Dashboard',
          description:
            'Provides detailed analytics and reporting capabilities for office operations',
          isActive: true,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-20T14:45:00.000Z',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Custom Branding',
          description:
            'Allows customization of office interface with company branding',
          isActive: true,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-20T14:45:00.000Z',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440005',
          name: 'Advanced Reporting',
          description: 'Generate comprehensive reports with custom templates',
          isActive: true,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-20T14:45:00.000Z',
        },
      ],
      featureGroups: [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Premium Office Suite',
          appName: 'premium-office-suite',
          description:
            'Complete premium office management solution with advanced features',
          isPaid: true,
          isActive: true,
          expiresAt: '2024-02-15T10:30:00.000Z',
          activatedAt: '2024-01-15T10:30:00.000Z',
          featureCount: 3,
          features: [
            {
              id: '550e8400-e29b-41d4-a716-446655440000',
              name: 'Advanced Analytics Dashboard',
              description:
                'Provides detailed analytics and reporting capabilities for office operations',
              isActive: true,
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-20T14:45:00.000Z',
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              name: 'Custom Branding',
              description:
                'Allows customization of office interface with company branding',
              isActive: true,
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-20T14:45:00.000Z',
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440005',
              name: 'Advanced Reporting',
              description:
                'Generate comprehensive reports with custom templates',
              isActive: true,
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-20T14:45:00.000Z',
            },
          ],
        },
      ],
    },
  })
  data: any;
}

export class ExampleActivationResponse {
  @ApiProperty({
    description: 'Example feature group activation response',
    example: {
      message: 'Feature group activated successfully',
      data: {
        featureGroupId: '550e8400-e29b-41d4-a716-446655440002',
        isActive: true,
        expiresAt: '2024-02-15T10:30:00.000Z',
        activatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  data: any;
}

export class ExampleTokenResponse {
  @ApiProperty({
    description: 'Example token configuration response',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      tokenName: 'PREMIUM_OFFICE_SUITE_TOKEN',
      expiresInDays: 30,
      isActive: true,
      description: 'Monthly premium subscription token for office suite',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-20T14:45:00.000Z',
    },
  })
  data: any;
}
