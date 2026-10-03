import { useState } from 'react';
import { X, Lock, Mail, User, Shield, Sparkles } from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';
import { soundEngine } from '../../audio/AudioSynthesizer';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login, register } = useClandestine();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(username, email, password, bio);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
      soundEngine.playPageTurn();
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail, userPass) => {
    setError(null);
    setLoading(true);
    try {
      await login(userEmail, userPass);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      {/* Background click to dismiss */}
      <div onClick={closeAuthModal} className="fixed inset-0 cursor-pointer pointer-events-auto" />

      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0d111a] border border-brightGold/40 shadow-2xl z-10 pointer-events-auto text-slate-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <Shield className="w-5 h-5 text-brightGold" />
            <h2 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wider">
              {tab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </h2>
          </div>
          <button 
            onClick={closeAuthModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/50 rounded-xl mb-5 border border-white/10 text-xs font-cinzel">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
              tab === 'login' 
                ? 'bg-brightGold/20 text-brightGold border border-brightGold/40 shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
              tab === 'register' 
                ? 'bg-brightGold/20 text-brightGold border border-brightGold/40 shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-slate-200 text-xs font-mono focus:border-brightGold/60 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="author@clandestine.internal"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-slate-200 text-xs font-mono focus:border-brightGold/60 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-slate-200 text-xs font-mono focus:border-brightGold/60 focus:outline-none"
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Bio</label>
              <input 
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Writer, researcher, and avid reader"
                className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-slate-200 text-xs font-mono focus:border-brightGold/60 focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-brightGold/20 hover:bg-brightGold/30 text-brightGold border border-brightGold/60 font-cinzel text-xs font-bold transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : (tab === 'login' ? 'Sign In' : 'Register')}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="text-[10px] font-mono text-slate-400 text-center uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-brightGold" />
            <span>Demo Accounts (1-Click Login)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('aris@clandestine.internal', 'password123')}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-cinzel text-slate-300 hover:text-brightGold transition-all cursor-pointer text-left"
            >
              <div className="font-bold">Sage Aris Thorne</div>
              <div className="text-[9px] text-slate-500 font-mono">Lead Writer</div>
            </button>

            <button
              onClick={() => handleQuickLogin('lyra@clandestine.internal', 'password123')}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-cinzel text-slate-300 hover:text-brightGold transition-all cursor-pointer text-left"
            >
              <div className="font-bold">Lyra Vance</div>
              <div className="text-[9px] text-slate-500 font-mono">Contributing Author</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
