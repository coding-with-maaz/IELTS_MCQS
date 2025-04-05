import { useState } from 'react';
// import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Users,
  Search,
  MoreHorizontal,
  Shield,
  Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { useGetAllUsersQuery, useUpdateUserMutation } from '@/store/api/userApi';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: users = [], isLoading } = useGetAllUsersQuery();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  
  // Filter users based on the current filter
  const filteredUsersList = users
    .filter(user => {
      if (roleFilter === 'all') return true;
      return user.role === roleFilter;
    })
    .filter(user => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query)
      );
    });

  const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      await updateUser({ 
        userId, 
        userData: { role: newRole } 
      }).unwrap();
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage and monitor all users on the platform.
          </p>
        </div>
        <Button>
          <User className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <Button 
                variant={roleFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setRoleFilter('all')}
              >
                All Users
              </Button>
              <Button 
                variant={roleFilter === 'admin' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setRoleFilter('admin')}
              >
                Admins
              </Button>
              <Button 
                variant={roleFilter === 'user' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setRoleFilter('user')}
              >
                Regular Users
              </Button>
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsersList.map((user) => (
          <Card key={user._id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium">{user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium flex items-center gap-1">
                    {user.role === 'admin' ? (
                      <>
                        <Shield className="h-3 w-3 text-amber-500" />
                        <span className="capitalize">Administrator</span>
                      </>
                    ) : (
                      <>
                        <Users className="h-3 w-3 text-blue-500" />
                        <span className="capitalize">Student</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-medium">{format(parseISO(user.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Tests</span>
                  <span className="font-medium">{user.submissions?.length || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Avg. Score</span>
                  <span className="font-medium">
                    {user.averageScore ? user.averageScore.toFixed(1) : '-'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm" className="w-full">
                  View Profile
                </Button>
                {user.role !== 'admin' && (
                  <Dialog open={selectedUser === user._id} onOpenChange={(open) => !open && setSelectedUser(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedUser(user._id)}
                      >
                        Make Admin
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Role Update</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to make {user.name} an administrator? This will give them full access to the platform.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedUser(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleRoleUpdate(user._id, 'admin')}
                          disabled={isUpdatingUser}
                        >
                          {isUpdatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Confirm
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
