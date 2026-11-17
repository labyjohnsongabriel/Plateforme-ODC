'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/routes';
import { registerSchema } from '../types/auth.types';
import type { RegisterFormData } from '../types/auth.types';

export function useRegister() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      roleNom: 'PARTICIPANT',
      motDePasse: '',
      confirmMotDePasse: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const user = await registerUser({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        motDePasse: data.motDePasse,
        roleNom: data.roleNom,
      });
      router.push(getDashboardRoute(user.role.nom));
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
