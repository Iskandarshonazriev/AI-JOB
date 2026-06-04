import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/Hooks'
import {
  fetchDirectory,
  fetchMyConnections,
  fetchPendingRequests,
  sendConnectionRequest,
  respondToConnection,
  withdrawConnectionRequest,
} from '../../../api/connectionapi'
import type { DirectoryUser, PendingRequest } from '../../../store/connectiontype'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../../../components/ui/avatar'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent } from '../../../components/ui/card'
import { Skeleton } from '../../../components/ui/skeleton'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { Search, UserPlus, MessageCircle, Clock, Users, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function getInitials(fullName?: string) {
  if (!fullName) return '?'
  return fullName
    .split(' ')
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function UserAvatar({ fullName, profilePicture }: { fullName?: string; profilePicture?: string }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      <Avatar className="h-14 w-14 shrink-0 relative border-2 border-white dark:border-gray-950 shadow-sm">
        {profilePicture && <AvatarImage src={profilePicture} alt={fullName} />}
        <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-600 font-bold text-sm">
          {getInitials(fullName)}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}

function ConnectionButton({
  user,
  actionLoadingIds,
  onConnect,
  onWithdraw,
}: {
  user: DirectoryUser
  actionLoadingIds: number[]
  onConnect: (id: number) => void
  onWithdraw: (connectionId: number) => void
}) {
  const navigate = useNavigate()
  const isLoading =
    actionLoadingIds.includes(user.id) ||
    (user.connectionId != null ? actionLoadingIds.includes(user.connectionId) : false)

  if (user.connectionStatus === 'connected') {
    return (
      <Button 
        size="sm" 
        variant="ghost" 
        className="w-full gap-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium shadow-sm active:scale-[0.98] transition-all"
        onClick={() => navigate('/messages')}
      >
        <MessageCircle className="h-4 w-4 text-blue-500" />
        Message
      </Button>
    )
  }

  if (user.connectionStatus === 'pending_sent') {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="w-full gap-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50 font-medium active:scale-[0.98] transition-all"
        disabled={isLoading}
        onClick={() => user.connectionId != null && onWithdraw(user.connectionId)}
      >
        <Clock className="h-4 w-4 animate-pulse" />
        {isLoading ? 'Withdrawing...' : 'Pending'}
      </Button>
    )
  }

  if (user.connectionStatus === 'pending_received') {
    return (
      <Button size="sm" variant="outline" className="w-full rounded-xl bg-gray-50 text-gray-500 italic border-dashed" disabled>
        Wants to connect
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      className="w-full gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all"
      disabled={isLoading}
      onClick={() => onConnect(user.id)}
    >
      <UserPlus className="h-4 w-4" />
      {isLoading ? 'Sending...' : 'Connect'}
    </Button>
  )
}

function PersonCard({
  user,
  actionLoadingIds,
  onConnect,
  onWithdraw,
}: {
  user: DirectoryUser
  actionLoadingIds: number[]
  onConnect: (id: number) => void
  onWithdraw: (connectionId: number) => void
}) {
  return (
    <Card className="group relative border border-gray-100 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-r from-slate-50 to-gray-100/80 border-b border-gray-100/50" />
      <CardContent className="p-5 pt-7 flex flex-col items-center text-center gap-4 relative z-10">
        <UserAvatar fullName={user.fullName} profilePicture={user.profilePicture} />

        <div className="w-full space-y-1">
          <p className="font-semibold text-base text-gray-900 tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
            {user.fullName}
          </p>
          <p className="text-xs font-medium text-gray-400">@{user.username}</p>
          <div className="pt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 max-w-full line-clamp-1">
              {user.role || 'Member'}
            </span>
          </div>
        </div>

        <div className="w-full pt-2 mt-auto">
          <ConnectionButton
            user={user}
            actionLoadingIds={actionLoadingIds}
            onConnect={onConnect}
            onWithdraw={onWithdraw}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="rounded-2xl border-gray-100">
          <CardContent className="p-5 pt-8 flex flex-col items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2 w-full flex flex-col items-center">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-5 w-24 rounded-full mt-1" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PersonGrid({
  users,
  actionLoadingIds,
  onConnect,
  onWithdraw,
  emptyMessage,
}: {
  users: DirectoryUser[]
  actionLoadingIds: number[]
  onConnect: (id: number) => void
  onWithdraw: (connectionId: number) => void
  emptyMessage: string
}) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 mb-3">
          <Users className="h-7 w-7" />
        </div>
        <p className="text-base font-medium text-gray-900">{emptyMessage}</p>
        <p className="text-sm text-gray-400 max-w-xs mt-1">Try adjusting your search keywords or check back later.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {users.map(user => (
        <PersonCard
          key={user.id}
          user={user}
          actionLoadingIds={actionLoadingIds}
          onConnect={onConnect}
          onWithdraw={onWithdraw}
        />
      ))}
    </div>
  )
}

function PendingRow({
  request,
  type,
  actionLoadingIds,
  onAccept,
  onIgnore,
  onWithdraw,
}: {
  request: PendingRequest
  type: 'incoming' | 'sent'
  actionLoadingIds: number[]
  onAccept: (id: number) => void
  onIgnore: (id: number) => void
  onWithdraw: (id: number) => void
}) {
  const isLoading = actionLoadingIds.includes(request.id)
  const person = type === 'incoming' ? request.sender : request.receiver

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white hover:bg-slate-50/50 rounded-2xl border border-gray-100 transition-all">
      <div className="flex items-center gap-4 min-w-0">
        <UserAvatar fullName={person.fullName} profilePicture={person.profilePicture} />
        <div className="min-w-0 space-y-0.5">
          <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{person.fullName}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
            <span className="font-medium text-gray-400">@{person.username}</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600 truncate">{person.role || 'Member'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 shrink-0 sm:pl-0 pl-18">
        {type === 'incoming' ? (
          <>
            <Button 
              size="sm" 
              variant="ghost" 
              className="rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium px-3.5"
              disabled={isLoading} 
              onClick={() => onIgnore(request.id)}
            >
              Ignore
            </Button>
            <Button 
              size="sm" 
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 shadow-sm shadow-blue-600/10"
              disabled={isLoading} 
              onClick={() => onAccept(request.id)}
            >
              {isLoading ? 'Accepting...' : 'Accept'}
            </Button>
          </>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-4"
            disabled={isLoading} 
            onClick={() => onWithdraw(request.id)}
          >
            {isLoading ? 'Withdrawing...' : 'Withdraw'}
          </Button>
        )}
      </div>
    </div>
  )
}

function PendingTab({
  incoming,
  sent,
  actionLoadingIds,
  onAccept,
  onIgnore,
  onWithdraw,
}: {
  incoming: PendingRequest[]
  sent: PendingRequest[]
  actionLoadingIds: number[]
  onAccept: (id: number) => void
  onIgnore: (id: number) => void
  onWithdraw: (id: number) => void
}) {
  if (incoming.length === 0 && sent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 mb-3">
          <Clock className="h-7 w-7" />
        </div>
        <p className="text-base font-medium text-gray-900">All caught up!</p>
        <p className="text-sm text-gray-400 max-w-xs mt-1">No pending incoming or outgoing connection requests right now.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {incoming.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Received Requests</p>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0">{incoming.length}</Badge>
          </div>
          <div className="grid gap-3">
            {incoming.map(req => (
              <PendingRow key={req.id} request={req} type="incoming"
                actionLoadingIds={actionLoadingIds}
                onAccept={onAccept} onIgnore={onIgnore} onWithdraw={onWithdraw} />
            ))}
          </div>
        </div>
      )}
      {sent.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Sent Requests</p>
          <div className="grid gap-3">
            {sent.map(req => (
              <PendingRow key={req.id} request={req} type="sent"
                actionLoadingIds={actionLoadingIds}
                onAccept={onAccept} onIgnore={onIgnore} onWithdraw={onWithdraw} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function NetworkPage() {
  const dispatch = useAppDispatch()
  const {
    directory = [],
    myConnections = [],
    pendingIncoming = [],
    pendingSent = [],
    directoryLoading,
    connectionsLoading,
    pendingLoading,
    actionLoadingIds = [],
    error,
  } = useAppSelector(state => state.connections)

  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchDirectory())
    dispatch(fetchMyConnections())
    dispatch(fetchPendingRequests())
  }, [dispatch])

  const handleConnect  = (userId: number)       => dispatch(sendConnectionRequest({ receiverId: userId }))
  const handleWithdraw = (connectionId: number)  => dispatch(withdrawConnectionRequest({ connectionId }))
  const handleAccept   = (connectionId: number)  => dispatch(respondToConnection({ connectionId, action: 'accept' }))
  const handleIgnore   = (connectionId: number)  => dispatch(respondToConnection({ connectionId, action: 'reject' }))

  const filterBySearch = (users: DirectoryUser[]) => {
    if (!users) return []
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(u =>
      u.fullName?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    )
  }

  const filterRequestsBySearch = (requests: PendingRequest[], type: 'incoming' | 'sent') => {
    if (!requests) return []
    if (!search.trim()) return requests
    const q = search.toLowerCase()
    return requests.filter(req => {
      const person = type === 'incoming' ? req.sender : req.receiver
      if (!person) return false
      return (
        person.fullName?.toLowerCase().includes(q) ||
        person.username?.toLowerCase().includes(q) ||
        person.role?.toLowerCase().includes(q)
      )
    })
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 antialiased selection:bg-blue-500/10">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">My Network</h1>
            <p className="text-sm text-slate-500 mt-1">Grow and manage your professional connections seamless.</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="rounded-2xl border-red-100 bg-red-50/50 text-red-900 backdrop-blur-sm">
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="directory" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <TabsList className="bg-transparent h-auto p-0 gap-1 flex-wrap sm:flex-nowrap">
              <TabsTrigger value="directory" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium text-sm text-slate-600">
                User Directory
              </TabsTrigger>
              <TabsTrigger value="myConnections" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium text-sm text-slate-600">
                My Connections
              </TabsTrigger>
              <TabsTrigger value="pending" className="rounded-xl px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-medium text-sm text-slate-600 gap-2">
                Pending
                {(pendingIncoming?.length ?? 0) > 0 && (
                  <Badge className="h-5 min-w-5 px-1 bg-blue-600 text-white rounded-full flex items-center justify-center border-none font-bold text-[10px]">
                    {pendingIncoming.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-10 h-11 bg-slate-50/50 border-gray-200/80 focus-visible:bg-white focus-visible:ring-slate-950 rounded-xl transition-all placeholder:text-slate-400 text-sm" 
                placeholder="Search by name, username or role..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
          </div>

          <TabsContent value="directory" className="mt-0 focus-visible:outline-none">
            {directoryLoading ? <GridSkeleton /> : (
              <PersonGrid users={filterBySearch(directory)} actionLoadingIds={actionLoadingIds}
                onConnect={handleConnect} onWithdraw={handleWithdraw} emptyMessage="No users found" />
            )}
          </TabsContent>

          <TabsContent value="myConnections" className="mt-0 focus-visible:outline-none">
            {connectionsLoading ? <GridSkeleton /> : (
              <PersonGrid users={filterBySearch(myConnections)} actionLoadingIds={actionLoadingIds}
                onConnect={handleConnect} onWithdraw={handleWithdraw} emptyMessage="No connections yet" />
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
            {pendingLoading ? (
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40 rounded-md" />
                      <Skeleton className="h-3 w-60 rounded-md" />
                    </div>
                    <Skeleton className="h-9 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <PendingTab 
                incoming={filterRequestsBySearch(pendingIncoming, 'incoming')} 
                sent={filterRequestsBySearch(pendingSent, 'sent')}
                actionLoadingIds={actionLoadingIds}
                onAccept={handleAccept} onIgnore={handleIgnore} onWithdraw={handleWithdraw} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}