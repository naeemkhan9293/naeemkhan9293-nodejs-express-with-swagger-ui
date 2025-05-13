/**
 * Standardized API Response Class.
 * Provides a consistent structure for success and error responses,
 * including enhanced error details, metadata, and pagination support.
 */
class ApiResponse<T = any, M = any> {
  public success: boolean;
  public message: string;
  public data?: T;
  public statusCode: number;
  public timestamp: string; // Added timestamp
  public errorCode?: string; // Added optional error code for errors
  public errorDetails?: any; // Added optional error details for errors
  public meta?: M; // Added optional metadata for success (e.g., pagination)

  /**
   * Private constructor to ensure responses are created using static methods.
   * @param success - Indicates if the API call was successful.
   * @param message - A descriptive message about the response.
   * @param data - Optional data payload for successful responses.
   * @param statusCode - The HTTP status code for the response.
   * @param errorCode - Optional specific code for the error.
   * @param errorDetails - Optional detailed information about the error.
   * @param meta - Optional metadata (e.g., pagination info).
   */
  private constructor(
    success: boolean,
    message: string,
    data: T | undefined,
    statusCode: number,
    errorCode?: string,
    errorDetails?: any,
    meta?: M
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString(); // Set timestamp automatically
    this.errorCode = errorCode;
    this.errorDetails = errorDetails;
    this.meta = meta;
  }

  /**
   * Creates a success response.
   * @param message - A success message.
   * @param data - The data payload.
   * @param statusCode - The HTTP status code (defaults to 200).
   * @param meta - Optional metadata (e.g., pagination info).
   * @returns An ApiResponse instance for a success response.
   */
  public static success<T, M = any>(
    message: string,
    data?: T,
    statusCode: number = 200,
    meta?: M // Added optional meta parameter
  ): ApiResponse<T, M> {
    return new ApiResponse<T, M>(true, message, data, statusCode, undefined, undefined, meta);
  }

  /**
   * Creates an error response.
   * @param message - An error message.
   * @param statusCode - The HTTP status code (defaults to 500).
   * @param errorCode - Optional specific code for the error.
   * @param errorDetails - Optional detailed information about the error.
   * @returns An ApiResponse instance for an error response.
   */
  public static error(
    message: string,
    statusCode: number = 500,
    errorCode?: string, // Added optional errorCode parameter
    errorDetails?: any // Added optional errorDetails parameter
  ): ApiResponse<undefined, undefined> {
    return new ApiResponse<undefined, undefined>(
      false,
      message,
      undefined,
      statusCode,
      errorCode,
      errorDetails
    );
  }
}

export default ApiResponse;
