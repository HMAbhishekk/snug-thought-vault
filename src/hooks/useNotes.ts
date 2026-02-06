import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Note {
  id: string;
  title: string;
  content: string | null;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch notes');
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const createNote = async (note: { title: string; content: string; tags: string[] }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: note.title,
        content: note.content,
        tags: note.tags,
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to create note');
      console.error('Error creating note:', error);
      return null;
    }

    setNotes(prev => [data, ...prev]);
    toast.success('Note created');
    return data;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update note');
      console.error('Error updating note:', error);
      return null;
    }

    setNotes(prev => prev.map(n => n.id === id ? data : n));
    toast.success('Note updated');
    return data;
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete note');
      console.error('Error deleting note:', error);
      return false;
    }

    setNotes(prev => prev.filter(n => n.id !== id));
    toast.success('Note deleted');
    return true;
  };

  const toggleFavorite = async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    await updateNote(id, { is_favorite: !note.is_favorite });
  };

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    refetch: fetchNotes,
  };
}
