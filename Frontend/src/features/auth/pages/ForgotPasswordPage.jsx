import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useForgotPassword } from '../hook/useAuthHooks';
import { Loader2, ArrowLeft, Send } from 'lucide-react';

const schema = z.object({
  email: z.string().min(1, 'Required').email('Invalid email'),
});

const ForgotPasswordPage = () => {
  const { forgotPassword, isLoading, error } = useForgotPassword();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data.email);
      setSuccess(true);
    } catch (_) {}
  };

  return (
    <AuthLayout quote={"Reset\nyour course."} quoteAuthor="— Start fresh">
      {success ? (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'var(--theme-accent-dim)', border: '1px solid var(--theme-accent-border)' }}>
            <Send size={26} className="text-accent" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-white mb-2">Link sent.</h2>
            <p className="text-[14px] text-white/30 leading-relaxed">
              Check your inbox for the password reset link.
            </p>
          </div>
          <Link to="/login" className="btn-ghost w-full justify-center py-3 text-[13px] flex items-center gap-2">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      ) : (
        <>
          <div className="auth-form-el space-y-1.5">
            <h1 className="text-[28px] font-bold text-white tracking-tight">Forgot password.</h1>
            <p className="text-[14px] text-white/30">We'll send you a secure reset link.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            <div className="auth-form-el space-y-2">
              <label className="label-eyebrow" style={{ fontSize: '10px' }}>Email</label>
              <input type="email" placeholder="name@example.com" className="input-minimal" {...register('email')} />
              {errors.email && <p className="text-[11px] text-red-400/80">{errors.email.message}</p>}
            </div>

            {error && (
              <div className="auth-form-el rounded-xl p-3.5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-[12px] text-red-400">{error}</p>
              </div>
            )}

            <div className="auth-form-el space-y-3">
              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 text-[14px]">
                {isLoading && <Loader2 size={15} className="animate-spin mr-2" />}
                Send Reset Link
              </button>
              <Link to="/login" className="btn-ghost w-full justify-center py-3 text-[13px] flex items-center gap-2">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
