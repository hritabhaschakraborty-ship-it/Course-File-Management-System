import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid, BookOpen, FileText, Users, Award, BarChart3,
  Send, Bell, User, HelpCircle, LogOut, GraduationCap, CheckCircle2
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRole = (role) => user?.role === role;

  const isActive = (path) => {
    if (path === '/faculty' && (location.pathname === '/faculty' || location.pathname === '/faculty/dashboard')) return true;
    if (path === '/faculty/courses' && location.pathname.startsWith('/faculty/courses')) return true;
    return location.pathname === path;
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-wrapper">
          <div className="brand-icon-box">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="brand-title">CFMS Portal</div>
            <div className="brand-subtitle">Academic Enterprise ERP</div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Academic Operations</div>

        {isRole('FACULTY') && (
          <>
            <div
              className={`nav-item ${isActive('/faculty') ? 'active' : ''}`}
              onClick={() => navigate('/faculty')}
              id="nav-dashboard"
            >
              <div className="nav-item-left">
                <LayoutGrid size={18} />
                <span>Dashboard</span>
              </div>
            </div>

            <div
              className={`nav-item ${isActive('/faculty/courses') ? 'active' : ''}`}
              onClick={() => navigate('/faculty/courses')}
              id="nav-my-courses"
            >
              <div className="nav-item-left">
                <BookOpen size={18} />
                <span>My Courses</span>
              </div>
              <span className="nav-badge">6</span>
            </div>

            <div
              className={`nav-item ${location.pathname.includes('/documents') ? 'active' : ''}`}
              onClick={() => navigate('/faculty/course/4/documents')}
              id="nav-documents"
            >
              <div className="nav-item-left">
                <FileText size={18} />
                <span>Documents</span>
              </div>
            </div>

            <div
              className={`nav-item ${location.pathname.includes('/attendance') ? 'active' : ''}`}
              onClick={() => navigate('/faculty/course/4/attendance')}
              id="nav-attendance"
            >
              <div className="nav-item-left">
                <Users size={18} />
                <span>Attendance</span>
              </div>
            </div>

            <div
              className={`nav-item ${location.pathname.includes('/assessments') ? 'active' : ''}`}
              onClick={() => navigate('/faculty/course/4/assessments')}
              id="nav-assessments"
            >
              <div className="nav-item-left">
                <Award size={18} />
                <span>Assessments</span>
              </div>
            </div>

            <div
              className={`nav-item ${location.pathname.includes('/copo') ? 'active' : ''}`}
              onClick={() => navigate('/faculty/course/4/copo')}
              id="nav-copo"
            >
              <div className="nav-item-left">
                <BarChart3 size={18} />
                <span>CO–PO Analytics</span>
              </div>
            </div>

            <div
              className={`nav-item ${location.pathname.includes('/lesson-plan') ? 'active' : ''}`}
              onClick={() => navigate('/faculty/course/4/lesson-plan')}
              id="nav-lesson-plan"
            >
              <div className="nav-item-left">
                <Send size={18} />
                <span>Lesson Plan</span>
              </div>
            </div>
          </>
        )}

        {isRole('HOD') && (
          <div
            className={`nav-item ${location.pathname === '/hod' ? 'active' : ''}`}
            onClick={() => navigate('/hod')}
            id="nav-hod"
          >
            <div className="nav-item-left">
              <CheckCircle2 size={18} />
              <span>Department Audit</span>
            </div>
          </div>
        )}

        {isRole('STUDENT') && (
          <div
            className={`nav-item ${location.pathname === '/student' ? 'active' : ''}`}
            onClick={() => navigate('/student')}
            id="nav-student-courses"
          >
            <div className="nav-item-left">
              <BookOpen size={18} />
              <span>My Course Files</span>
            </div>
          </div>
        )}

        {isRole('REVIEWER') && (
          <div
            className={`nav-item ${location.pathname === '/reviewer' ? 'active' : ''}`}
            onClick={() => navigate('/reviewer')}
            id="nav-reviewer"
          >
            <div className="nav-item-left">
              <CheckCircle2 size={18} />
              <span>Review Console</span>
            </div>
          </div>
        )}

        {isRole('ADMIN') && (
          <div
            className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
            onClick={() => navigate('/admin')}
            id="nav-admin"
          >
            <div className="nav-item-left">
              <LayoutGrid size={18} />
              <span>Administration</span>
            </div>
          </div>
        )}

        <div className="nav-section-title" style={{ marginTop: '0.75rem' }}>Account & Help</div>

        <div
          className={`nav-item ${location.pathname === '/notifications' ? 'active' : ''}`}
          onClick={() => navigate('/notifications')}
          id="nav-notifications"
        >
          <div className="nav-item-left">
            <Bell size={18} />
            <span>Notifications</span>
          </div>
        </div>

        <div
          className="nav-item"
          onClick={() => alert(`Institutional Faculty Profile: ${user?.name} (${user?.email})\nRole: ${user?.role}\nDepartment: Computer Science & Engineering\nSession: AY 2026-27`)}
          id="nav-profile"
        >
          <div className="nav-item-left">
            <User size={18} />
            <span>Profile</span>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="node-status-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="status-dot"></span>
            <span>ERP Node Online</span>
          </div>
          <span style={{ color: 'var(--text-light)', fontSize: '0.65rem' }}>v4.8</span>
        </div>

        <button
          className="btn btn-outline btn-sm"
          style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent', padding: '0.4rem 0.5rem' }}
          onClick={() => alert('CFMS Academic Directives:\n1. All course files must have 14/15 statutory components verified.\n2. Minimum 75% attendance rule strictly enforced under Clause 8.2.\n3. CO-PO Attainment threshold: 70.0%.\nSupport: support.cfms@university.edu')}
        >
          <HelpCircle size={15} />
          <span>Help & Docs</span>
        </button>

        <button
          className="btn btn-sm"
          style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent', color: 'var(--danger)', padding: '0.4rem 0.5rem' }}
          onClick={logout}
          id="btn-sign-out"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
