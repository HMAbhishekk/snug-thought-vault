import { useState, useMemo } from 'react';
import { useNotes, Note } from '@/hooks/useNotes';
import Layout from '@/components/Layout';
import NoteCard from '@/components/NoteCard';
import NoteDialog from '@/components/NoteDialog';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import SearchBar from '@/components/SearchBar';
import FilterTabs from '@/components/FilterTabs';
import EmptyState from '@/components/EmptyState';
import TagBadge from '@/components/TagBadge';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Loader2 } from 'lucide-react';

export default function Notes() {
  const { notes, loading, createNote, updateNote, deleteNote, toggleFavorite } = useNotes();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Search filter
      const matchesSearch = !search || 
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content?.toLowerCase().includes(search.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));

      // Favorites filter
      const matchesFavorite = filter === 'all' || (filter === 'favorites' && note.is_favorite);

      // Tags filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => note.tags.includes(tag));

      return matchesSearch && matchesFavorite && matchesTags;
    });
  }, [notes, search, filter, selectedTags]);

  const handleSave = async (data: { title: string; content: string; tags: string[] }) => {
    if (editingNote) {
      await updateNote(editingNote.id, data);
    } else {
      await createNote(data);
    }
    setEditingNote(null);
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteNote(deleteId);
      setDeleteId(null);
    }
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Notes</h1>
            <p className="text-muted-foreground mt-1">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} saved
            </p>
          </div>
          <Button onClick={() => { setEditingNote(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search notes..."
            />
          </div>
          <FilterTabs
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'favorites', label: 'Favorites' },
            ]}
          />
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTagFilter(tag)}
                className={`transition-all ${selectedTags.includes(tag) ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              >
                <TagBadge tag={tag} />
              </button>
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="text-xs"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {/* Notes grid */}
        {filteredNotes.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-12 w-12 text-muted-foreground" />}
            title={notes.length === 0 ? "No notes yet" : "No matching notes"}
            description={
              notes.length === 0
                ? "Create your first note to get started"
                : "Try adjusting your search or filters"
            }
            action={
              notes.length === 0 && (
                <Button onClick={() => { setEditingNote(null); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Note
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note, index) => (
              <div
                key={note.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NoteCard
                  note={note}
                  onEdit={handleEdit}
                  onDelete={setDeleteId}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <NoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        note={editingNote}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
      />
    </Layout>
  );
}
