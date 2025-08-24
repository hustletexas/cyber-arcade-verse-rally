
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceChatProps {
  onVoiceMessage: (audioBlob: Blob, duration: number) => void;
  isConnected: boolean;
}

export const VoiceChat: React.FC<VoiceChatProps> = ({ onVoiceMessage, isConnected }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onVoiceMessage(audioBlob, recordingDuration);
        setRecordingDuration(0);
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording Started 🎤",
        description: "Speak your message now",
      });

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice chat",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      toast({
        title: "Voice Message Sent! 🎵",
        description: `Recorded ${recordingDuration} seconds of audio`,
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "Unmuted 🔊" : "Muted 🔇",
      description: isMuted ? "You can now hear voice messages" : "Voice messages are muted",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center p-2 text-gray-500 text-sm">
        Connect to use voice chat
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 border-t border-neon-purple/30">
      {/* Recording Status */}
      {isRecording && (
        <Badge className="bg-red-500/20 text-red-400 border-red-500 animate-pulse">
          🔴 REC {formatDuration(recordingDuration)}
        </Badge>
      )}

      {/* Record Button */}
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        size="sm"
        className={`hover:scale-105 transition-all duration-200 ${
          isRecording 
            ? 'bg-red-500/80 hover:bg-red-600 border-red-400' 
            : 'bg-neon-green/80 hover:bg-neon-green border-neon-green'
        }`}
        style={{
          boxShadow: isRecording 
            ? '0 0 15px rgba(239, 68, 68, 0.4)' 
            : '0 0 15px rgba(0, 255, 204, 0.3)'
        }}
      >
        {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
        {isRecording ? 'STOP' : 'VOICE'}
      </Button>

      {/* Mute Button */}
      <Button
        onClick={toggleMute}
        size="sm"
        variant="outline"
        className={`hover:scale-105 transition-all duration-200 ${
          isMuted ? 'border-red-400 text-red-400' : 'border-neon-cyan text-neon-cyan'
        }`}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </Button>
    </div>
  );
};
