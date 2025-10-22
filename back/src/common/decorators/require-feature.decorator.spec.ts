import { Test, TestingModule } from '@nestjs/testing';
import { SetMetadata } from '@nestjs/common';
import {
  RequireFeature,
  REQUIRED_FEATURE_KEY,
} from './require-feature.decorator';

describe('RequireFeature Decorator', () => {
  it('should set metadata with correct key and value', () => {
    const featureName = 'Office Management';
    const decorator = RequireFeature(featureName);

    // Create a test class to apply the decorator
    class TestController {
      @RequireFeature(featureName)
      testMethod() {}
    }

    // Get metadata from the method
    const metadata = Reflect.getMetadata(
      REQUIRED_FEATURE_KEY,
      TestController.prototype.testMethod,
    );

    expect(metadata).toBe(featureName);
  });

  it('should work with different feature names', () => {
    const featureNames = [
      'Office Management',
      'Invoice Management',
      'Payment Processing',
      'Advanced Reporting',
      'Custom Branding',
    ];

    featureNames.forEach((featureName) => {
      class TestController {
        @RequireFeature(featureName)
        testMethod() {}
      }

      const metadata = Reflect.getMetadata(
        REQUIRED_FEATURE_KEY,
        TestController.prototype.testMethod,
      );
      expect(metadata).toBe(featureName);
    });
  });

  it('should work with class-level decorator', () => {
    const featureName = 'Office Management';

    @RequireFeature(featureName)
    class TestController {
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(REQUIRED_FEATURE_KEY, TestController);
    expect(metadata).toBe(featureName);
  });

  it('should work with multiple methods having different features', () => {
    class TestController {
      @RequireFeature('Office Management')
      createReceipt() {}

      @RequireFeature('Invoice Management')
      createInvoice() {}

      @RequireFeature('Payment Processing')
      processPayment() {}
    }

    const receiptMetadata = Reflect.getMetadata(
      REQUIRED_FEATURE_KEY,
      TestController.prototype.createReceipt,
    );
    const invoiceMetadata = Reflect.getMetadata(
      REQUIRED_FEATURE_KEY,
      TestController.prototype.createInvoice,
    );
    const paymentMetadata = Reflect.getMetadata(
      REQUIRED_FEATURE_KEY,
      TestController.prototype.processPayment,
    );

    expect(receiptMetadata).toBe('Office Management');
    expect(invoiceMetadata).toBe('Invoice Management');
    expect(paymentMetadata).toBe('Payment Processing');
  });

  it('should handle empty string feature name', () => {
    const featureName = '';

    class TestController {
      @RequireFeature(featureName)
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      REQUIRED_FEATURE_KEY,
      TestController.prototype.testMethod,
    );
    expect(metadata).toBe(featureName);
  });

  it('should handle special characters in feature name', () => {
    const featureName = 'Feature with Special Characters & Symbols!';

    class TestController {
      @RequireFeature(featureName)
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      REQUIRED_FEATURE_KEY,
      TestController.prototype.testMethod,
    );
    expect(metadata).toBe(featureName);
  });

  it('should export REQUIRED_FEATURE_KEY constant', () => {
    expect(REQUIRED_FEATURE_KEY).toBe('required-feature');
  });

  it('should be compatible with SetMetadata', () => {
    const featureName = 'Test Feature';
    const decorator = RequireFeature(featureName);

    // Verify that the decorator is a function
    expect(typeof decorator).toBe('function');

    // Verify that it can be applied to a method
    class TestController {
      @decorator
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      REQUIRED_FEATURE_KEY,
      TestController.prototype.testMethod,
    );
    expect(metadata).toBe(featureName);
  });
});
