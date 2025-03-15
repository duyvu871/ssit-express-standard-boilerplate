/**
 * Utility class for handling plan-related date calculations
 */
export class PlanUtils {
    /**
     * Calculates the end date based on a start date and duration in milliseconds
     * @param startDate The starting date
     * @param duration The duration in milliseconds
     * @returns The calculated end date
     */
    public static calculateEndDate(startDate: Date, duration: number): Date {
        return new Date(startDate.getTime() + duration);
    }

    /**
     * Calculates the end date based on a start date and duration in days
     * @param startDate The starting date
     * @param duration The duration in days
     * @returns The calculated end date
     */
    public static calculateEndDateByDay(startDate: Date, duration: number): Date {
        return new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
    }
}