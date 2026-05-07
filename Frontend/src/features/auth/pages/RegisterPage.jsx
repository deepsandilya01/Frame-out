import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useRegister } from '../hook/useAuthHooks';
import { authService } from '../service/auth.service';
import { Eye, EyeOff, Loader2, CheckCircle2, Mail } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';

const schema = z.object({
  fullname: z.string().min(2, 'Min 2 characters'),
  email: z.string().min(1, 'Required').email('Invalid email'),
  contact: z.string().optional(),
  password: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const getStrength = (p) => {
  let s = 0;
  if (p.length > 5) s += 25;
  if (/[a-z]/.test(p)) s += 25;
  if (/[A-Z]/.test(p)) s += 25;
  if (/[0-9!@#$%]/.test(p)) s += 25;
  return s;
};

const RegisterPage = () => {
  const { register: registerUser, isLoading, error } = useRegister();
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const password = watch('password', '');
  const strength = getStrength(password);
  const strengthLabel = strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong';
  const strengthColor = strength <= 25 ? '#ef4444' : strength <= 50 ? '#f97316' : strength <= 75 ? '#eab308' : '#4ade80';

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      setSuccess(true);
    } catch (_) {}
  };

  if (success) {
    return (
      <AuthLayout quote={"Become\nthe best version."}>
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <Mail size={28} style={{ color: '#4ade80' }} />
          </div>
          <div>
            <h2 className="text-[24px] font-bold text-white mb-2">Check your inbox.</h2>
            <p className="text-[14px] text-white/30 leading-relaxed">
              We've sent a verification link to your email. Click it to activate your account.
            </p>
          </div>
          <Link to="/login" className="btn-primary w-full justify-center py-3.5 text-[14px] block text-center">
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout quote={"Become\nthe best version."}>
      <div className="auth-form-el space-y-1.5">
        <h1 className="text-[28px] font-bold text-white tracking-tight">Create account.</h1>
        <p className="text-[14px] text-white/30">Join the sanctuary.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {[
          { key: 'fullname', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
          { key: 'email', label: 'Email', type: 'email', placeholder: 'name@example.com' },
          { key: 'contact', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210' },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key} className="auth-form-el space-y-2">
            <label className="label-eyebrow" style={{ fontSize: '10px' }}>{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              className="input-minimal"
              {...register(key)}
            />
            {errors[key] && <p className="text-[11px] text-red-400/80">{errors[key].message}</p>}
          </div>
        ))}

        {/* Password */}
        <div className="auth-form-el space-y-2">
          <label className="label-eyebrow" style={{ fontSize: '10px' }}>Password</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className="input-minimal pr-10"
              {...register('password')}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-0 bottom-3 text-white/20 hover:text-white/50 transition-colors">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="space-y-1.5">
              <div className="h-0.5 rounded-full bg-white/6 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${strength}%`, background: strengthColor }} />
              </div>
              <p className="text-[10px]" style={{ color: strengthColor }}>{strengthLabel}</p>
            </div>
          )}
          {errors.password && <p className="text-[11px] text-red-400/80">{errors.password.message}</p>}
        </div>

        {/* Confirm */}
        <div className="auth-form-el space-y-2">
          <label className="label-eyebrow" style={{ fontSize: '10px' }}>Confirm Password</label>
          <input type="password" placeholder="••••••••" className="input-minimal" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-[11px] text-red-400/80">{errors.confirmPassword.message}</p>}
        </div>

        {error && (
          <div className="auth-form-el rounded-xl p-3.5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-[12px] text-red-400">{error}</p>
          </div>
        )}

        <div className="auth-form-el">
          <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 text-[14px]">
            {isLoading && <Loader2 size={15} className="animate-spin mr-2" />}
            Create Account
          </button>
        </div>
      </form>

      <div className="auth-form-el flex items-center gap-4">
        <div className="divider-laser flex-1" />
        <span className="text-[11px] text-white/20">or</span>
        <div className="divider-laser flex-1" />
      </div>

      {/* Google — branding-compliant button */}
      <GoogleSignInButton label="Sign up with Google" />

      <p className="auth-form-el text-center text-[12px] text-white/25">
        Already have an account?{' '}
        <Link to="/login" className="text-accent/70 hover:text-accent transition-colors font-medium">Sign in</Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
