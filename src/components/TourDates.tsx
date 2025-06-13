
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Calendar, Ticket, Clock, Users } from 'lucide-react';

interface TourEvent {
  id: string;
  city: string;
  venue: string;
  date: string;
  time: string;
  coordinates: [number, number];
  ticketsAvailable: number;
  adultPrice: number;
  kidPrice: number;
  status: 'available' | 'sold-out' | 'coming-soon';
}

const tourEvents: TourEvent[] = [
  {
    id: '1',
    city: 'Los Angeles',
    venue: 'Crypto.com Arena',
    date: '2024-07-15',
    time: '19:00',
    coordinates: [-118.2437, 34.0522],
    ticketsAvailable: 150,
    adultPrice: 19.99,
    kidPrice: 9.99,
    status: 'available'
  },
  {
    id: '2',
    city: 'New York',
    venue: 'Madison Square Garden',
    date: '2024-07-22',
    time: '20:00',
    coordinates: [-73.9352, 40.7505],
    ticketsAvailable: 0,
    adultPrice: 19.99,
    kidPrice: 9.99,
    status: 'sold-out'
  },
  {
    id: '3',
    city: 'Miami',
    venue: 'FTX Arena',
    date: '2024-07-29',
    time: '19:30',
    coordinates: [-80.1918, 25.7617],
    ticketsAvailable: 200,
    adultPrice: 19.99,
    kidPrice: 9.99,
    status: 'available'
  },
  {
    id: '4',
    city: 'San Francisco',
    venue: 'Chase Center',
    date: '2024-08-05',
    time: '18:00',
    coordinates: [-122.3874, 37.7679],
    ticketsAvailable: 0,
    adultPrice: 19.99,
    kidPrice: 9.99,
    status: 'coming-soon'
  }
];

export const TourDates = () => {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<TourEvent | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [adultTickets, setAdultTickets] = useState(1);
  const [kidTickets, setKidTickets] = useState(0);

  const handleBuyTickets = (event: TourEvent) => {
    if (event.status === 'available') {
      setSelectedEvent(event);
      setShowTicketModal(true);
    }
  };

  const handlePurchase = () => {
    if (!selectedEvent) return;
    
    const total = (adultTickets * selectedEvent.adultPrice) + (kidTickets * selectedEvent.kidPrice);
    
    toast({
      title: "Ticket Purchase",
      description: `Processing ${adultTickets} adult + ${kidTickets} kid tickets for ${selectedEvent.city} - Total: $${total.toFixed(2)}`,
    });
    
    setTimeout(() => {
      toast({
        title: "Purchase Successful!",
        description: `Your tickets for ${selectedEvent.city} have been confirmed! Check your email for details.`,
      });
      setShowTicketModal(false);
      setAdultTickets(1);
      setKidTickets(0);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-neon-green text-black';
      case 'sold-out': return 'bg-red-500 text-white';
      case 'coming-soon': return 'bg-neon-purple text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <>
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-green flex items-center gap-3">
            🗺️ CYBER CITY ARCADE WORLD TOUR
            <Badge className="bg-neon-cyan text-black">2024</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive Map Placeholder */}
            <Card className="holographic p-6">
              <h3 className="font-bold text-neon-cyan mb-4 flex items-center gap-2">
                <MapPin size={24} />
                TOUR MAP
              </h3>
              <div className="w-full h-80 bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-neon-cyan text-center">
                    <MapPin size={48} className="mx-auto mb-2 animate-pulse" />
                    <p className="text-sm">Interactive Map</p>
                    <p className="text-xs text-muted-foreground">Click events below to view locations</p>
                  </div>
                </div>
                
                {tourEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className={`absolute w-3 h-3 bg-neon-pink rounded-full animate-pulse cursor-pointer`}
                    style={{
                      left: `${20 + index * 15}%`,
                      top: `${30 + index * 10}%`
                    }}
                    onClick={() => setSelectedEvent(event)}
                    title={event.city}
                  />
                ))}
              </div>
            </Card>

            {/* Tour Dates List */}
            <Card className="holographic p-6">
              <h3 className="font-bold text-neon-pink mb-4 flex items-center gap-2">
                <Calendar size={24} />
                UPCOMING SHOWS
              </h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {tourEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border border-neon-cyan/30 bg-black/50 hover:bg-neon-cyan/10 transition-all cursor-pointer ${
                      selectedEvent?.id === event.id ? 'ring-2 ring-neon-cyan' : ''
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-neon-cyan">{event.city}</h4>
                        <p className="text-sm text-muted-foreground">{event.venue}</p>
                      </div>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {event.time}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-neon-green font-bold">Adults: ${event.adultPrice}</span>
                        <span className="text-neon-pink font-bold ml-3">Kids: ${event.kidPrice}</span>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyTickets(event);
                        }}
                        disabled={event.status !== 'available'}
                        className="cyber-button text-xs"
                        size="sm"
                      >
                        <Ticket size={16} className="mr-1" />
                        {event.status === 'available' ? 'BUY TICKETS' : 
                         event.status === 'sold-out' ? 'SOLD OUT' : 'COMING SOON'}
                      </Button>
                    </div>
                    
                    {event.status === 'available' && (
                      <p className="text-xs text-neon-green mt-2">
                        {event.ticketsAvailable} tickets remaining
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Purchase Modal */}
      {showTicketModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="arcade-frame w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-neon-cyan">
                Buy Tickets - {selectedEvent.city}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users size={16} />
                    Adult Tickets ($19.99)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setAdultTickets(Math.max(0, adultTickets - 1))}
                      className="w-8 h-8 p-0"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{adultTickets}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setAdultTickets(adultTickets + 1)}
                      className="w-8 h-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    👶 Kid Tickets ($9.99)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setKidTickets(Math.max(0, kidTickets - 1))}
                      className="w-8 h-8 p-0"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{kidTickets}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setKidTickets(kidTickets + 1)}
                      className="w-8 h-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-neon-cyan/30 pt-3">
                <div className="flex justify-between text-lg font-bold text-neon-green">
                  <span>Total:</span>
                  <span>${((adultTickets * selectedEvent.adultPrice) + (kidTickets * selectedEvent.kidPrice)).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowTicketModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchase}
                  className="cyber-button flex-1"
                  disabled={adultTickets + kidTickets === 0}
                >
                  Purchase
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
