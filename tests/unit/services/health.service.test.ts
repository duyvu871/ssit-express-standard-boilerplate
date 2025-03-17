import HealthService from '../../../src/api/services/health.service';

describe('HealthService', () => {
    describe('getHealth', () => {
        it('should return "OK"', () => {
            // Act
            const result = HealthService.getHealth();

            // Assert
            expect(result).toBe('OK');
        });
    });
});