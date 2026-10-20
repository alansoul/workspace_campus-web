// campus-web/src/features/academics/ui/AcademicsApp.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAcademicsWorkspace, type BranchCode } from '../hooks/useAcademicsWorkspace';
import { AcademicsSidebar } from './AcademicsSidebar';
import { AcademicsHeader } from './AcademicsHeader';

// Modals
import { UploadMaterialModal } from './modals/UploadMaterialModal';
import { CreateEventModal } from './modals/CreateEventModal';
import { AdminTimetableUploadModal } from './modals/AdminTimetableUploadModal';

// View Panels
import { EventsView } from './views/EventsView';
import { AcademicsOverviewView } from './views/AcademicsOverviewView';
import { TimetableView } from './views/TimetableView';
import { LectureDriveView } from './views/LectureDriveView';
import { AttendanceView } from './views/AttendanceView';
import { TasksView } from './views/TasksView';
import { ProfileView } from './views/ProfileView';
import { McpPluginsView } from './views/McpPluginsView';
import { AssignmentsView } from './views/AssignmentsView';
import { NoticesView } from './views/NoticesView';
import { CampusAiDrawer } from './components/CampusAiDrawer';
import { CalendarView } from './views/CalendarView';
// 🟢 ADD THESE THREE:
import { PracticalsView } from './views/PracticalsView';
import { ExamsView } from './views/ExamsView';
import { ResourcesView } from './views/ResourcesView';

export function AcademicsApp() {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,

    // Profile & Handlers
    profile,
    updateProfile,
    handleAvatarUpload,

    todayFormatted,
    greeting,
    isAdmin,

    // Institution & Timetable Metadata
    institutionName,
    roomNo,
    effectiveDate,
    selectedBranch,
    setSelectedBranch,
    selectedSemester,
    setSelectedSemester,
    timetable,
    subjects,
    isTimetableModalOpen,
    setIsTimetableModalOpen,
    applyImportedTimetable,

    // Events
    events,
    selectedEventCategory,
    setSelectedEventCategory,
    toggleEventInterest,
    isEventModalOpen,
    setIsEventModalOpen,
    handleCreateEvent,

    // Drive & Coursework
    driveFiles,
    toggleStarFile,
    isUploadModalOpen,
    setIsUploadModalOpen,
    handleUploadFile,
    assignments,

    // Assessments & Attendance
    exams,
    attendance,
    notices,
    markNoticeAsRead,
    handleCreateNotice,
    importFromWhatsApp,

    // Tasks
    tasks,
    newTaskTitle,
    setNewTaskTitle,
    newTaskCategory,
    setNewTaskCategory,
    newTaskPriority,
    setNewTaskPriority,
    addTask,
    deleteTask,
    toggleTaskCompletion,

    // MCP Connectors & AI Drawer
    connectors,
    toggleConnector,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    activeAiPrompt,
    setActiveAiPrompt,
    openAiDrawerWithPrompt,
    handleFullInboxSync,
  } = useAcademicsWorkspace();

  const [isSyncing, setIsSyncing] = useState(false);

  // Track deleted files and derive active drive files without cascading renders
  const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);
  const activeDriveFiles = driveFiles.filter((file) => !deletedFileIds.includes(file.id));

  const handleDeleteFile = (fileId: string) => {
    setDeletedFileIds((prev) => [...prev, fileId]);

    // Clean up from localStorage keys
    const storageKeys = ['campus_drive_files', 'campus_files', 'workspace_drive_files'];
    storageKeys.forEach((key) => {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localStorage.setItem(
              key,
              JSON.stringify(parsed.filter((f: { id: string }) => f.id !== fileId))
            );
          }
        } catch {
          // Ignore parse errors for non-JSON keys
        }
      }
    });
  };

  const onManualSync = async () => {
    setIsSyncing(true);
    try {
      await handleFullInboxSync();
    } finally {
      setIsSyncing(false);
    }
  };

  // Floating Dropdown State (Derived state pattern to prevent cascading render cycles)
  const [dismissedQuery, setDismissedQuery] = useState<string | null>(null);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (dismissedQuery !== null) {
      setDismissedQuery(null);
    }
  };

  // Dismiss on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDismissedQuery(searchQuery);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [searchQuery]);

  const showSearchDropdown = Boolean(searchQuery.trim()) && searchQuery !== dismissedQuery;
  const totalMatches =
    subjects.length +
    driveFiles.length +
    events.length +
    assignments.length +
    notices.length;

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] text-slate-800 antialiased font-sans">
      {/* 1. Floating Animated Campus AI Drawer (Right Edge) */}
      <CampusAiDrawer
        isOpen={isAiDrawerOpen}
        onToggle={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        profile={profile}
        timetable={timetable}
        assignments={assignments}
        notices={notices}
        activeTab={activeTab}
        initialPrompt={activeAiPrompt}
        onClearInitialPrompt={() => setActiveAiPrompt('')}
      />

      {/* 2. Interactive Modals */}
      <UploadMaterialModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadFile}
        subjects={subjects}
      />

      <CreateEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onCreate={handleCreateEvent}
      />

      <AdminTimetableUploadModal
        isOpen={isTimetableModalOpen}
        onClose={() => setIsTimetableModalOpen(false)}
        onApplyTimetable={applyImportedTimetable}
        currentBranch={selectedBranch}
        currentSemester={selectedSemester}
      />

      {/* 3. Left Sticky Navigation Sidebar */}
      <AcademicsSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profile={profile}
      />

      {/* 4. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <AcademicsHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          profile={profile}
          todayFormatted={todayFormatted}
          greeting={greeting}
          selectedBranch={selectedBranch}
          onBranchChange={(b) => setSelectedBranch(b as BranchCode)}
          selectedSemester={selectedSemester}
          onSemesterChange={setSelectedSemester}
        />

        {/* Global Live Search Results Dropdown */}
        {showSearchDropdown && (
          <>
            {/* Click-away backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/5"
              onClick={() => setDismissedQuery(searchQuery)}
            />

            {/* Dropdown Container pinned below search input using canonical Tailwind classes */}
            <div className="absolute right-4 sm:right-8 top-16 z-50 w-[calc(100vw-2rem)] sm:w-104 max-h-128 overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Quick Search</h4>
                  <p className="text-[11px] text-slate-400">
                    Results for &ldquo;<span className="font-semibold text-indigo-600">{searchQuery}</span>&rdquo; ({totalMatches})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setDismissedQuery(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  Clear ✕
                </button>
              </div>

              {totalMatches === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <span className="text-3xl">🔍</span>
                  <p className="text-sm font-semibold text-slate-800">No matching results</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Nothing across subjects, drive documents, events, assignments, or notices matches &ldquo;{searchQuery}&rdquo;.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  {/* 1. Subjects */}
                  {subjects.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                        Subjects ({subjects.length})
                      </p>
                      <div className="space-y-1">
                        {subjects.slice(0, 3).map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              setActiveTab('subjects');
                              setDismissedQuery(searchQuery);
                            }}
                            className="w-full text-left p-2.5 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 flex items-center justify-between cursor-pointer group"
                          >
                            <div className="truncate mr-2">
                              <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition truncate">
                                {sub.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {sub.code} · {sub.faculty}
                              </p>
                            </div>
                            <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                              View →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Lecture Drive */}
                  {driveFiles.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                        Lecture Drive ({driveFiles.length})
                      </p>
                      <div className="space-y-1">
                        {driveFiles.slice(0, 3).map((file) => (
                          <button
                            key={file.id}
                            type="button"
                            onClick={() => {
                              setActiveTab('drive');
                              setDismissedQuery(searchQuery);
                            }}
                            className="w-full text-left p-2.5 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 flex items-center justify-between cursor-pointer group"
                          >
                            <div className="truncate mr-2">
                              <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition truncate">
                                {file.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {file.subject} · {file.category}
                              </p>
                            </div>
                            <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                              Open →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Campus Events */}
                  {events.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                        Events ({events.length})
                      </p>
                      <div className="space-y-1">
                        {events.slice(0, 3).map((evt) => (
                          <button
                            key={evt.id}
                            type="button"
                            onClick={() => {
                              setActiveTab('events');
                              setDismissedQuery(searchQuery);
                            }}
                            className="w-full text-left p-2.5 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 flex items-center justify-between cursor-pointer group"
                          >
                            <div className="truncate mr-2">
                              <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition truncate">
                                {evt.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {evt.venue} · {evt.dateTimeStr}
                              </p>
                            </div>
                            <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                              View →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Assignments */}
                  {assignments.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                        Assignments ({assignments.length})
                      </p>
                      <div className="space-y-1">
                        {assignments.slice(0, 3).map((asg) => (
                          <button
                            key={asg.id}
                            type="button"
                            onClick={() => {
                              setActiveTab('assignments');
                              setDismissedQuery(searchQuery);
                            }}
                            className="w-full text-left p-2.5 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 flex items-center justify-between cursor-pointer group"
                          >
                            <div className="truncate mr-2">
                              <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition truncate">
                                {asg.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {asg.subject} · {asg.relativeDue || asg.dueDate}
                              </p>
                            </div>
                            <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                              View →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Notices */}
                  {notices.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                        Notices ({notices.length})
                      </p>
                      <div className="space-y-1">
                        {notices.slice(0, 2).map((notice) => (
                          <button
                            key={notice.id}
                            type="button"
                            onClick={() => {
                              setActiveTab('notices');
                              setDismissedQuery(searchQuery);
                            }}
                            className="w-full text-left p-2.5 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 flex items-center justify-between cursor-pointer group"
                          >
                            <div className="truncate mr-2">
                              <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition truncate">
                                {notice.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {notice.category} · {notice.dateStr}
                              </p>
                            </div>
                            <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                              Read →
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Quick Manual Sync Bar */}
        <div className="px-8 pt-4 pb-0 max-w-7xl mx-auto w-full flex justify-end">
          <button
            type="button"
            onClick={onManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <span className={isSyncing ? 'animate-spin inline-block' : 'inline-block'}>🔄</span>
            <span>{isSyncing ? 'Syncing Inbox...' : 'Sync Campus Mail'}</span>
          </button>
        </div>

        <main className="p-8 max-w-7xl mx-auto w-full flex-1">

          {/* TAB 1: Timetable */}
          {activeTab === 'timetable' && (
            <TimetableView
              timetable={timetable}
              branch={selectedBranch}
              semester={selectedSemester}
              roomNo={roomNo}
              effectiveDate={effectiveDate}
              institutionName={institutionName}
              isAdmin={isAdmin}
              onOpenUploadModal={() => setIsTimetableModalOpen(true)}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              events={events}
              assignments={assignments}
              exams={exams}
              timetable={timetable}
            />
          )}

          {/* TAB 2: Events */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                    Campus Life
                  </p>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">Events</h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    What&apos;s happening around {profile.collegeName || 'Campus'}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  + Host Event
                </button>
              </div>

              <EventsView
                events={events}
                selectedCategory={selectedEventCategory}
                onSelectCategory={setSelectedEventCategory}
                onToggleInterest={toggleEventInterest}
              />
            </div>
          )}

          {/* TAB 3: Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <AcademicsOverviewView
              onNavigate={setActiveTab}
              todaySchedule={timetable.find((d) => d.isToday)?.slots || []}
              assignments={assignments}
              notices={notices}
              exams={exams}
              attendance={attendance}
            />
          )}

          {/* TAB 4: Lecture Drive */}
          {activeTab === 'drive' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                    {profile.branch} · Semester {profile.semester}
                  </p>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                    Lecture Drive
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Verified lecture slides, handwritten notes, and past exam question papers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  ↑ Upload Material
                </button>
              </div>

              <LectureDriveView
                files={activeDriveFiles}
                onToggleStar={toggleStarFile}
                onDeleteFile={handleDeleteFile}
              />
            </div>
          )}

          {/* TAB 5: Attendance Analytics */}
          {activeTab === 'attendance' && <AttendanceView />}

          {/* TAB 6: Tasks & To-Do List */}
          {activeTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              newTaskTitle={newTaskTitle}
              onTitleChange={setNewTaskTitle}
              newTaskPriority={newTaskPriority}
              onPriorityChange={setNewTaskPriority}
              newTaskCategory={newTaskCategory}
              onCategoryChange={setNewTaskCategory}
              onAddTask={addTask}
              onToggleTask={toggleTaskCompletion}
              onDeleteTask={deleteTask}
            />
          )}

          {/* TAB 7: Student Profile */}
          {activeTab === 'profile' && (
            <ProfileView
              profile={profile}
              onUpdateProfile={updateProfile}
              onUploadAvatar={handleAvatarUpload}
            />
          )}

          {/* TAB 8: Subjects */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                  Semester {selectedSemester} · {selectedBranch}
                </p>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                  Subjects
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {searchQuery
                    ? `Showing results matching "${searchQuery}"`
                    : `Extracted directly from the master timetable for ${roomNo}.`}
                </p>
              </div>

              {subjects.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
                  <span className="text-3xl">🔍</span>
                  <p className="text-slate-800 font-semibold text-sm mt-2">No subjects found</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    No subject matches &quot;{searchQuery}&quot;
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {subjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900 text-base">{sub.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {sub.code} · {sub.faculty}
                          </p>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                          {sub.credits} cr
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                        <div>
                          <p className="text-base font-bold text-slate-800">{sub.classesPerWeek}</p>
                          <p className="text-[10px] text-slate-400">classes/wk</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-800">{sub.assignmentsCount}</p>
                          <p className="text-[10px] text-slate-400">assignments</p>
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-800">{sub.filesCount}</p>
                          <p className="text-[10px] text-slate-400">files</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-500">
                            Syllabus {sub.unitsCompleted}/{sub.totalUnits} units
                          </span>
                          <span className="font-semibold text-emerald-600">
                            Attendance {sub.attendancePct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{
                              width: `${(sub.unitsCompleted / sub.totalUnits) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: Assignments */}
          {activeTab === 'assignments' && <AssignmentsView />}

          {/* TAB 10: Practicals */}
          {activeTab === 'practicals' && <PracticalsView />}

          {/* TAB 11: Exams */}
          {activeTab === 'exams' && <ExamsView />}

          {/* TAB 12: Notices */}
          {activeTab === 'notices' && (
            <NoticesView
              notices={notices}
              onMarkAsRead={markNoticeAsRead}
              onCreateNotice={handleCreateNotice}
              onImportFromWhatsApp={importFromWhatsApp}
            />
          )}

          {/* TAB 13: Resources & Faculty Directory */}
          {activeTab === 'resources' && <ResourcesView />}

          {/* TAB 14: MCP & Plugins */}
          {activeTab === 'plugins' && (
            <McpPluginsView
              connectors={connectors}
              onToggleConnector={toggleConnector}
              onOpenAiDrawerWithPrompt={openAiDrawerWithPrompt}
            />
          )}
        </main>
      </div>
    </div>
  );
}