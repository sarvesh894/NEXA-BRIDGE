import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  UserPlus,
  Check,
  X,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  RotateCcw,
  Phone,
  Linkedin,
  Calendar
} from 'lucide-react';

import { Separator } from '@/components/ui/separator';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { toast } from 'sonner';

import ConnectionRequests from '@/components/ConnectionRequests';

import VerifiedBadge from '@/components/VerifiedBadge';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export default function Directory() {
  const { user } = useAuth();

  const [search, setSearch] = useState('');

  const [expandedBio, setExpandedBio] = useState(null);

  const [selectedProfile, setSelectedProfile] = useState(null);

  const [filterDept, setFilterDept] = useState('all');

  const [filterYear, setFilterYear] = useState('all');

  const [filterRole, setFilterRole] = useState('all');

  const [filterConnection, setFilterConnection] = useState('all');

  const [sortBy, setSortBy] = useState('name');

  const [showFilters, setShowFilters] = useState(false);

  const queryClient = useQueryClient();

  const isOnline = (lastSeen) => {
    if (!lastSeen) return false;

    return (
      Date.now() -
        new Date(lastSeen).getTime() <
      5 * 60 * 1000
    );
  };

  const {
    data: profiles = [],
    isLoading
  } = useQuery({
    queryKey: ['profiles'],

    queryFn: async () => {
      const { data } =
        await supabase
          .from('profiles')
          .select('*')
          .neq(
            'user_id',
            user?.id ?? ''
          );

      return data ?? [];
    },

    enabled: !!user
  });

  const {
    data: connections = []
  } = useQuery({
    queryKey: [
      'connections',
      user?.id
    ],

    queryFn: async () => {
      const { data } =
        await supabase
          .from('connections')
          .select('*')
          .or(
            `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
          );

      return data ?? [];
    },

    enabled: !!user
  });

  const {
    data: roles = []
  } = useQuery({
    queryKey: ['all-roles'],

    queryFn: async () => {
      const { data } =
        await supabase
          .from('user_roles')
          .select('*');

      return data ?? [];
    }
  });

  const sendConnection =
    useMutation({
      mutationFn:
        async (
          receiverId
        ) => {
          const { error } =
            await supabase
              .from(
                'connections'
              )
              .insert({
                sender_id:
                  user.id,

                receiver_id:
                  receiverId
              });

          if (error)
            throw error;
        },

      onSuccess: () => {
        queryClient.invalidateQueries(
          {
            queryKey: [
              'connections'
            ]
          }
        );

        toast.success(
          'Connection request sent!'
        );
      },

      onError: (err) =>
        toast.error(
          err.message
        )
    });

  const getConnectionStatus = (
    profileUserId
  ) => {
    const conn =
      connections.find(
        (c) =>
          (c.sender_id ===
            user?.id &&
            c.receiver_id ===
              profileUserId) ||
          (c.receiver_id ===
            user?.id &&
            c.sender_id ===
              profileUserId)
      );

    return (
      conn?.status ?? null
    );
  };

  const getRoleForUser = (
    userId
  ) => {
    return (
      roles.find(
        (r) =>
          r.user_id ===
          userId
      )?.role ?? null
    );
  };

  const dbDepts = profiles
    .map(
      (p) => p.department
    )
    .filter(Boolean);

  const departments = [
    ...new Set(dbDepts)
  ].sort();

  const years =
    Array.from(
      {
        length:
          new Date().getFullYear() -
          2000 +
          1
      },

      (_, i) =>
        new Date().getFullYear() -
        i
    );

  const allRoles = [
    'student',
    'alumni',
    'admin'
  ];

  const filtered = profiles
    .filter((p) => {
      const matchSearch =
        search === '' ||
        p.full_name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        (p.company
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ??
          false);

      const matchDept =
        filterDept ===
          'all' ||
        p.department ===
          filterDept;

      const matchYear =
        filterYear ===
          'all' ||
        p.graduation_year?.toString() ===
          filterYear;

      const matchRole =
        filterRole ===
          'all' ||
        getRoleForUser(
          p.user_id
        ) === filterRole;

      return (
        matchSearch &&
        matchDept &&
        matchYear &&
        matchRole
      );
    })

    .sort((a, b) => {
      if (
        sortBy === 'name'
      ) {
        return a.full_name.localeCompare(
          b.full_name
        );
      }

      if (
        sortBy ===
        'year_desc'
      ) {
        return (
          (b.graduation_year ??
            0) -
          (a.graduation_year ??
            0)
        );
      }

      return 0;
    });

  const renderConnectionButton =
    (
      p,
      size = 'default'
    ) => {
      const status =
        getConnectionStatus(
          p.user_id
        );

      if (
        status ===
        'accepted'
      ) {
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <Check className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      }

      if (
        status === 'pending'
      ) {
        return (
          <Badge variant="secondary">
            Pending
          </Badge>
        );
      }

      return (
        <Button
          size={size}
          onClick={() =>
            sendConnection.mutate(
              p.user_id
            )
          }
          disabled={
            sendConnection.isPending
          }
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          Connect
        </Button>
      );
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Alumni Directory
        </h1>

        <p className="text-muted-foreground">
          Find and connect
          with alumni and
          students
        </p>
      </div>

      <Tabs
        defaultValue="directory"
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="directory">
            <Users className="h-4 w-4 mr-1" />
            Directory
          </TabsTrigger>

          <TabsTrigger value="requests">
            <UserPlus className="h-4 w-4 mr-1" />
            Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  className="pl-9"
                />
              </div>

              <Button
                variant={
                  showFilters
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() =>
                  setShowFilters(
                    !showFilters
                  )
                }
              >
                <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                Filters
              </Button>
            </div>

            {filtered.map((p) => {
              const role =
                getRoleForUser(
                  p.user_id
                );

              const initials =
                p.full_name
                  .split(' ')
                  .map(
                    (n) => n[0]
                  )
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

              return (
                <Card
                  key={p.id}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Avatar className="h-20 w-20">
                        {p.avatar_url ? (
                          <AvatarImage
                            src={
                              p.avatar_url
                            }
                            alt={
                              p.full_name
                            }
                          />
                        ) : null}

                        <AvatarFallback>
                          {
                            initials
                          }
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg">
                            {
                              p.full_name
                            }
                          </h3>

                          <VerifiedBadge
                            role={
                              role
                            }
                            studentBadge={
                              p.student_badge
                            }
                          />
                        </div>

                        {p.position && (
                          <p className="text-sm text-muted-foreground">
                            {
                              p.position
                            }
                          </p>
                        )}

                        {p.company && (
                          <p className="text-sm text-muted-foreground">
                            {
                              p.company
                            }
                          </p>
                        )}

                        {p.department && (
                          <p className="text-sm text-muted-foreground">
                            {
                              p.department
                            }
                          </p>
                        )}

                        {p.bio && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {
                              p.bio
                            }
                          </p>
                        )}

                        <div className="mt-3">
                          {renderConnectionButton(
                            p
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <ConnectionRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}
