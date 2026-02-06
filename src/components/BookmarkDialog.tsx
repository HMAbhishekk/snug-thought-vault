import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import TagInput from './TagInput';
import { Bookmark } from '@/hooks/useBookmarks';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const urlSchema = z.string().url({ message: "Please enter a valid URL" });

interface BookmarkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmark?: Bookmark | null;
  onSave: (data: { url: string; title: string; description: string; tags: string[] }) => Promise<void>;
}

export default function BookmarkDialog({ open, onOpenChange, bookmark, onSave }: BookmarkDialogProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    if (bookmark) {
      setUrl(bookmark.url);
      setTitle(bookmark.title || '');
      setDescription(bookmark.description || '');
      setTags(bookmark.tags);
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
      setTags([]);
    }
    setUrlError('');
  }, [bookmark, open]);

  const validateUrl = (value: string) => {
    if (!value.trim()) {
      setUrlError('URL is required');
      return false;
    }
    
    // Add protocol if missing
    let urlToValidate = value;
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      urlToValidate = 'https://' + value;
    }
    
    const result = urlSchema.safeParse(urlToValidate);
    if (!result.success) {
      setUrlError('Please enter a valid URL');
      return false;
    }
    setUrlError('');
    return urlToValidate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validUrl = validateUrl(url);
    if (!validUrl) return;

    setSaving(true);
    await onSave({ 
      url: validUrl, 
      title: title.trim(), 
      description: description.trim(), 
      tags 
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {bookmark ? 'Edit Bookmark' : 'Add Bookmark'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) validateUrl(e.target.value);
              }}
              placeholder="https://example.com"
              required
              className={urlError ? 'border-destructive' : ''}
            />
            {urlError && <p className="text-sm text-destructive">{urlError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave empty to auto-detect"
            />
            <p className="text-xs text-muted-foreground">
              If left empty, we'll use the domain name
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this bookmark about?"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput tags={tags} onTagsChange={setTags} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !url.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {bookmark ? 'Save Changes' : 'Add Bookmark'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
