import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: 'student' | 'alumni' | 'admin';
  graduation_year?: number;
}

const years = Array.from({ length: 40 }, (_, i) => 1990 + i);

const UserDirectory = () => {
  const [search, setSearch] = useState('');
  // const [degree, setDegree] = useState('');
  const [year, setYear] = useState('');
  const [role, setRole] = useState<'student' | 'alumni'>('student');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filtered, setFiltered] = useState<UserProfile[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url, role, graduation_year');
    if (data) setUsers(data);
  };

  useEffect(() => {
    let result = users.filter(u =>
      (u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(search.toLowerCase()) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()))
    );
  if (role) result = result.filter(u => u.role === role);
  if (year) result = result.filter(u => u.graduation_year?.toString() === year);
    setFiltered(result);
  }, [search, year, role, users]);

  return (
    <DashboardLayout userRole={role}>
      <div className="max-w-4xl mx-auto py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <Input
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64"
              />
              <Select value={role} onValueChange={v => setRole(v as 'student' | 'alumni')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="alumni">Alumni</SelectItem>
                </SelectContent>
              </Select>
              {/* Degree filter removed: not present in schema */}
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Years</SelectItem>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map(user => (
                <Card key={user.id} className="flex items-center gap-4 p-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.first_name?.[0]}{user.last_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-lg">{user.first_name} {user.last_name}</div>
                    <div className="text-sm text-muted-foreground capitalize">{user.role}</div>
                    {/* Degree removed: not present in schema */}
                    {user.graduation_year && <div className="text-xs">Class of {user.graduation_year}</div>}
                  </div>
                </Card>
              ))}
              {filtered.length === 0 && <div className="text-muted-foreground">No users found.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDirectory;
