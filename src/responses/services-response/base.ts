export interface ServiceResponse {
    success: boolean;
    data?: any;
    error?: any;
}

export default class BaseServiceResponse {
    public success: boolean;
    public data: any;
    public error: any;

    constructor(success: boolean, data: any, error: any) {
        this.success = success;
        this.data = data;
        this.error = error;
    }

    get toJSON(): any {
        return {
            success: this.success,
            data: this.data,
            error: this.error
        };
    }   
}