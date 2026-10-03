import { useState, useEffect } from 'react';
import { X, BookOpen, Heart, Edit3, LogOut } from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';

export default function AuthorProfileModal() {
  const { 
    isProfileModalOpen, 
    closeProfileModal, 
    viewingAuthor, 
    currentUser, 
    logout, 
    updateProfile, 
    posts, 
    selectPostById,
    bookmarkedIds
  } = useClandestine();

  const author = viewingAuthor || currentUser;
  const isOwnProfile = currentUser && author && currentUser.id === author.id;

  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (author) {
      setEditBio(author.bio || '');
      setEditAvatar(author.avatar || 'SC');
    }
  }, [author]);

  if (!isProfileModalOpen || !author) return null;

  // Filter posts authored by this user
  const authoredPosts = posts.filter(p => p.userId === author.id);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        bio: editBio,
        avatar: editAvatar.toUpperCase().slice(0, 2)
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      <div onClick={closeProfileModal} className="fixed inset-0 cursor-pointer pointer-events-auto" />

      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0d121c] border-2 border-brightGold/40 shadow-2xl z-10 pointer-events-auto text-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-700 to-red-950 border-2 border-brightGold flex items-center justify-center text-lg font-bold font-cinzel text-amber-200 shadow-md">
              {author.avatar || 'SC'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wider">
                  {author.username}
                </h2>
                {isOwnProfile && (
                  <span className="px-2 py-0.5 rounded-full bg-brightGold/20 text-brightGold text-[9px] font-mono border border-brightGold/40">
                    YOU
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                {author.role === 'archivist' ? 'Lead Editor' : 'Author'}
              </p>
            </div>
          </div>

          <button 
            onClick={closeProfileModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 folio-scroll">
          
          {/* Bio Section */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Avatar Monogram (2 letters)</label>
                  <input 
                    type="text"
                    maxLength={2}
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-20 px-3 py-1.5 rounded-lg bg-black/70 border border-white/20 text-xs font-mono text-center text-brightGold font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Bio</label>
                  <textarea 
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-black/70 border border-white/20 text-xs font-cormorant text-slate-200"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 rounded-lg text-slate-400 hover:text-white text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-4 py-1 rounded-lg bg-brightGold text-obsidian font-cinzel font-bold text-xs hover:bg-yellow-400"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">About</span>
                  {isOwnProfile && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-[11px] text-brightGold hover:underline flex items-center gap-1 font-mono cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Bio</span>
                    </button>
                  )}
                </div>
                <p className="font-cormorant italic text-base sm:text-lg text-amber-100/90 leading-relaxed">
                  "{author.bio || 'Author and community contributor.'}"
                </p>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-xl font-bold font-cinzel text-brightGold">{authoredPosts.length}</div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Posts</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-xl font-bold font-cinzel text-brightGold">
                {isOwnProfile ? bookmarkedIds.length : '—'}
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Bookmarks</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-xl font-bold font-cinzel text-brightGold">
                {authoredPosts.reduce((acc, p) => acc + (p.sparks || 0), 0)}
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Likes</div>
            </div>
          </div>

          {/* Authored Posts List */}
          <div>
            <h3 className="font-cinzel text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brightGold" />
              <span>Published Posts ({authoredPosts.length})</span>
            </h3>

            {authoredPosts.length === 0 ? (
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center font-cormorant italic text-slate-500">
                No posts published under this profile yet.
              </div>
            ) : (
              <div className="space-y-2">
                {authoredPosts.map((post) => (
                  <div 
                    key={post.id}
                    onClick={() => {
                      closeProfileModal();
                      selectPostById(post.id, true);
                    }}
                    className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-brightGold/50 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-cinzel text-xs font-bold text-white group-hover:text-brightGold transition-colors">
                        {post.title}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-brightGold">{post.category}</span>
                        <span>•</span>
                        <span>{post.readingTime}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-red-400">
                          <Heart className="w-2.5 h-2.5 fill-red-400" />
                          {post.sparks}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 group-hover:text-brightGold">
                      Read »
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        {isOwnProfile && (
          <div className="px-6 py-3.5 border-t border-white/10 bg-black/40 flex items-center justify-between flex-shrink-0">
            <button
              onClick={logout}
              className="text-xs font-cinzel text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <button
              onClick={closeProfileModal}
              className="px-4 py-1.5 rounded-xl bg-brightGold/20 hover:bg-brightGold/30 text-brightGold border border-brightGold/60 font-cinzel text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
