
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const SocialMediaHub = () => {
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  const platforms = [
    {
      id: 'twitch',
      name: 'Twitch',
      icon: '📺',
      color: 'from-purple-600 to-purple-800',
      description: 'Stream your gaming sessions live',
      followers: '2.3K'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📹',
      color: 'from-red-600 to-red-800',
      description: 'Upload highlight clips and tutorials',
      subscribers: '1.8K'
    },
    {
      id: 'kick',
      name: 'Kick',
      icon: '🎮',
      color: 'from-green-600 to-green-800',
      description: 'Alternative streaming platform',
      followers: '950'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: '🐦',
      color: 'from-blue-600 to-blue-800',
      description: 'Share updates and tournament results',
      followers: '5.2K'
    }
  ];

  const clips = [
    {
      id: 'epic-combo',
      title: 'EPIC 50-HIT COMBO',
      platform: 'twitch',
      views: '12.5K',
      likes: '847',
      duration: '0:45',
      thumbnail: '🔥'
    },
    {
      id: 'tournament-win',
      title: 'Tournament Victory Moment',
      platform: 'youtube',
      views: '8.9K',
      likes: '623',
      duration: '2:15',
      thumbnail: '🏆'
    },
    {
      id: 'speedrun-record',
      title: 'New Speedrun World Record',
      platform: 'kick',
      views: '15.2K',
      likes: '1.2K',
      duration: '12:30',
      thumbnail: '⚡'
    }
  ];

  const socialPosts = [
    {
      id: 'tournament-announcement',
      content: 'Just won the Neon Nights tournament! 🏆 The competition was intense but the $CCTR rewards were worth it! #CyberCityArcade',
      platform: 'twitter',
      timestamp: '2 hours ago',
      likes: 245,
      retweets: 89
    },
    {
      id: 'new-record',
      content: 'NEW PERSONAL BEST! Just hit level 50 in record time ⚡ The grind never stops in Cyber City! Who wants to challenge me?',
      platform: 'twitter',
      timestamp: '6 hours ago',
      likes: 178,
      retweets: 43
    }
  ];

  const connectPlatform = (platformId: string) => {
    if (!connectedPlatforms.includes(platformId)) {
      setConnectedPlatforms([...connectedPlatforms, platformId]);
      console.log(`Connected to ${platformId}`);
    }
  };

  const disconnectPlatform = (platformId: string) => {
    setConnectedPlatforms(connectedPlatforms.filter(id => id !== platformId));
    console.log(`Disconnected from ${platformId}`);
  };

  return (
    <div className="space-y-6">
      {/* Social Hub Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-pink flex items-center gap-3">
            📱 SOCIAL MEDIA HUB
            <Badge className="bg-neon-cyan text-black animate-neon-flicker">CONNECTED</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Connect your streaming platforms and share your gaming achievements
          </p>
        </CardHeader>
      </Card>

      {/* Platform Connections */}
      <Card className="vending-machine">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">🔗 PLATFORM CONNECTIONS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((platform) => (
              <Card key={platform.id} className={`holographic hover:scale-105 transition-transform ${connectedPlatforms.includes(platform.id) ? 'border-neon-green border-2' : ''}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{platform.icon}</div>
                  <h3 className="font-bold text-neon-purple mb-1">{platform.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{platform.description}</p>
                  
                  {connectedPlatforms.includes(platform.id) ? (
                    <div className="space-y-2">
                      <Badge className="bg-neon-green text-black w-full">
                        ✅ CONNECTED
                      </Badge>
                      <p className="text-sm text-neon-cyan">{platform.followers} followers</p>
                      <Button
                        onClick={() => disconnectPlatform(platform.id)}
                        variant="outline"
                        size="sm"
                        className="w-full border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black text-xs"
                      >
                        DISCONNECT
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => connectPlatform(platform.id)}
                      className="cyber-button w-full text-xs"
                    >
                      CONNECT
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="clips" className="w-full">
        <TabsList className="grid w-full grid-cols-3 arcade-frame p-2">
          <TabsTrigger value="clips" className="cyber-button">🎬 CLIPS</TabsTrigger>
          <TabsTrigger value="posts" className="cyber-button">📝 POSTS</TabsTrigger>
          <TabsTrigger value="analytics" className="cyber-button">📊 ANALYTICS</TabsTrigger>
        </TabsList>

        <TabsContent value="clips" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.map((clip) => (
              <Card key={clip.id} className="arcade-frame hover:scale-105 transition-transform">
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{clip.thumbnail}</div>
                    <h3 className="font-bold text-neon-cyan text-sm mb-1">{clip.title}</h3>
                    <div className="flex justify-center gap-2 mb-2">
                      <Badge className="bg-neon-purple text-black text-xs">
                        {clip.platform.toUpperCase()}
                      </Badge>
                      <Badge className="bg-neon-green text-black text-xs">
                        {clip.duration}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Views:</span>
                      <span className="text-neon-cyan font-bold">{clip.views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Likes:</span>
                      <span className="text-neon-pink font-bold">{clip.likes}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="cyber-button flex-1 text-xs">
                      📺 WATCH
                    </Button>
                    <Button size="sm" variant="outline" className="border-neon-cyan text-neon-cyan text-xs">
                      📤 SHARE
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6 mt-6">
          <div className="space-y-4">
            {socialPosts.map((post) => (
              <Card key={post.id} className="holographic">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center">
                        🎮
                      </div>
                      <div>
                        <p className="font-bold text-neon-cyan">You</p>
                        <p className="text-sm text-muted-foreground">{post.timestamp}</p>
                      </div>
                    </div>
                    <Badge className="bg-neon-purple text-black">
                      {post.platform.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-foreground mb-4">{post.content}</p>
                  
                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-neon-pink">❤️</span>
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-neon-green">🔄</span>
                      <span>{post.retweets}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="arcade-frame">
            <CardContent className="p-6 text-center">
              <h3 className="font-display text-lg text-neon-purple mb-4">📝 CREATE NEW POST</h3>
              <Button className="cyber-button">
                ✨ COMPOSE POST
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="holographic p-6 text-center">
              <h3 className="font-display text-lg text-neon-cyan mb-2">TOTAL FOLLOWERS</h3>
              <div className="text-3xl font-black text-neon-green">10.2K</div>
              <p className="text-sm text-muted-foreground">Across all platforms</p>
            </Card>

            <Card className="holographic p-6 text-center">
              <h3 className="font-display text-lg text-neon-pink mb-2">MONTHLY VIEWS</h3>
              <div className="text-3xl font-black text-neon-purple">247K</div>
              <p className="text-sm text-muted-foreground">Content views</p>
            </Card>

            <Card className="holographic p-6 text-center">
              <h3 className="font-display text-lg text-neon-purple mb-2">ENGAGEMENT</h3>
              <div className="text-3xl font-black text-neon-cyan">8.4%</div>
              <p className="text-sm text-muted-foreground">Average rate</p>
            </Card>
          </div>

          <Card className="vending-machine">
            <CardHeader>
              <CardTitle className="font-display text-xl text-neon-green">📈 GROWTH INSIGHTS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Twitch Growth:</span>
                  <Badge className="bg-neon-green text-black">+15.2% this month</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>YouTube Growth:</span>
                  <Badge className="bg-neon-cyan text-black">+8.7% this month</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Best Content Type:</span>
                  <Badge className="bg-neon-pink text-black">Tournament Highlights</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Peak Viewing Time:</span>
                  <Badge className="bg-neon-purple text-black">8-10 PM EST</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
