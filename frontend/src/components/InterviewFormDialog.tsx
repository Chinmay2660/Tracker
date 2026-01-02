import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import InterviewForm from './InterviewForm';
import { InterviewRound } from '../types';

interface InterviewFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview?: InterviewRound | null;
  defaultDate?: Date | null;
  defaultEndDate?: Date | null;
  onSuccess?: () => void;
}

export default function InterviewFormDialog({
  open,
  onOpenChange,
  interview,
  defaultDate,
  defaultEndDate,
  onSuccess,
}: InterviewFormDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        onClose={() => onOpenChange(false)} 
        className="max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{interview ? 'Edit Interview' : 'Add Interview'}</DialogTitle>
        </DialogHeader>
        <InterviewForm
          interview={interview || undefined}
          defaultDate={interview ? null : defaultDate}
          defaultEndDate={interview ? null : defaultEndDate}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}

