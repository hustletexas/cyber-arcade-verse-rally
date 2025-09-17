import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useUserBalance } from '@/hooks/useUserBalance';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  price_cctr: number;
  audio_url?: string;
  cover_art_url?: string;
  genre?: string;
  is_free: boolean;
  is_purchasable: boolean;
  play_count: number;
}

export interface UserSongPurchase {
  id: string;
  user_id: string;
  song_id: string;
  purchase_price: number;
  purchased_at: string;
}

export const useSongPurchase = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [ownedSongs, setOwnedSongs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch: refetchBalance } = useUserBalance();

  // Fetch all available songs
  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('is_purchasable', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSongs(data || []);
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast({
        title: "Error",
        description: "Failed to load songs",
        variant: "destructive",
      });
    }
  };

  // Fetch user's owned songs
  const fetchOwnedSongs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_song_purchases')
        .select('song_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setOwnedSongs(data?.map(purchase => purchase.song_id) || []);
    } catch (error) {
      console.error('Error fetching owned songs:', error);
    }
  };

  // Purchase a song
  const purchaseSong = async (songId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase songs",
        variant: "destructive",
      });
      return false;
    }

    if (ownedSongs.includes(songId)) {
      toast({
        title: "Already Owned",
        description: "You already own this song",
        variant: "destructive",
      });
      return false;
    }

    setPurchasing(songId);

    try {
      const { data, error } = await supabase.rpc('purchase_song', {
        song_id_param: songId,
        user_id_param: user.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; song_title?: string; cost?: number };

      if (result.success) {
        toast({
          title: "Purchase Successful!",
          description: `You now own "${result.song_title}" ${result.cost === 0 ? '(Free)' : `for ${result.cost} CCTR`}`,
        });
        
        // Refresh owned songs and balance
        await fetchOwnedSongs();
        await refetchBalance();
        return true;
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error purchasing song:', error);
      toast({
        title: "Purchase Failed",
        description: "An error occurred while purchasing the song",
        variant: "destructive",
      });
      return false;
    } finally {
      setPurchasing(null);
    }
  };

  // Check if user owns a song
  const ownsSong = (songId: string): boolean => {
    return ownedSongs.includes(songId);
  };

  // Get user's purchased songs with full details
  const getOwnedSongsWithDetails = (): Song[] => {
    return songs.filter(song => ownedSongs.includes(song.id));
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchSongs();
      if (user) {
        await fetchOwnedSongs();
      }
      setLoading(false);
    };

    loadData();
  }, [user]);

  return {
    songs,
    ownedSongs,
    loading,
    purchasing,
    purchaseSong,
    ownsSong,
    getOwnedSongsWithDetails,
    refetch: fetchSongs
  };
};