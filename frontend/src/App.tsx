import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Navigation from '@/components/Navbar';
import Index from '@/pages/Index';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import Profile from '@/pages/Profile/UserProfile';
import Dashboard from '@/pages/Dashboard/Dashboard';
import About from '@/pages/About';
import Contact from '@/pages/Contact';

// Test pages
import ListeningTestsPage from "@/pages/ListeningTests/ListeningTestsPage";
import ListeningTestDetails from '@/pages/ListeningTests/ListeningTestDetails';
import ListeningTestTaking from "@/pages/ListeningTests/ListeningTestTaking";
import ReadingTestsPage from "@/pages/ReadingTests/ReadingTestsPage";
import ReadingTestDetails from "@/pages/ReadingTests/ReadingTestDetails";
import ReadingTestTaking from "@/pages/ReadingTests/ReadingTestTaking";

// Dashboard pages
import ListeningTestsAdmin from "./pages/Dashboard/ListeningTests";
import Submissions from "./pages/Dashboard/ListeningSubmissions";
import Users from "./pages/Dashboard/Users";
import Settings from "./pages/Dashboard/Settings";
import DashboardNotFound from "./pages/Dashboard/NotFound";
import CreateListeningTest from './pages/Dashboard/CreateListeningTest';
import SectionsPage from './pages/Dashboard/Sections';
import QuestionsPage from "./pages/Dashboard/Questions";
import UserProfile from './pages/Profile/UserProfile';
import SubmissionDetails from "@/pages/Profile/SubmissionDetails";
import ReadingQuestionsPage from './pages/Dashboard/ReadingQuestions';
import ReadingSectionsPage from './pages/Dashboard/ReadingSections';
import CreateReadingTestsPage from './pages/Dashboard/CreateReadingTests';
import ReadingTests from './pages/Dashboard/ReadingTests';
import WritingQuestionsPage from './pages/Dashboard/WritingQuestions';
import WritingTasksPage from './pages/Dashboard/WritingTasks';
import WritingTestsPage from '@/pages/WritingTests/WritingTestsPage';
import WritingTestDetails from "@/pages/WritingTests/WritingTestDetails";
import WritingTestTaking from "@/pages/WritingTests/WritingTestTaking";
import CreateWritingTestsPage from './pages/Dashboard/CreateWritingTests';
import SpeakingSections from '@/pages/Dashboard/SpeakingSections';
import SpeakingTests from '@/pages/Dashboard/SpeakingTests';
import CreateSpeakingTests from '@/pages/Dashboard/CreateSpeakingTests';
import ReadingSubmissions from "./pages/Dashboard/ReadingSubmissions";
import WritingSubmissions from "./pages/Dashboard/WritingSubmissions";
import SearchResults from './pages/SearchResults';
import SpeakingTestsPage from '@/pages/SpeakingTests/SpeakingTestsPage';
import SpeakingTestDetails from '@/pages/SpeakingTests/SpeakingTestDetails';
import SpeakingTestTaking from '@/pages/SpeakingTests/SpeakingTestTaking';
import SpeakingSubmissions from './pages/Dashboard/SpeakingSubmissions';
import SpeakingSubmissionsPage from './pages/Dashboard/SpeakingSubmissions';
import SpeakingSubmissionDetails from './pages/Profile/SpeakingSubmissionDetails';
import SpeakingSubmissionDetailed from '@/pages/SpeakingTests/SpeakingSubmissionDetailed';
import PTEListeningQuestions from './pages/Dashboard/PTEListeningQuestions';

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <Navigation />
          <div className="min-h-screen bg-gray-50 pt-16">
            <main>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Protected Routes */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tests/listening" 
                  element={
                    <ProtectedRoute>
                      <ListeningTestsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tests/listening/:id" 
                  element={
                    <ProtectedRoute>
                      <ListeningTestDetails />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tests/listening/:id/take" 
                  element={
                    <ProtectedRoute>
                      <ListeningTestTaking />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tests/reading" 
                  element={
                    <ProtectedRoute>
                      <ReadingTestsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tests/reading/:id" 
                  element={
                    <ProtectedRoute>
                      <ReadingTestDetails />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tests/reading/:id/take" 
                  element={
                    <ProtectedRoute>
                      <ReadingTestTaking />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route 
                  path="/submissions/:submissionId" 
                  element={
                    <ProtectedRoute>
                      <SubmissionDetails />
                    </ProtectedRoute>
                  } 
                />
                {/* <Route path="/speaking-submissions/:submissionId" element={<SpeakingSubmissionDetails />} /> */}
                <Route 
                  path="/tests/writing" 
                  element={
                    // <ProtectedRoute>
                      <WritingTestsPage />
                    // </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tests/writing/:id" 
                  element={
                    <ProtectedRoute>
                      <WritingTestDetails />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tests/writing/:id/take" 
                  element={
                    <ProtectedRoute>
                      <WritingTestTaking />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/tests/speaking"
                  element={
                    <ProtectedRoute>
                      <SpeakingTestsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tests/speaking/:id"
                  element={
                    <ProtectedRoute>
                      <SpeakingTestDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tests/speaking/:id/take"
                  element={
                    <ProtectedRoute>
                      <SpeakingTestTaking />
                    </ProtectedRoute>
                  }
                />

                {/* Protected test routes */}
                {/* <Route path="/tests/listening" element={
                  <ProtectedRoute>
                    <ListeningTestsPage />
                  </ProtectedRoute>
                } />
                <Route path="/tests/listening/:id" element={
                  <ProtectedRoute>
                    <ListeningTestDetails />
                  </ProtectedRoute>
                } />
                <Route path="/tests/listening/:id/take" element={
                  <ProtectedRoute>
                    <ListeningTestTaking />
                  </ProtectedRoute>
                } /> */}
                <Route path="/tests/:type" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                {/* <Route path="/practice" element={
                  <ProtectedRoute>
                    <ListeningTestsPage />
                  </ProtectedRoute>
                } /> */}
                
                {/* Protected admin routes */}
                <Route 
                  path="/dashboard/*" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                >
                  <Route index element={<ListeningTestsPage />} />
                  <Route path="listening-tests" element={<ListeningTestsAdmin />} />
                  <Route path="listening-tests/new" element={<CreateListeningTest />} />
                  {/* <Route path="listening-tests/:id/sections" element={<ManageTestSections />} /> */}
                  <Route path="listening-sections" element={<SectionsPage />} />
                  <Route path="listening-sections/:id/edit" element={<SectionsPage />} />
                  <Route path="listening-questions" element={<QuestionsPage />} />
                  <Route path="listening-questions/:id/edit" element={<QuestionsPage />} />
                  <Route path="listening-submissions" element={<Submissions />} />
                  <Route path="users" element={<Users />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<DashboardNotFound />} />
                  <Route path="pte-listening-questions" element={<PTEListeningQuestions />} />
                </Route>
                <Route path="/dashboard/reading-questions" element={
                  <ProtectedRoute>
                    <ReadingQuestionsPage />
                  </ProtectedRoute>
                } />
                <Route
                  path="/dashboard/reading-sections"
                  element={
                    <ProtectedRoute>
                      <ReadingSectionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/dashboard/reading-tests/new" element={
                  <ProtectedRoute>
                    <CreateReadingTestsPage />
                  </ProtectedRoute>
                } />
                <Route path='/dashboard/reading-tests' element={
                  // <ProtectedRoute>
                    <ReadingTests />
                  // </ProtectedRoute>
                }
                />
                <Route path="/dashboard/writing-questions" element={
                  <ProtectedRoute>
                    <WritingQuestionsPage />
                  </ProtectedRoute>
                } />
                <Route 
                  path="/dashboard/writing-tasks" 
                  element={
                    <ProtectedRoute>
                      <WritingTasksPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/writing-tests" 
                  element={
                    <ProtectedRoute>
                      <WritingTestsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/writing-tests/new" 
                  element={
                    <ProtectedRoute>
                      <CreateWritingTestsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/dashboard/speaking-sections" element={<SpeakingSections />} />
                <Route path="/dashboard/speaking-tests" element={<SpeakingTests />} />
                <Route path="/dashboard/speaking-submissions" element={<SpeakingSubmissions />} />
                <Route path="/dashboard/speaking-tests/new" element={<CreateSpeakingTests />} />
                <Route path="/dashboard/speaking-tests/edit/:id" element={<CreateSpeakingTests />} />
                <Route path="/dashboard/reading-submissions" element={
                  <ProtectedRoute>
                    <ReadingSubmissions />
                  </ProtectedRoute>
                } />
                {/* <Route path="/speaking-submissions/:submissionId" element={<SpeakingSubmissionsPage />} /> */}
                <Route path="/dashboard/writing-submissions" element={
                  <ProtectedRoute>
                    <WritingSubmissions />
                  </ProtectedRoute>
                } />
                <Route path="/search" element={<SearchResults />} />
                <Route 
                  path="/speaking-submissions/:id" 
                  element={
                    <ProtectedRoute>
                      <SpeakingSubmissionDetailed />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
          </div>
          <Toaster />
          <Sonner />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
