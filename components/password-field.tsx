"use client";

import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes, useState } from "react";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
};

export function PasswordField({
  className,
  label,
  ...inputProps
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className={className}>
      <span>{label}</span>
      <span className="password-control">
        <input {...inputProps} type={visible ? "text" : "password"} />
        <button
          aria-label={visible ? "Nascondi password" : "Mostra password"}
          aria-pressed={visible}
          className="password-visibility"
          onClick={() => setVisible((current) => !current)}
          type="button"
        >
          {visible ? (
            <EyeOff aria-hidden="true" size={20} />
          ) : (
            <Eye aria-hidden="true" size={20} />
          )}
        </button>
      </span>
    </label>
  );
}
