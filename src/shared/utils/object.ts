type AnyObject = Record<any, any>;

export default class ObjectUtils {
    /**
     * Extracts specified properties from an object
     * @param originalObject The source object to extract properties from
     * @param propertiesToExtract Array of property keys to extract
     * @returns A new object containing only the extracted properties
     */
    public static extractProperties<T extends AnyObject>(originalObject: T, propertiesToExtract: (keyof T)[]): Pick<T, (keyof T)> {
        const extractedObject: Pick<T, keyof T> = {} as Pick<T, keyof T>;

        propertiesToExtract.forEach(property => {
            if (Object.prototype.hasOwnProperty.call(originalObject, property)) {
                extractedObject[property] = originalObject[property];
            }
        });

        return extractedObject;
    }

    /**
     * Removes all properties with undefined values from an object
     * @param object The object to clean
     * @returns A new object without undefined properties
     */
    public static removeUndefinedProperties<T extends AnyObject>(object: T): T {
        const cleanedObject: T = {} as T;

        Object.keys(object).forEach(key => {
            if (object[key] !== undefined) {
                // @ts-ignore
                cleanedObject[key] = object[key];
            }
        });

        return cleanedObject;
    }

    /**
     * Creates a new object excluding specified properties
     * @param object The source object
     * @param propertiesToOmit Array of property keys to omit
     * @returns A new object without the omitted properties
     */
    public static omitProperties<T extends Record<string, any>, K extends keyof T>(
        object: T,
        propertiesToOmit: K[]
    ): Omit<T, K> {
        const omittedObject: Record<string, any> = {};

        for (const key of Object.keys(object)) {
            if (
                Object.prototype.hasOwnProperty.call(object, key) &&
                !propertiesToOmit.includes(key as K)
            ) {
                omittedObject[key] = object[key];
            }
        }

        return omittedObject as Omit<T, K>;
    }
}