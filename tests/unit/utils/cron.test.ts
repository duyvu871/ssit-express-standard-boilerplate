import { CronStringConverter, TimeInterval } from '../../../src/shared/utils/cron';

describe('CronStringConverter', () => {
    describe('convert', () => {
        it('should convert seconds interval correctly', () => {
            expect(CronStringConverter.convert('1s')).toBe('*/1 * * * * *');
            expect(CronStringConverter.convert('30s')).toBe('*/30 * * * * *');
        });

        it('should convert minutes interval correctly', () => {
            expect(CronStringConverter.convert('1m')).toBe('0 */1 * * * *');
            expect(CronStringConverter.convert('15m')).toBe('0 */15 * * * *');
            expect(CronStringConverter.convert('30m')).toBe('0 */30 * * * *');
        });

        it('should convert hours interval correctly', () => {
            expect(CronStringConverter.convert('1h')).toBe('0 0 */1 * * *');
            expect(CronStringConverter.convert('6h')).toBe('0 0 */6 * * *');
            expect(CronStringConverter.convert('12h')).toBe('0 0 */12 * * *');
        });

        it('should convert days interval correctly', () => {
            expect(CronStringConverter.convert('1d')).toBe('0 0 */1 * *');
            expect(CronStringConverter.convert('3d')).toBe('0 0 */3 * *');
        });

        it('should convert weeks interval correctly', () => {
            expect(CronStringConverter.convert('1w')).toBe('0 0 * * 1 *');
        });

        it('should convert months interval correctly', () => {
            expect(CronStringConverter.convert('1M')).toBe('0 0 1 */1 * *');
        });

        it('should throw an error for invalid interval format', () => {
            expect(() => CronStringConverter.convert('invalid')).toThrow('Invalid interval: invalid');
        });
    });
});