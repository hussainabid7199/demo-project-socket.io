export default interface Response<T> {
  success: boolean;
  errors?: string[];
  message?: string;
  errorCode?: string;
  status?: number;
  data?: T;
}
