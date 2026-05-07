import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useVerifyEmail, useResendVerification } from '../hook/useAuthHooks';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('verifying');
  const [email, setEmail] = useState('');
  const [resendDone, setResendDone] = useState(false);
  const { verifyEmail, error: verifyError } = useVerifyEmail();
  const { resendVerification, isLoading: resending, error: resendError } = useResendVerification();

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    verifyEmail(token).then(() => setStatus('success')).catch(() => setStatus('error'));
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await resendVerification(email);
      setResendDone(true);
    } catch (_) {}
  };

  const quoteText = status === 'success' ? 'Identity\nconfirmed.' : 'Link\nexpired.';

  return (
    <AuthLayout quote={quoteText} quoteAuthor="— Verification system">
      {status === 'verifying' && (
        <div className="text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'var(--theme-accent-dim)', border: '1px solid var(--theme-accent-border)' }}>
            <Loader2 size={28} className="text-accent animate-spin" />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-white mb-1">Verifying...</h2>
            <p className="text-[13px] text-white/30">Confirming your identity.</p>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <CheckCircle2 size={28} style={{ color: '#4ade80' }} />
          </div>
          <div>
            <h2 className="text-[22px] font-bold text-white mb-2">Email verified.</h2>
            <p className="text-[13px] text-white/30">Your account is active. You can now sign in.</p>
          </div>
          <Link to="/login" className="btn-primary w-full justify-center py-3.5 text-[14px] block text-center">
            Continue to Sign In
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <XCircle size={28} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-white mb-1">Link invalid.</h2>
              <p className="text-[13px] text-red-400/70">{verifyError || 'Invalid or expired token.'}</p>
            </div>
          </div>

          {/* Resend section */}
          <div className="space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
            {resendDone ? (
              <p className="text-[13px] text-center" style={{ color: '#4ade80' }}>New link sent! Check your inbox.</p>
            ) : (
              <form onSubmit={handleResend} className="space-y-4">
                <div className="space-y-2">
                  <label className="label-eyebrow" style={{ fontSize: '10px' }}>Resend to email</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="input-minimal"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  {resendError && <p className="text-[11px] text-red-400/80">{resendError}</p>}
                </div>
                <button type="submit" disabled={resending} className="btn-ghost w-full justify-center py-3 text-[13px]">
                  {resending && <Loader2 size={13} className="animate-spin mr-2" />}
                  Resend Verification Link
                </button>
              </form>
            )}
            <Link to="/login" className="block text-center text-[12px] text-white/25 hover:text-white/50 transition-colors">
              Back to Sign In
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
