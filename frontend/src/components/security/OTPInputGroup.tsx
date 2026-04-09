'use client';

import React, { useRef, useEffect } from 'react';

interface OTPInputGroupProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  hasError?: boolean;
}

export default function OTPInputGroup({ value, onChange, length = 6, hasError }: OTPInputGroupProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputs.current[0]) {
      inputs.current[0].focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return; // Only allow digits

    const newOtp = value.split('');
    newOtp[index] = val.slice(-1); // Take last char if multiple pasted
    const updatedValue = newOtp.join('');
    onChange(updatedValue);

    // Auto-focus next
    if (val && index < length - 1 && inputs.current[index + 1]) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0 && inputs.current[index - 1]) {
      // Auto-focus previous on backspace
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d*$/.test(pastedData)) return;
    onChange(pastedData);
    
    // Focus last filled or next empty
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex justify-between gap-2.5 sm:gap-4" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={`w-full h-12 text-center text-xl font-bold rounded-xl border transition-all outline-none 
            ${hasError 
              ? 'border-rose-300 text-rose-500 bg-rose-500/10 shadow-[0_0_10px_rgba(244,63,94,0.1)]' 
              : 'border-border text-foreground bg-surface focus:border-primary focus:shadow-[0_0_15px_rgba(30,58,138,0.1)]'
            }`}

        />
      ))}
    </div>
  );
}
