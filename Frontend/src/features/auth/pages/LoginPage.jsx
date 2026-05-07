import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useLogin } from '../hook/useAuthHooks';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';

const loginSchema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
});

const LoginPage = () => {
  const { login, isLoading, error } = useLogin();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate('/');
    } catch (_) {}
  };

  return (
    <AuthLayout quote={"Discipline\ncreates freedom."}>
      {/* Heading */}
      <div className="auth-form-el space-y-1.5">
        <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">
          Welcome back.
        </h1>
        <p className="text-[14px] text-white/30">Enter your coordinates.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        {/* Email */}
        <div className="auth-form-el space-y-2">
          <label className="label-eyebrow" style={{ fontSize: '10px' }}>Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            className="input-minimal"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-[11px] text-red-400/80 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="auth-form-el space-y-2">
          <div className="flex items-center justify-between">
            <label className="label-eyebrow" style={{ fontSize: '10px' }}>Password</label>
            <Link to="/forgot-password" className="text-[11px] text-accent/70 hover:text-accent transition-colors">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className="input-minimal pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-0 bottom-3 text-white/20 hover:text-white/50 transition-colors"
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-400/80 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="auth-form-el rounded-xl p-3.5" style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <p className="text-[12px] text-red-400">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="auth-form-el">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full justify-center py-3.5 text-[14px]"
          >
            {isLoading ? <Loader2 size={15} className="animate-spin mr-2" /> : null}
            Sign In
          </button>
        </div>
      </form>

      {/* Divider */}
      <div className="auth-form-el flex items-center gap-4">
        <div className="divider-laser flex-1" />
        <span className="text-[11px] text-white/20">or</span>
        <div className="divider-laser flex-1" />
      </div>

      {/* Google — branding-compliant button */}
      <GoogleSignInButton label="Continue with Google" />

      {/* Footer link */}
      <p className="auth-form-el text-center text-[12px] text-white/25">
        Don't have an account?{' '}
        <Link to="/register" className="text-accent/70 hover:text-accent transition-colors font-medium">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
