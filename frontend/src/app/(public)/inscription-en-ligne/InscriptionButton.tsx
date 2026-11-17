'use client';

import { useState } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { PublicInscriptionModal } from './components/PublicInscriptionModal';

interface Props extends Omit<ButtonProps, 'onClick'> {
  defaultSessionId?: string;
  label?: string;
}

export function InscriptionButton({
  defaultSessionId, label = "S'inscrire", ...rest
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="odc" onClick={() => setOpen(true)} {...rest}>
        {label}
      </Button>
      <PublicInscriptionModal
        open={open}
        onOpenChange={setOpen}
        defaultSessionId={defaultSessionId}
      />
    </>
  );
}