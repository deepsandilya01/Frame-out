import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useResetPassword } from '../hook/useAuthHooks';
import { Loader2, ShieldCheck } from 'lucide-react';

const schema = z.object({
  password: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });

const getStrength = (p) => {
  let s = 0;
  if (p.length > 5) s += 25;
  if (/[a-z]/.test(p)) s += 25;
  if (/[A-Z]/.test(p)) s += 25;
  if (/[0-9!@#$%]/.test(p)) s += 25;
  return s;
};

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const { resetPassword, isLoading, error } = useResetPassword();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const password = watch('password', '');
  const strength = getStrength(password);
  const strengthColor = strength <= 25 ? '#ef4444' : strength <= 50 ? '#f97316' : strength <= 75 ? '#eab308' : '#4ade80';

  const onSubmit = async (data) => {
    if (!token) return;
    try {
      await resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (_) {}
  };

  if (!token) {
    return (
      <AuthLayout quote={"Invalid\ntoken."}>
        <div className="text-center space-y-5">
          <p className="text-[14px] text-white/30">This reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="btn-primary w-full justify-center py-3.5 text-[14px] block text-center">
            Request New Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout quote={"New\nbeginning."}>
      {success ? (
        <div className="text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <ShieldCheck size={28} style={{ color: '#4ade80' }} />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-white mb-2">Password updated.</h2>
            <p className="text-[13px] text-white/30">Redirecting to login...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="auth-form-el space-y-1.5">
            <h1 className="text-[28px] font-bold text-white tracking-tight">Reset password.</h1>
            <p className="text-[14px] text-white/30">Set your new secure password.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="auth-form-el space-y-2">
              <label className="label-eyebrow" style={{ fontSize: '10px' }}>New Password</label>
              <input type="password" placeholder="••••••••" className="input-minimal" {...register('password')} />
              {password.length > 0 && (
                <div className="h-0.5 rounded-full bg-white/6 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${strength}%`, background: strengthColor }} />
                </div>
              )}
              {errors.password && <p className="text-[11px] text-red-400/80">{errors.password.message}</p>}
            </div>

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
                Update Password
              </button>
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
