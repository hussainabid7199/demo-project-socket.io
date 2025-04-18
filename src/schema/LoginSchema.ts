import * as Yup from 'yup';
import LoginDataModel from '../models/LoginDataModel';

const LoginSchema: Yup.ObjectSchema<LoginDataModel> = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
  rememberMe: Yup.boolean(),
});

export default LoginSchema;
