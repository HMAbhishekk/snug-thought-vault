import { useState, useMemo } from 'react';
import { useBookmarks, Bookmark } from '@/hooks/useBookmarks';
import Layout from '@/components/Layout';
import BookmarkCard from '@/components/BookmarkCard';
import BookmarkDialog from '@/components/BookmarkDialog';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import SearchBar from '@/components/SearchBar';
import FilterTabs from '@/components/FilterTabs';
import EmptyState from '@/components/EmptyState';
import TagBadge from '@/components/TagBadge';
import { Button } from '@/components/ui/button';
import { Plus, BookmarkIcon, Loader2 } from 'lucide-react';

export default function Bookmarks() {
  const { bookmarks, loading, createBookmark, updateBookmark, deleteBookmark, toggleFavorite } = useBookmarks();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    bookmarks.forEach(bookmark => bookmark.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [bookmarks]);

  // Filter bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(bookmark => {
      // Search filter
      const matchesSearch = !search || 
        bookmark.title?.toLowerCase().includes(search.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(search.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(search.toLowerCase()) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));

      // Favorites filter
      const matchesFavorite = filter === 'all' || (filter === 'favorites' && bookmark.is_favorite);

      // Tags filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => bookmark.tags.includes(tag));

      return matchesSearch && matchesFavorite && matchesTags;
    });
  }, [bookmarks, search, filter, selectedTags]);

  const handleSave = async (data: { url: string; title: string; description: string; tags: string[] }) => {
    if (editingBookmark) {
      await updateBookmark(editingBookmark.id, data);
    } else {
      await createBookmark(data);
    }
    setEditingBookmark(null);
  };

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteBookmark(deleteId);
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
            <h1 className="text-3xl font-display font-bold text-foreground">Bookmarks</h1>
            <p className="text-muted-foreground mt-1">
              {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'} saved
            </p>
          </div>
          <Button onClick={() => { setEditingBookmark(null); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bookmark
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search bookmarks..."
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

        {/* Bookmarks grid */}
        {filteredBookmarks.length === 0 ? (
          <EmptyState
            icon={<BookmarkIcon className="h-12 w-12 text-muted-foreground" />}
            title={bookmarks.length === 0 ? "No bookmarks yet" : "No matching bookmarks"}
            description={
              bookmarks.length === 0
                ? "Save your first bookmark to get started"
                : "Try adjusting your search or filters"
            }
            action={
              bookmarks.length === 0 && (
                <Button onClick={() => { setEditingBookmark(null); setDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bookmark
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBookmarks.map((bookmark, index) => (
              <div
                key={bookmark.id}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <BookmarkCard
                  bookmark={bookmark}
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
      <BookmarkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bookmark={editingBookmark}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Bookmark"
        description="Are you sure you want to delete this bookmark? This action cannot be undone."
      />
    </Layout>
  );
}
