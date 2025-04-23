import ErrorLoggerModel from "../../database/models/ErrorLoggerModel";


interface ErrorLogInput {
    error: string;
    errorType: string;
    errorCode: string;
}

const logError = async ({ error, errorType, errorCode }: ErrorLogInput): Promise<void> => {
    try {
        await ErrorLoggerModel.create({
            error,
            errorType,
            errorCode,
        });
    } catch (loggingError) {
        // Optional: You can log this to console or a separate fallback
        console.error("Failed to log error:", loggingError);
    }
};

export const extractErrorMessage = (e: unknown): string => {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    if (typeof e === "object" && e !== null && "message" in e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (e as any).message;
    }
    return "Unknown error";
};

export default logError;