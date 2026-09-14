import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { useAuth } from '@/context/AuthContext';
import { AuthService } from '../services/auth.service';

import { loginSchema } from '../types/auth.types';
import type { LoginFormData } from '../types/auth.types';

export function useLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const rememberedEmail = AuthService.getRememberedEmail();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: rememberedEmail || '',
      motDePasse: '',
      remember: !!rememberedEmail,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.email, data.motDePasse);
      toast.success('Connexion réussie ! Bienvenue 👋');
      navigate('/dashboard');
    } catch {
      // Géré par l'intercepteur
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    onSubmit: form.handleSubmit(onSubmit),
  };
}