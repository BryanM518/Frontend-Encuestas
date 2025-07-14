// src/composables/useMainHeader.ts
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth'; // Adjust the path as needed

export function useMainHeader() {
  const router = useRouter();
  const authStore = useAuthStore();
  const showMenu = ref(false);
  const mobileMenuOpen = ref(false);

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const hasAlerts = computed(() => true); // You can connect real alerts here

  const toggleMenu = () => {
    showMenu.value = !showMenu.value;
  };

  const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
    showMenu.value = false; // Close the dropdown if the mobile menu is opened
  };

  const handleLogout = async () => {
    authStore.logout();
    await router.push('/login');
  };

  return {
    isAuthenticated,
    hasAlerts,
    handleLogout,
    showMenu,
    toggleMenu,
    mobileMenuOpen,
    toggleMobileMenu,
  };
}