
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, Users, Trophy, Ticket } from 'lucide-react';

interface TournamentEvent {
  id: string;
  title: string;
  date: Date;
  location: string;
  venue: string;
  game: string;
  prizePool: string;
  entryFee: string;
  maxParticipants: number;
  currentParticipants: number;
  status: 'open' | 'full' | 'upcoming' | 'live';
  description: string;
}

const tournamentEvents: TournamentEvent[] = [
  {
    id: '1',
    title: 'Cyber City Championship',
    date: new Date(2024, 11, 15), // December 15, 2024
    location: 'Los Angeles, CA',
    venue: 'GameStop Arena',
    game: 'Pac-Man Championship',
    prizePool: '$5,000',
    entryFee: '50 CCTR',
    maxParticipants: 64,
    currentParticipants: 45,
    status: 'open',
    description: 'The ultimate Pac-Man showdown in LA!'
  },
  {
    id: '2',
    title: 'Retro Gaming Finals',
    date: new Date(2024, 11, 22), // December 22, 2024
    location: 'New York, NY',
    venue: 'Madison Square Garden',
    game: 'Tetris Battle Royale',
    prizePool: '$10,000',
    entryFee: '75 CCTR',
    maxParticipants: 128,
    currentParticipants: 89,
    status: 'open',
    description: 'East Coast\'s biggest retro gaming tournament!'
  },
  {
    id: '3',
    title: 'Space Invaders Showdown',
    date: new Date(2024, 11, 28), // December 28, 2024
    location: 'Chicago, IL',
    venue: 'United Center',
    game: 'Space Invaders',
    prizePool: '$3,500',
    entryFee: '40 CCTR',
    maxParticipants: 32,
    currentParticipants: 32,
    status: 'full',
    description: 'Midwest arcade champions battle it out!'
  },
  {
    id: '4',
    title: 'Galaga Masters',
    date: new Date(2025, 0, 5), // January 5, 2025
    location: 'Austin, TX',
    venue: 'Austin Convention Center',
    game: 'Galaga',
    prizePool: '$7,500',
    entryFee: '60 CCTR',
    maxParticipants: 96,
    currentParticipants: 12,
    status: 'upcoming',
    description: 'South by Southwest gaming tournament!'
  },
  {
    id: '5',
    title: 'West Coast Arcade Finals',
    date: new Date(2025, 0, 12), // January 12, 2025
    location: 'San Francisco, CA',
    venue: 'Moscone Center',
    game: 'Multi-Game Tournament',
    prizePool: '$15,000',
    entryFee: '100 CCTR',
    maxParticipants: 256,
    currentParticipants: 178,
    status: 'open',
    description: 'The biggest tournament on the West Coast!'
  }
];

export const TournamentCalendar = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<TournamentEvent | null>(null);

  const getEventsForDate = (date: Date) => {
    return tournamentEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-neon-green text-black';
      case 'full': return 'bg-red-500 text-white';
      case 'upcoming': return 'bg-neon-purple text-white';
      case 'live': return 'bg-neon-cyan text-black animate-pulse';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleJoinTournament = (event: TournamentEvent) => {
    if (event.status === 'open') {
      toast({
        title: "Tournament Registration",
        description: `Registering for ${event.title}. Entry fee: ${event.entryFee}`,
      });
      
      setTimeout(() => {
        toast({
          title: "Registration Successful!",
          description: `You've been registered for ${event.title}. Check your email for details.`,
        });
      }, 2000);
    }
  };

  // Get dates that have events
  const eventDates = tournamentEvents.map(event => event.date);

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
          📅 LIVE TOURNAMENT CALENDAR
          <Badge className="bg-neon-pink text-white">NATIONWIDE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="holographic p-4">
            <h3 className="font-bold text-neon-purple mb-4 text-center">
              Tournament Schedule
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border border-neon-cyan/30 pointer-events-auto"
              modifiers={{
                eventDay: eventDates,
              }}
              modifiersStyles={{
                eventDay: { 
                  backgroundColor: 'hsl(var(--neon-cyan))', 
                  color: 'black',
                  fontWeight: 'bold' 
                },
              }}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Days with tournaments are highlighted in cyan
            </p>
          </Card>

          {/* Event Details */}
          <Card className="holographic p-4">
            <h3 className="font-bold text-neon-pink mb-4">
              {selectedDate ? `Events on ${selectedDate.toLocaleDateString()}` : 'Select a Date'}
            </h3>
            
            {selectedDate ? (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border border-neon-cyan/30 bg-black/50 hover:bg-neon-cyan/10 transition-all cursor-pointer ${
                        selectedEvent?.id === event.id ? 'ring-2 ring-neon-cyan' : ''
                      }`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-neon-cyan">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.game}</p>
                        </div>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span>{event.location} • {event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy size={16} />
                          <span className="text-neon-green">Prize Pool: {event.prizePool}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ticket size={16} />
                          <span className="text-neon-purple">Entry: {event.entryFee}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-400 mt-2 mb-3">
                        {event.description}
                      </p>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinTournament(event);
                        }}
                        disabled={event.status === 'full' || event.status === 'upcoming'}
                        className="cyber-button w-full text-xs"
                        size="sm"
                      >
                        {event.status === 'open' ? 'JOIN TOURNAMENT' :
                         event.status === 'full' ? 'TOURNAMENT FULL' :
                         event.status === 'upcoming' ? 'REGISTRATION SOON' : 'JOIN'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock size={48} className="mx-auto mb-4 text-neon-purple opacity-50" />
                    <p className="text-gray-400">No tournaments scheduled for this date</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Check other dates for upcoming events!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy size={48} className="mx-auto mb-4 text-neon-cyan opacity-50" />
                <p className="text-gray-400">Select a date to view tournaments</p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="holographic p-4 text-center">
            <div className="text-2xl font-bold text-neon-green">{tournamentEvents.length}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </Card>
          <Card className="holographic p-4 text-center">
            <div className="text-2xl font-bold text-neon-purple">
              {tournamentEvents.filter(e => e.status === 'open').length}
            </div>
            <div className="text-sm text-muted-foreground">Open for Registration</div>
          </Card>
          <Card className="holographic p-4 text-center">
            <div className="text-2xl font-bold text-neon-cyan">
              {tournamentEvents.reduce((acc, e) => acc + e.currentParticipants, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Participants</div>
          </Card>
          <Card className="holographic p-4 text-center">
            <div className="text-2xl font-bold text-neon-pink">$41K</div>
            <div className="text-sm text-muted-foreground">Total Prize Pool</div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
