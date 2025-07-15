import axios from 'axios';

// Definir la interfaz para el estado del componente
interface RegisterFormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  errorMessage: string;
  successMessage: string;
}

export default {
  name: 'RegisterForm',
  data(): RegisterFormState {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
    async handleRegister(this: RegisterFormState) {
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden';
        return;
      }

      try {
        await axios.post('http://localhost:8000/api/survey_api/auth/register', {
          username: this.username,
          email: this.email,
          password: this.password
        });

        this.successMessage = 'Registro exitoso. Ahora puedes iniciar sesión.';
        this.errorMessage = '';
        this.username = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
      } catch (error: any) {
        this.errorMessage = error.response?.data?.detail || 'Error al registrar usuario';
        this.successMessage = '';
      }
    }
  }
};