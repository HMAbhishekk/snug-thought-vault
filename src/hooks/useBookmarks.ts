import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Bookmark {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBookmarks = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch bookmarks');
      console.error('Error fetching bookmarks:', error);
    } else {
      setBookmarks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const fetchUrlMetadata = async (url: string): Promise<string | null> => {
    try {
      // Use a simple approach - just extract domain for now
      // In production, you'd use an edge function to fetch actual page title
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return null;
    }
  };

  const createBookmark = async (bookmark: { url: string; title: string; description: string; tags: string[] }) => {
    if (!user) return null;

    // If no title provided, try to auto-fetch
    let title = bookmark.title;
    if (!title.trim()) {
      const fetched = await fetchUrlMetadata(bookmark.url);
      title = fetched || bookmark.url;
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        url: bookmark.url,
        title,
        description: bookmark.description || null,
        tags: bookmark.tags,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create bookmark');
      console.error('Error creating bookmark:', error);
      return null;
    }

    setBookmarks(prev => [data, ...prev]);
    toast.success('Bookmark saved');
    return data;
  };

  const updateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    const { data, error } = await supabase
      .from('bookmarks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update bookmark');
      console.error('Error updating bookmark:', error);
      return null;
    }

    setBookmarks(prev => prev.map(b => b.id === id ? data : b));
    toast.success('Bookmark updated');
    return data;
  };

  const deleteBookmark = async (id: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete bookmark');
      console.error('Error deleting bookmark:', error);
      return false;
    }

    setBookmarks(prev => prev.filter(b => b.id !== id));
    toast.success('Bookmark deleted');
    return true;
  };

  const toggleFavorite = async (id: string) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if (!bookmark) return;

    await updateBookmark(id, { is_favorite: !bookmark.is_favorite });
  };

  return {
    bookmarks,
    loading,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    toggleFavorite,
    refetch: fetchBookmarks,
  };
}
