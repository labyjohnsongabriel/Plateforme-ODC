'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/routes';
import { loginSchema } from '../types/auth.types';
import type { LoginFormData } from '../types/auth.types';

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', motDePasse: '', remember: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const user = await login({
        email: data.email,
        motDePasse: data.motDePasse,
      });
      const returnTo = searchParams.get('next');
      router.push(returnTo ?? getDashboardRoute(user.role.nom));
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
