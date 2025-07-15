// src/composables/useUserProfile.ts
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Define an interface for the user object for type safety
interface User {
  username: string;
  email: string;
  id: string;
  created_at: string;
}

export function useUserProfile() {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const token = localStorage.getItem('token');
  const endpoint = 'http://localhost:8000/api/survey_api/auth/me';

  const fetchUserProfile = async () => {
    if (!token) {
      error.value = 'No has iniciado sesión.';
      loading.value = false;
      return;
    }

    try {
      const response = await axios.get<User>(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      user.value = response.data;
    } catch (err: any) {
      console.error('Error al obtener perfil:', err);
      error.value = err.response?.data?.detail || 'Error al obtener los datos del usuario.';
    } finally {
      loading.value = false;
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Automatically fetch user profile when the composable is mounted
  onMounted(() => {
    fetchUserProfile();
  });

  return {
    user,
    loading,
    error,
    formatDate,
    fetchUserProfile, // You might expose this if you need to manually refresh the profile
  };
}