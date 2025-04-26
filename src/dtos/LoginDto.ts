interface LoginBasicDto {
  id: number;
  email: string;
  password: string;
  isActive: boolean;
  isDeleted?: boolean;
}

interface LoginDto {
  token?: string;
  isLogin: boolean;
}

export default LoginBasicDto;
export { LoginDto };
