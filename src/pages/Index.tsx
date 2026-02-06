import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { useNotes } from '@/hooks/useNotes';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BookmarkIcon, Star, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { notes, loading: notesLoading } = useNotes();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const loading = notesLoading || bookmarksLoading;
  const favoriteNotes = notes.filter(n => n.is_favorite);
  const favoriteBookmarks = bookmarks.filter(b => b.is_favorite);
  const recentNotes = notes.slice(0, 3);
  const recentBookmarks = bookmarks.slice(0, 3);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-display font-bold text-foreground mb-3">
            Welcome back! 👋
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Your personal knowledge hub for notes and bookmarks
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Notes</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : notes.length}</div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookmarks</CardTitle>
              <BookmarkIcon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : bookmarks.length}</div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Favorite Notes</CardTitle>
              <Star className="h-4 w-4 text-favorite" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : favoriteNotes.length}</div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Favorite Bookmarks</CardTitle>
              <Star className="h-4 w-4 text-favorite" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : favoriteBookmarks.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Recent Notes</h2>
              </div>
              <Link to="/notes">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : recentNotes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No notes yet</p>
                <Link to="/notes">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Note
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotes.map(note => (
                  <Link
                    key={note.id}
                    to="/notes"
                    className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {note.is_favorite && <Star className="h-3 w-3 fill-favorite text-favorite" />}
                      <span className="font-medium truncate">{note.title}</span>
                    </div>
                    {note.content && (
                      <p className="text-sm text-muted-foreground truncate mt-1">{note.content}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookmarkIcon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Recent Bookmarks</h2>
              </div>
              <Link to="/bookmarks">
                <Button variant="ghost" size="sm">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : recentBookmarks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No bookmarks yet</p>
                <Link to="/bookmarks">
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bookmark
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookmarks.map(bookmark => (
                  <a
                    key={bookmark.id}
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {bookmark.is_favorite && <Star className="h-3 w-3 fill-favorite text-favorite" />}
                      <span className="font-medium truncate">{bookmark.title || bookmark.url}</span>
                    </div>
                    {bookmark.description && (
                      <p className="text-sm text-muted-foreground truncate mt-1">{bookmark.description}</p>
                    )}
                  </a>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
