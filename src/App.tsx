// src/App.tsx
// هظدن - تصحêح اناستêرادات

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SettingsProvider } from '@/context/SettingsContext'
import { AdminProvider, useAdmin } from '@/context/AdminContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { HomePage } from '@/pages/HomePage'
import { AnalyzePage } from '@/pages/AnalyzePage'

// Admin Pages
import { AdminLogin } from '@/pages/admin/LoginPage'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { Dashboard } from '@/pages/admin/Dashboard'  // ? هظدن
import { SettingsPage } from '@/pages/admin/SettingsPage'
import { AdsPage } from '@/pages/admin/AdsPage'
import { LinksPage } from '@/pages/admin/LinksPage'
import { AdminsPage } from '@/pages/admin/AdminsPage'
import { PagesPage } from '@/pages/admin/PagesPage'
import { ArticlesPage } from '@/pages/admin/ArticlesPage'
import { CategoriesPage } from '@/pages/admin/CategoriesPage'
// AnalyticsPage عêر هèجèد - وستخده ActivityPage بدناë هوç
// import { AnalyticsPage } from '@/pages/admin/AnalyticsPage'
import { ActivityPage } from '@/pages/admin/ActivityPage'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAdmin()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Main Layout for public pages
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

// Admin Router - Completely separate from main site
function AdminRouter() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />  {/* ? هظدن */}
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admins" element={<AdminsPage />} />
        <Route path="ads" element={<AdsPage />} />
        <Route path="links" element={<LinksPage />} />
        <Route path="pages" element={<PagesPage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        {/* AnalyticsPage عêر هèجèد */}
        {/* <Route path="analytics" element={<AnalyticsPage />} /> */}
        <Route path="activity" element={<ActivityPage />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <Routes>
          {/* Admin Panel - Separate Route */}
          <Route
            path="/login"
            element={
              <AdminProvider>
                <AdminLogin />
              </AdminProvider>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AdminProvider>
                <AdminRouter />
              </AdminProvider>
            }
          />

          {/* Main Site */}
          <Route
            path="/*"
            element={
              <MainLayout>
                <Routes>
                  <Route index element={<HomePage />} />
                  <Route path="analyze" element={<AnalyzePage />} />
                  <Route path="articles" element={<ArticlesList />} />
                  <Route path="page/:slug" element={<StaticPage />} />
                </Routes>
              </MainLayout>
            }
          />
        </Routes>
      </SettingsProvider>
    </BrowserRouter>
  )
}

// Placeholder components
function ArticlesList() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Articles</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon...</p>
      </div>
    </div>
  )
}

function StaticPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Page</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon...</p>
      </div>
    </div>
  )
}

export default App