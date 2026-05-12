import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FrameOutLogo } from '../../../components/FrameOutLogo';

const LegalPage = () => {
  const { type } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  const content = {
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'May 12, 2026',
      sections: [
        {
          h: 'Data Collection',
          p: 'We collect minimal data necessary for the operation of Frame-Out. This includes your email for authentication and focus session data to provide analytics.'
        },
        {
          h: 'Local Storage',
          p: 'Most of your focus settings and temporary task lists are stored locally on your device to ensure maximum speed and privacy.'
        },
        {
          h: 'AI Processing',
          p: 'Our AI Coach processes focus patterns anonymously. We do not sell your personal data to third parties.'
        }
      ]
    },
    terms: {
      title: 'Terms of Service',
      lastUpdated: 'May 12, 2026',
      sections: [
        {
          h: 'Acceptance',
          p: 'By using Frame-Out, you agree to these terms. Frame-Out is a productivity tool designed to help you focus.'
        },
        {
          h: 'Usage Rules',
          p: 'You agree not to use the service for any illegal activities or to attempt to bypass our security measures.'
        },
        {
          h: 'Beta Software',
          p: 'Frame-Out is currently in active development (Hackathon Edition). Features may change or be removed at any time.'
        }
      ]
    },
    cookies: {
      title: 'Cookie Policy',
      lastUpdated: 'May 12, 2026',
      sections: [
        {
          h: 'What are cookies?',
          p: 'Cookies are small text files stored on your device. We use essential cookies for authentication and session management.'
        },
        {
          h: 'Analytics',
          p: 'We use privacy-friendly analytics to understand how users interact with our platform without tracking individual behavior across other sites.'
        }
      ]
    },
    security: {
      title: 'Security',
      lastUpdated: 'May 12, 2026',
      sections: [
        {
          h: 'Encryption',
          p: 'All data transmitted between your browser and our servers is encrypted using industry-standard TLS.'
        },
        {
          h: 'Extension Safety',
          p: 'Our Chrome Extension requires minimal permissions and only interacts with the sites you explicitly whitelist for blocking.'
        },
        {
          h: 'Reporting',
          p: 'If you find a security vulnerability, please report it to our team at security@frameout.app.'
        }
      ]
    }
  };

  const activeContent = content[type] || content.privacy;

  return (
    <div className="min-h-screen bg-[#080808] text-white/90 selection:bg-accent selection:text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-accent">
            <FrameOutLogo size={24} className="text-white" />
            <span className="text-[14px] font-bold tracking-tight text-white/90">Frame-Out</span>
          </Link>
          <Link to="/" className="text-[12px] text-white/40 hover:text-white transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 pt-32 pb-20">
        <div className="label-eyebrow mb-4">Legal Document</div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight">{activeContent.title}</h1>
        <p className="text-[12px] text-white/20 mb-12">Last Updated: {activeContent.lastUpdated}</p>

        <div className="space-y-12">
          {activeContent.sections.map((section, i) => (
            <section key={i} className="space-y-4">
              <h2 className="text-xl font-bold text-white tracking-wide">{section.h}</h2>
              <p className="text-white/40 leading-relaxed text-[15px]">{section.p}</p>
            </section>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-20 pt-10 border-t border-white/5">
          <div className="glass rounded-2xl p-6 border-white/5">
            <div className="text-xs text-white/20 uppercase tracking-widest mb-2 font-bold">Need help?</div>
            <p className="text-sm text-white/40 mb-4">If you have any questions regarding our policies, please contact us.</p>
            <a href="mailto:legal@frameout.app" className="text-accent text-sm font-bold hover:underline">
              legal@frameout.app
            </a>
          </div>
        </div>
      </main>

      {/* Navigation Footer */}
      <footer className="bg-black/40 py-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap gap-8 justify-center opacity-40 hover:opacity-100 transition-opacity">
          {Object.keys(content).map((key) => (
            <Link 
              key={key} 
              to={`/legal/${key}`}
              className={`text-[12px] uppercase tracking-widest font-bold ${type === key ? 'text-accent' : 'text-white'}`}
            >
              {content[key].title}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default LegalPage;
