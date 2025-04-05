import { Link, useLocation } from 'react-router-dom';
import { 
  Headphones, 
  FileText, 
  Users, 
  Settings, 
  BarChart, 
  CheckSquare,
  Home,
  LogOut,
  Plus,
  List,
  BookOpen,
  GraduationCap,
  BookOpenText,
  PenTool,
  Mic
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function DashboardSidebar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    { title: 'Dashboard', icon: Home, path: '/dashboard' },
    {
      group: 'IELTS Listening Tests',
      items: [
        { title: 'All Tests', icon: Headphones, path: '/dashboard/listening-tests' },
        { title: 'Create Test', icon: Plus, path: '/dashboard/listening-tests/new' },
        { title: 'Sections', icon: List, path: '/dashboard/listening-sections' },
        { title: 'Question Bank', icon: BookOpen, path: '/dashboard/listening-questions' },
      ]
    },
    {
      group: 'PTE Listening Tests',
      items: [
        { title: 'All Tests', icon: Headphones, path: '/dashboard/pte-listening-tests' },
        { title: 'Create Test', icon: Plus, path: '/dashboard/pte-listening-tests/new' },
        { title: 'Sections', icon: List, path: '/dashboard/pte-listening-sections' },
        { title: 'Question Bank', icon: BookOpen, path: '/dashboard/pte-listening-questions' },
      ]
    },
    {
      group: 'IELTS Reading Tests',
      items: [
        { title: 'All Tests', icon: BookOpenText, path: '/dashboard/reading-tests' },
        { title: 'Create Test', icon: Plus, path: '/dashboard/reading-tests/new' },
        { title: 'Sections', icon: List, path: '/dashboard/reading-sections' },
        { title: 'Question Bank', icon: BookOpen, path: '/dashboard/reading-questions' },
      ]
    },
    {
      group: 'PTE Reading Tests',
      items: [
        { title: 'All Tests', icon: BookOpenText, path: '/dashboard/pte-reading-tests' },
        { title: 'Create Test', icon: Plus, path: '/dashboard/pte-reading-tests/new' },
        { title: 'Sections', icon: List, path: '/dashboard/pte-reading-sections' },
        { title: 'Question Bank', icon: BookOpen, path: '/dashboard/pte-reading-questions' },
      ]
    },
    {
      group: 'IELTS Writing Tests',
      items: [
        { title: 'All Tests', icon: PenTool, path: '/dashboard/writing-tests' },
        { title: 'Create Test', icon: Plus, path: '/dashboard/writing-tests/new' },
        { title: 'Tasks', icon: List, path: '/dashboard/writing-tasks' },
        { title: 'Question Bank', icon: BookOpen, path: '/dashboard/writing-questions' },
      ]
    },
    {
      group: 'PTE Writing Tests',
      items: [
        { title: 'All Tests', icon: PenTool, path: '/dashboard/pte-writing-tests' },
        { title: 'Create Test', icon: Plus, path: '/dashboard/pte-writing-tests/new' },
        { title: 'Tasks', icon: List, path: '/dashboard/pte-writing-tasks' },
        { title: 'Question Bank', icon: BookOpen, path: '/dashboard/pte-writing-questions' },
      ]
    },
    {
      group: 'IELTS Speaking Tests',
      items: [
        { title: 'All Tests', icon: Mic, path: '/dashboard/speaking-tests' },
        { title: 'Create Test', icon: Plus, path: '/dashboard/speaking-tests/new' },
        { title: 'Tasks', icon: List, path: '/dashboard/speaking-sections' },
      ]
    },
    {
      group: 'PTE Speaking Tests',
      items: [
        { title: 'All Tests', icon: Mic, path: '/dashboard/pte-speaking-tests' },
        { title: 'Create Test', icon: Plus, path: '/dashboard/pte-speaking-tests/new' },
        { title: 'Tasks', icon: List, path: '/dashboard/pte-speaking-sections' },
      ]
    },
    {
      group: 'IELTS Assessment',
      items: [
        { title: 'Listening Submissions', icon: CheckSquare, path: '/dashboard/listening-submissions' },
        { title: 'Reading Submissions', icon: CheckSquare, path: '/dashboard/reading-submissions' },
        { title: 'Writing Submissions', icon: CheckSquare, path: '/dashboard/writing-submissions' },
        { title: 'Speaking Submissions', icon: CheckSquare, path: '/dashboard/speaking-submissions' },
      ]
    },
    {
      group: 'PTE Assessment',
      items: [
        { title: 'Listening Submissions', icon: CheckSquare, path: '/dashboard/pte-listening-submissions' },
        { title: 'Reading Submissions', icon: CheckSquare, path: '/dashboard/pte-reading-submissions' },
        { title: 'Writing Submissions', icon: CheckSquare, path: '/dashboard/pte-writing-submissions' },
        { title: 'Speaking Submissions', icon: CheckSquare, path: '/dashboard/pte-speaking-submissions' },
      ]
    },
    {
      group: 'Administration',
      items: [
        { title: 'Users', icon: Users, path: '/dashboard/users' },
        { title: 'Settings', icon: Settings, path: '/dashboard/settings' },
      ]
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
            <Headphones className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl">ListenLab</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {/* Dashboard */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive('/dashboard')}
              tooltip="Dashboard"
            >
              <Link to="/dashboard" className="w-full">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator />

          {/* Grouped Menu Items */}
          {menuItems.slice(1).map((group) => (
            'group' in group ? (
              <SidebarGroup key={group.group}>
                <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.path)}
                      tooltip={item.title}
                    >
                      <Link to={item.path} className="w-full">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarGroup>
            ) : null
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <SidebarSeparator />
        <div className="mt-2">
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors w-full p-2 rounded-md hover:bg-gray-100">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default DashboardSidebar;
