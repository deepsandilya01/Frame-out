import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FrameOutLogo } from '../../../components/FrameOutLogo';
import DeepImg from '../../../assets/deep.png';
import PranayImg from '../../../assets/pranay.png';
import AnuragImg from '../../../assets/anurag.png';
import AtharvImg from '../../../assets/atharv.png';
import TwishaImg from '../../../assets/twisha.png';

const TeamPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // We'll populate this as the user provides details
  const teamMembers = [
    {
      name: 'Deep Sandilya',
      role: 'Full Stack Lead',
      bio: 'Chief Architect and Full Stack Lead. Deep is the driving force behind the Frame-Out ecosystem, specializing in high-performance neural productivity systems and AI-driven behavioral modification. A relentless builder of digital sanctuaries.',
      image: DeepImg,
      socials: {
        github: 'https://github.com/deepsandilya01',
        linkedin: 'https://linkedin.com/in/deepsandilya01',
        twitter: 'https://twitter.com/SandilyaDe12434'
      },
      skills: ['Neural Productivity Systems', 'Full-Stack Architecture', 'AI Engineering']
    },
    {
      name: 'Pranay R Borgaonkar',
      role: 'App Developer & Researcher',
      bio: 'A core strategist at ADAPTrix, Pranay bridges the gap between high-performance mobile engineering and the cutting-edge psychology of focus to engineer the ultimate distraction-free environments.',
      image: PranayImg,
      socials: {
        github: '#',
        linkedin: '#',
        twitter: '#'
      },
      skills: ['Mobile Dev', 'User Research', 'Behavioral Psych']
    },
    {
      name: 'Anurag Baghel',
      role: 'Web Developer',
      bio: 'Anurag is the Master of Pixels and Sensory Experience at ADAPTrix. He ensures that every interaction within Frame-Out is not only functional but also visually stunning and perfectly responsive across the entire digital landscape.',
      image: AnuragImg,
      socials: {
        github: '#',
        linkedin: '#',
        twitter: '#'
      },
      skills: ['Frontend Engineering', 'UI/UX Design', 'CSS Sorcery']
    },
    {
      name: 'Atharv Tambe',
      role: 'App Developer',
      bio: 'Atharv is the Mobility Architect at ADAPTrix. He specializes in engineering fluid, high-performance mobile ecosystems that keep your focus anchored even in the most chaotic environments.',
      image: AtharvImg,
      socials: {
        github: '#',
        linkedin: '#',
        twitter: '#'
      },
      skills: ['React Native', 'Mobile UI', 'Cloud Sync']
    },
    {
      name: 'Twisha Shrivastava',
      role: 'UI/UX Designer',
      bio: 'Twisha is the Creative Director and UI/UX Visionary at ADAPTrix. She designs the digital sanctuaries of tomorrow, ensuring focus feels natural and deep work becomes a premium, aesthetic experience.',
      image: TwishaImg,
      socials: {
        github: '#',
        linkedin: '#',
        twitter: '#'
      },
      skills: ['Interface Design', 'User Experience', 'Prototyping']
    }
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-white/90 selection:bg-accent selection:text-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-accent">
            <FrameOutLogo size={24} className="text-white" />
            <span className="text-[14px] font-bold tracking-tight text-white/90">Frame-Out</span>
          </Link>
          <Link to="/" className="text-[12px] text-white/40 hover:text-white transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="label-eyebrow mb-4"><span className="animate-brand">ADAPTrix</span> Team</div>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">The minds behind Frame-Out.</h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
            We are a small group of thinkers, builders, and deep workers dedicated to reclaiming the human attention span.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="pb-32 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8">
          {teamMembers.map((member, i) => (
            <div key={i} className="glass rounded-3xl p-8 border-white/5 hover:border-accent/20 transition-colors group w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-[400px]">
              <div className="relative w-32 h-32 mb-8 mx-auto">
                <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full group-hover:bg-accent/40 transition-colors" />
                <img 
                  src={member.image} 
                  alt={`${member.name} - ${member.role}`}
                  loading="lazy"
                  decoding="async"
                  width="128"
                  height="128"
                  className="relative w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 border border-white/10"
                />
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                <div className="text-accent text-xs font-bold uppercase tracking-widest mb-4">{member.role}</div>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  {member.bio}
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {member.skills.map(skill => (
                    <span key={skill} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-white/40">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex justify-center gap-4 border-t border-white/5 pt-6">
                  {Object.entries(member.socials).map(([platform, url]) => (
                    <a 
                      key={platform} 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white/20 hover:text-white transition-colors capitalize text-xs font-medium"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Manifesto Quote */}
      <section className="py-20 bg-white/5 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <blockquote className="text-2xl sm:text-3xl font-light italic text-white/60 leading-relaxed">
            "We are not just building a tool; we are building a sanctuary for the mind in an age of constant noise."
          </blockquote>
          <div className="mt-8 text-accent font-bold tracking-widest text-xs uppercase">— <span className="animate-brand">ADAPTrix</span> Team</div>
        </div>
      </section>
    </div>
  );
};

export default TeamPage;
