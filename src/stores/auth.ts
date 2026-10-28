import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth'

export interface User {
  id: number
  email: string
  name: string
  role: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('authToken'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    try {
      const response = await authService.login(credentials)
      const { access_token: authToken, user: userData } = response.data

      token.value = authToken
      user.value = userData

      localStorage.setItem('authToken', authToken)

      await checkAuth(); // Garante que o usuário seja atualizado com o novo token

      return { success: true }
    } catch (error: unknown) {
      console.error('Login error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login'
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    loading.value = true
    try {
      const response = await authService.register(credentials)
      const { token: authToken, user: userData } = response.data

      token.value = authToken
      user.value = userData

      localStorage.setItem('authToken', authToken)

      return { success: true }
    } catch (error: unknown) {
      console.error('Register error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar conta'
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('authToken')
  }

  const checkAuth = async () => {
    if (!token.value) return false

    try {
      const response = await authService.getUser()
      user.value = response.data.user
      return true
    } catch {
      logout()
      return false
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  }
})

