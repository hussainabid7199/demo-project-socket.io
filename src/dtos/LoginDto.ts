interface LoginBasicDto {
  id: number;
  guid: string;
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
