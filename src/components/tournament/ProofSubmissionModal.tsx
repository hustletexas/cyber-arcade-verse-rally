import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Upload, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProofSubmissionModalProps {
  matchId: string;
  tournamentId: string;
  sessionToken: string;
  onClose: () => void;
  onSuccess: () => void;
}

type VerificationStatus = 'idle' | 'uploading' | 'verifying' | 'verified' | 'needs_review' | 'rejected';

export const ProofSubmissionModal: React.FC<ProofSubmissionModalProps> = ({
  matchId,
  tournamentId,
  sessionToken,
  onClose,
  onSuccess,
}) => {
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [matchCode, setMatchCode] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [confidence, setConfidence] = useState<number>(0);
  const [reasons, setReasons] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB.');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Only PNG, JPG, or WebP images allowed.');
      return;
    }
    setScreenshotFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleSubmit = async () => {
    if (!screenshotFile) {
      toast.error('Please upload a screenshot');
      return;
    }

    try {
      setStatus('uploading');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in first');
        setStatus('idle');
        return;
      }

      // Upload screenshot to storage
      const filePath = `${user.id}/${matchId}-${Date.now()}.${screenshotFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('match-proofs')
        .upload(filePath, screenshotFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload screenshot');
        setStatus('idle');
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('match-proofs')
        .getPublicUrl(filePath);

      setStatus('verifying');

      // Call verify-proof edge function
      const { data, error } = await supabase.functions.invoke('verify-proof', {
        body: {
          match_id: matchId,
          tournament_id: tournamentId,
          screenshot_url: urlData.publicUrl,
          match_code: matchCode || undefined,
          session_token: sessionToken,
        },
      });

      if (error) {
        console.error('Verification error:', error);
        toast.error('Verification failed. Please try again.');
        setStatus('idle');
        return;
      }

      setConfidence(data.confidence || 0);
      setReasons(data.reasons || []);

      if (data.verification_status === 'verified') {
        setStatus('verified');
        toast.success('Proof verified! Your match result is confirmed.');
        setTimeout(() => onSuccess(), 2000);
      } else if (data.verification_status === 'needs_review') {
        setStatus('needs_review');
        toast.warning('Proof flagged for manual review. An admin will check it.');
      } else {
        setStatus('rejected');
        toast.error('Proof rejected. Please submit a valid screenshot.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Something went wrong');
      setStatus('idle');
    }
  };

  const statusConfig = {
    idle: { icon: Upload, color: 'text-muted-foreground', label: 'Ready to submit' },
    uploading: { icon: Loader2, color: 'text-neon-cyan', label: 'Uploading...' },
    verifying: { icon: Shield, color: 'text-neon-cyan', label: 'AI Referee analyzing...' },
    verified: { icon: CheckCircle, color: 'text-neon-green', label: 'Verified ✓' },
    needs_review: { icon: AlertTriangle, color: 'text-yellow-400', label: 'Flagged for review' },
    rejected: { icon: XCircle, color: 'text-destructive', label: 'Rejected' },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;
  const isProcessing = status === 'uploading' || status === 'verifying';

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-neon-cyan">
            <Shield className="w-5 h-5" />
            Submit Match Proof
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Token Display */}
          <div className="p-3 bg-neon-cyan/10 rounded-lg border border-neon-cyan/20">
            <p className="text-xs text-muted-foreground mb-1">Session Token (must appear in screenshot)</p>
            <p className="font-mono text-sm text-neon-cyan font-bold tracking-wider">{sessionToken}</p>
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-2">
            <Label>Screenshot *</Label>
            <div className="relative">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="proof-upload"
                disabled={isProcessing}
              />
              <label
                htmlFor="proof-upload"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors",
                  previewUrl ? "border-neon-green/40" : "border-border hover:border-neon-cyan/40"
                )}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-full object-contain rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload (PNG, JPG, WebP, max 5MB)</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Match Code */}
          <div className="space-y-2">
            <Label htmlFor="match-code">Match Code (optional)</Label>
            <Input
              id="match-code"
              value={matchCode}
              onChange={e => setMatchCode(e.target.value.slice(0, 50))}
              placeholder="Enter in-game match ID"
              disabled={isProcessing}
            />
          </div>

          {/* Status Display */}
          <div className={cn("flex items-center gap-2 p-3 rounded-lg border", 
            status === 'verified' ? 'bg-neon-green/10 border-neon-green/20' :
            status === 'rejected' ? 'bg-destructive/10 border-destructive/20' :
            status === 'needs_review' ? 'bg-yellow-400/10 border-yellow-400/20' :
            'bg-background/50 border-border'
          )}>
            <StatusIcon className={cn("w-5 h-5", currentStatus.color, isProcessing && "animate-spin")} />
            <span className={cn("text-sm font-medium", currentStatus.color)}>{currentStatus.label}</span>
            {confidence > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">{confidence}% confidence</span>
            )}
          </div>

          {/* Reasons */}
          {reasons.length > 0 && (
            <div className="space-y-1">
              {reasons.map((reason, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {reason}</p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!screenshotFile || isProcessing || status === 'verified'}
              className="bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/30"
            >
              {isProcessing ? 'Processing...' : 'Submit Proof'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
