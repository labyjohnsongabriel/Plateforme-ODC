import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/utils/cn';

export interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  disabled,
  error,
  autoFocus,
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(value.split('').slice(0, length));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const newValue = otp.join('');
    onChange?.(newValue);

    if (newValue.length === length) {
      onComplete?.(newValue);
    }
  }, [otp, length, onChange, onComplete]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;

    const newOtp = [...otp];
    newOtp[index] = char.slice(-1);
    setOtp(newOtp);

    // Auto-focus suivant
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newOtp = pasted.split('');
    while (newOtp.length < length) newOtp.push('');
    setOtp(newOtp);

    const lastIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[lastIndex]?.focus();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 md:gap-3">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              'w-12 h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold rounded-xl',
              'bg-white dark:bg-odc-surface-dark',
              'text-odc-text-light dark:text-odc-text-dark',
              'border-2 transition-all duration-200',
              'focus:outline-none focus:ring-4',
              error
                ? 'border-odc-error focus:border-odc-error focus:ring-odc-error/10'
                : otp[index]
                ? 'border-odc-primary bg-odc-primary-soft/50 dark:bg-odc-primary-soft/10'
                : 'border-odc-border-light dark:border-odc-border-dark focus:border-odc-primary focus:ring-odc-primary/10',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        ))}
      </div>

      {error && (
        <p className="mt-3 text-center text-sm text-odc-error">{error}</p>
      )}
    </div>
  );
}