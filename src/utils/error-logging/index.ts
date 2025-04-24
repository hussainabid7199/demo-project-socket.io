/* eslint-disable @typescript-eslint/no-explicit-any */
import ErrorLoggerModel from "../../database/models/ErrorLoggerModel";
import { storageContext } from "../../context/async-storage-context";

interface LogErrorOptions {
  error: unknown;
  errorType: string;
}

export const errorMessage = (
  e: unknown
): {message: string; error: string; errorCode: string } => {
  if (typeof e === "string") {
    return { error: e, errorCode: "UNKNOWN", message: "Unknown message"};
  }

  if (e instanceof Error) {
    const anyErr = e as any;

    const message = e.message || "Unknown error";
    const code = anyErr?.original?.code || anyErr?.code || "UNKNOWN";
    const sql = anyErr?.sql || anyErr?.original?.sql;
    const parameters = anyErr?.parameters || anyErr?.original?.parameters;
    const stack = e.stack;

    const errorDetails = {
      message,
      code,
      sql,
      parameters,
      stack,
    };

    return {
      message: message,
      error: JSON.stringify(errorDetails, null, 2),
      errorCode: code,
    };
  }

  if (typeof e === "object" && e !== null && "message" in e) {
    const msg = (e as any).message || "Unknown object error";
    const code = (e as any).code || "UNKNOWN";
    return {
      message: msg,
      error: msg,
      errorCode: code,
    };
  }

  return {
    message: "Unknown message",
    error: "Unknown error",
    errorCode: "UNKNOWN",
  };
};

const logError = ({ error, errorType }: LogErrorOptions): void => {
  const { error: extractedError, errorCode } = errorMessage(error);
  (async () => {
    try {
      const client_ip = storageContext.get('clientIp');
      const requestType = storageContext.get('requestType');
      await ErrorLoggerModel.create({
        error: extractedError,
        errorType,
        errorCode,
        ipAddress: client_ip,
        requestType: requestType
      });
    } catch (loggingError) {
      console.error("Failed to log error:", loggingError);
    }
  })();
};

export default logError;
