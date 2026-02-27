import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2 } from 'lucide-react';

interface QRScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const animFrameRef = useRef<number>(0);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          scanLoop();
        }
      } catch (err) {
        if (mounted) setError('Camera access denied. Please allow camera permissions.');
      }
    };

    const scanLoop = () => {
      if (!mounted || !scanning) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(scanLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Use BarcodeDetector if available
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        detector.detect(canvas).then((barcodes: any[]) => {
          if (barcodes.length > 0 && mounted) {
            const val = barcodes[0].rawValue;
            if (val) { setScanning(false); stopStream(); onScan(val); return; }
          }
          animFrameRef.current = requestAnimationFrame(scanLoop);
        }).catch(() => {
          animFrameRef.current = requestAnimationFrame(scanLoop);
        });
      } else {
        // Fallback: no BarcodeDetector, keep scanning frame-by-frame
        // For browsers without BarcodeDetector, show manual input suggestion
        animFrameRef.current = requestAnimationFrame(scanLoop);
      }
    };

    startCamera();
    return () => { mounted = false; stopStream(); };
  }, [scanning, stopStream, onScan]);

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative w-full aspect-square max-w-[280px] rounded-xl overflow-hidden border-2 border-neon-cyan/50 bg-black">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <Camera className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            {/* Scan overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-neon-cyan rounded-tl-md" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-neon-cyan rounded-tr-md" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-neon-cyan rounded-bl-md" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-neon-cyan rounded-br-md" />
              {/* Scanning line */}
              <div className="absolute left-4 right-4 h-0.5 bg-neon-cyan/80 animate-pulse" style={{ top: '50%' }} />
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <p className="text-xs text-muted-foreground text-center">
        Point your camera at a Stellar wallet QR code
      </p>
      <Button variant="ghost" size="sm" onClick={() => { stopStream(); onClose(); }} className="text-xs text-muted-foreground">
        <X size={14} className="mr-1" /> Cancel Scan
      </Button>
    </div>
  );
};
