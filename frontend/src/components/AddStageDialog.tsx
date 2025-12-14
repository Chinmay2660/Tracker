import { useState } from 'react';
import { useColumns } from '../hooks/useColumns';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';

const PRESET_COLORS = [
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#ef4444', // red
  '#6366f1', // indigo
  '#64748b', // slate
];

interface AddStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (columnId: string) => void;
}

export default function AddStageDialog({ open, onOpenChange, onSuccess }: AddStageDialogProps) {
  const { columns = [], createColumn } = useColumns();
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#14b8a6');

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Stage title is required');
      return;
    }
    const maxOrder = Math.max(...columns.map((c) => c.order), -1);
    createColumn(
      { title: title.trim(), order: maxOrder + 1, color },
      {
        onSuccess: (data: any) => {
          setTitle('');
          setColor('#14b8a6');
          onOpenChange(false);
          onSuccess?.(data?._id);
        },
      }
    );
  };

  const handleClose = () => {
    setTitle('');
    setColor('#14b8a6');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Add New Stage</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="stageTitle">Stage Title</Label>
            <Input
              id="stageTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Technical Interview"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
          </div>
          <div>
            <Label>Stage Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-7 h-7 rounded-full transition-all ${color === presetColor ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white' : 'hover:scale-110'}`}
                  style={{ backgroundColor: presetColor }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Label className="text-sm text-muted-foreground">Custom:</Label>
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#14b8a6"
                className="w-28 h-9 font-mono text-sm"
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-9 h-9 rounded cursor-pointer border-0"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreate}>
              Create Stage
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

