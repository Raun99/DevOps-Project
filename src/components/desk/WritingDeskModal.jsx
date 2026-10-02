import React, { useState, useEffect } from 'react';
import { X, Feather, Plus, FolderPlus, Tag, Clock, BookOpen, Sparkles, Check } from 'lucide-react';
import { useClandestine } from '../../context/ClandestineContext';
import { soundEngine } from '../../audio/AudioSynthesizer';

export default function WritingDeskModal() {
  const { 
    isWritingDeskOpen, 
    closeWritingDesk, 
    editingPost, 
    createPost, 
    updatePost, 
    categories, 
    createCategory, 
    currentUser, 
    openAuthModal 
  } = useClandestine();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isCreatingWing, setIsCreatingWing] = useState(false);
  const [newWingName, setNewWingName] = useState('');
  const [newWingTheme, setNewWingTheme] = useState('arcane');
  const [newWingColor, setNewWingColor] = useState('#38BDF8');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill form when editing an existing post
  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setSubtitle(editingPost.subtitle || '');
      setContent(editingPost.rawContent || editingPost.contentLeft + '\n\n' + editingPost.contentRight || '');
      setCategoryId(editingPost.categoryId || (categories[0]?.id || 'cat-cathedral'));
      setTagsInput(editingPost.tags ? editingPost.tags.join(', ') : '');
    } else {
      setTitle('');
      setSubtitle('');
      setContent('');
      setCategoryId(categories[0]?.id || 'cat-cathedral');
      setTagsInput('');
    }
    setError(null);
  }, [editingPost, categories, isWritingDeskOpen]);

  if (!isWritingDeskOpen) return null;

  // Real-time word count & reading time
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedReadTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;

  const handleCreateWing = async (e) => {
    e.preventDefault();
    if (!newWingName.trim()) return;
    try {
      const created = await createCategory({
        name: newWingName.trim(),
        color: newWingColor,
        theme: newWingTheme
      });
      setCategoryId(created.id);
      setIsCreatingWing(false);
      setNewWingName('');
    } catch (err) {
      setError(err.message || 'Failed to create castle wing.');
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      openAuthModal();
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Both title and manuscript text are required.');
      return;
    }

    setIsSubmitting(true);
    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    try {
      if (editingPost) {
        await updatePost(editingPost.id, {
          title: title.trim(),
          subtitle: subtitle.trim(),
          content: content.trim(),
          category_id: categoryId || categories[0]?.id,
          tags
        });
      } else {
        await createPost({
          title: title.trim(),
          subtitle: subtitle.trim(),
          content: content.trim(),
          category_id: categoryId || categories[0]?.id,
          tags
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to preserve manuscript.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in select-none">
      
      {/* Background dismiss */}
      <div onClick={closeWritingDesk} className="fixed inset-0 cursor-pointer pointer-events-auto" />

      {/* Writing Desk Modal Window */}
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0b0e17] border-2 border-brightGold/40 shadow-2xl z-10 pointer-events-auto text-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brightGold/15 border border-brightGold/40 text-brightGold">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wider">
                {editingPost ? 'REVISE ARCHIVE MANUSCRIPT' : "SCRIBE'S WRITING DESK"}
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                {editingPost ? `Editing Article: #${editingPost.id}` : 'Inscribe a new article into the castle library'}
              </p>
            </div>
          </div>

          <button 
            onClick={closeWritingDesk}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Logged In Warning Banner */}
        {!currentUser && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center justify-between">
            <span>⚠️ You are currently wandering as an unregistered visitor. Sign in to seal manuscripts under your scholar name.</span>
            <button
              onClick={openAuthModal}
              className="ml-3 px-3 py-1 rounded bg-brightGold text-obsidian font-cinzel font-bold text-[11px] cursor-pointer hover:bg-yellow-400"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs folio-scroll">
          
          {/* Title */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">
              Manuscript Title *
            </label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Celestial Drift: Observations on Stellar Cartography"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-slate-100 text-sm font-cinzel focus:border-brightGold/70 focus:outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">
              Subtitle / Epigraph
            </label>
            <input 
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. A meditation on architectural vantage points across the kingdom"
              className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-slate-200 text-xs focus:border-brightGold/70 focus:outline-none placeholder:text-slate-600"
            />
          </div>

          {/* Category & Castle Wing Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] uppercase tracking-wider text-slate-400">
                  Castle Wing / Category *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingWing(!isCreatingWing)}
                  className="text-[10px] text-brightGold hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{isCreatingWing ? 'Cancel Wing' : 'Create New Wing'}</span>
                </button>
              </div>

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/80 border border-white/15 text-slate-200 text-xs focus:border-brightGold/70 focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.postCount || 0} manuscripts)
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                Scholar Tags (comma separated)
              </label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Astronomy, Optics, Cartography"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-black/60 border border-white/15 text-slate-200 text-xs focus:border-brightGold/70 focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Inline "Create New Castle Wing" Drawer */}
          {isCreatingWing && (
            <div className="p-3.5 rounded-2xl bg-[#141b2a] border border-brightGold/40 space-y-3 animate-fade-in">
              <div className="flex items-center space-x-2 text-brightGold font-cinzel font-bold text-xs">
                <FolderPlus className="w-4 h-4" />
                <span>Found a New Castle Wing (Dynamic Category)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input 
                  type="text"
                  value={newWingName}
                  onChange={(e) => setNewWingName(e.target.value)}
                  placeholder="Wing Name (e.g. Chronomancy)"
                  className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-black/70 border border-white/20 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleCreateWing}
                  className="px-3 py-1.5 rounded-lg bg-brightGold text-obsidian font-cinzel font-bold text-xs hover:bg-yellow-400 transition-colors cursor-pointer"
                >
                  Confirm Wing
                </button>
              </div>
            </div>
          )}

          {/* Manuscript Body Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] uppercase tracking-wider text-slate-400">
                Manuscript Discourse / Content *
              </label>
              <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                <span>{wordCount} words</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-antiqueGold" />
                  {estimatedReadTime}
                </span>
              </div>
            </div>

            <textarea 
              rows={10}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Inscribe your thoughts here. The text will automatically be laid out into the open two-page grimoire reader..."
              className="w-full p-4 rounded-2xl bg-black/60 border border-white/15 text-slate-100 text-sm font-cormorant leading-relaxed focus:border-brightGold/70 focus:outline-none placeholder:text-slate-600 select-text"
            />
          </div>

        </form>

        {/* Bottom Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-black/40 flex-shrink-0">
          <button
            type="button"
            onClick={closeWritingDesk}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-cinzel"
          >
            Cancel Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handlePublish}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-900 to-amber-700 hover:from-red-800 hover:to-amber-600 text-amber-100 font-cinzel text-xs font-bold tracking-wider transition-all border border-brightGold/50 shadow-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Feather className="w-4 h-4 text-brightGold" />
            <span>{isSubmitting ? 'Sealing...' : (editingPost ? 'UPDATE MANUSCRIPT' : 'SEAL & PUBLISH')}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
