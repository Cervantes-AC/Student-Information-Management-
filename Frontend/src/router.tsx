import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth, RequireRole } from './auth/guards'
import { ToastProvider } from './components/ui/Toast'
import { AppLayout } from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import StudentsPage from './pages/StudentsPage'
import StudentDetailPage from './pages/StudentDetailPage'
import ProgramsPage from './pages/ProgramsPage'
import CoursesPage from './pages/CoursesPage'
import AcademicTermsPage from './pages/AcademicTermsPage'
import CourseOfferingsPage from './pages/CourseOfferingsPage'
import OfferingRosterPage from './pages/OfferingRosterPage'
import EnrollmentsPage from './pages/EnrollmentsPage'
import GradesPage from './pages/GradesPage'
import MyEnrollmentsPage from './pages/MyEnrollmentsPage'
import MyGradesPage from './pages/MyGradesPage'
import MyAcademicRecordPage from './pages/MyAcademicRecordPage'
import NotFoundPage from './pages/NotFoundPage'
import type { Role } from './types'

const STAFF: Role[] = ['administrator', 'registrar']
const ALL_STAFF: Role[] = ['administrator', 'registrar', 'instructor']

/**
 * The full route table plus providers. Wrapped by BrowserRouter in the app and
 * by MemoryRouter in tests so the same routes run in both environments.
 */
export function AppRoutes(): React.JSX.Element {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />

              {/* Administrator + Registrar */}
              <Route element={<RequireRole roles={STAFF} />}>
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/students/:id" element={<StudentDetailPage />} />
                <Route path="/programs" element={<ProgramsPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/academic-terms" element={<AcademicTermsPage />} />
                <Route path="/enrollments" element={<EnrollmentsPage />} />
              </Route>

              {/* Administrator + Registrar + Instructor */}
              <Route element={<RequireRole roles={ALL_STAFF} />}>
                <Route path="/course-offerings" element={<CourseOfferingsPage />} />
                <Route path="/course-offerings/:id/roster" element={<OfferingRosterPage />} />
                <Route path="/grades" element={<GradesPage />} />
              </Route>

              {/* Student self-service */}
              <Route element={<RequireRole roles={['student']} />}>
                <Route path="my/enrollments" element={<MyEnrollmentsPage />} />
                <Route path="my/grades" element={<MyGradesPage />} />
                <Route path="my/academic-record" element={<MyAcademicRecordPage />} />
              </Route>

              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}