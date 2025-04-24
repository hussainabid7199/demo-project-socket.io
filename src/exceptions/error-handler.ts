import logError, { errorMessage } from "../utils/error-logging";
import Response from "../dtos/Response";

export default class Error {
  static Handler<T>(
    error: unknown,
    errorType: string = "UNKNOWN_ERROR",
    statusCode?: number,
    customMessage?: string
  ): Response<T> {
    logError({ error, errorType });

    const { message, errorCode } = errorMessage(error);

    return {
      success: false,
      errorCode: errorCode,
      status: statusCode,
      message: message || customMessage,
    };
  }
}
