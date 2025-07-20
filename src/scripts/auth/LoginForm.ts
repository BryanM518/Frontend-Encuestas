import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

// Definir la interfaz para el estado del componente
interface LoginFormState {
  email: string;
  password: string;
  errorMessage: string;
}

export default {
  name: 'LoginForm',
  data(): LoginFormState {
    return {
      email: '',
      password: '',
      errorMessage: ''
    };
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    return { router, authStore };
  },
  methods: {
    async handleLogin(this: LoginFormState & { router: ReturnType<typeof useRouter>, authStore: ReturnType<typeof useAuthStore> }) {
      try {
        const formData = new URLSearchParams();
        formData.append('username', this.email);
        formData.append('password', this.password);

        const response = await axios.post<{ access_token: string }>('http://localhost:8000/api/survey_api/auth/token', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        const token = response.data.access_token;
        this.authStore.login(token);
        this.errorMessage = '';
        this.router.push('/');
      } catch (error: any) {
        this.errorMessage = error.response?.data?.detail || 'Error al iniciar sesión';
      }
    }
  }
};