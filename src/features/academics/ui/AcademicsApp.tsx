'use client';

import React from 'react';
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
import { CampusAiDrawer } from './components/CampusAiDrawer';

export function AcademicsApp() {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,

    // Profile & CRUD Handlers
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
    assignmentFilter,
    setAssignmentFilter,
    updateAssignmentStatus,
    practicals,
    markPracticalComplete,

    // Assessments & Attendance
    exams,
    attendance,
    notices,

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

    // Directory & Campus Help
    facultyDirectory,
    lostItems,

    // MCP Connectors & AI Drawer
    connectors,
    toggleConnector,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    activeAiPrompt,
    setActiveAiPrompt,
    openAiDrawerWithPrompt,
  } = useAcademicsWorkspace();

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] text-slate-800 antialiased font-sans">
      {/* 1. Floating Animated Campus AI Drawer (Right Edge) */}
      <CampusAiDrawer
        isOpen={isAiDrawerOpen}
        onToggle={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
        profile={profile}
        timetable={timetable}          // <-- Passes live timetable
  assignments={assignments}      // <-- Passes live coursework
  notices={notices}              // <-- Passes live notices
  activeTab={activeTab}          // <-- Passes active screen tab
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
      <div className="flex-1 flex flex-col min-w-0">
        <AcademicsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          profile={profile}
          todayFormatted={todayFormatted}
          greeting={greeting}
          selectedBranch={selectedBranch}
          onBranchChange={(b) => setSelectedBranch(b as BranchCode)}
          selectedSemester={selectedSemester}
          onSemesterChange={setSelectedSemester}
        />

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
                    What&apos;s happening around {profile.collegeName}.
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

              <LectureDriveView files={driveFiles} onToggleStar={toggleStarFile} />
            </div>
          )}

          {/* TAB 5: Attendance Analytics */}
          {activeTab === 'attendance' && <AttendanceView attendance={attendance} />}

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

          {/* TAB 7: Student Profile (with Full CRUD & Photo Upload) */}
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
                  Extracted directly from the master timetable for {roomNo}.
                </p>
              </div>
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
            </div>
          )}

          {/* TAB 9: Assignments */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                  Coursework
                </p>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                  Assignments
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Everything issued this semester, sorted by deadline.
                </p>
              </div>

              <div className="flex gap-2">
                {(['All', 'Not Started', 'In Progress', 'Submitted', 'Overdue'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setAssignmentFilter(status)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        assignmentFilter === status
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {assignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {asg.subject}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          asg.status === 'Overdue'
                            ? 'bg-rose-50 text-rose-600'
                            : asg.status === 'Submitted'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {asg.status}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-500">
                        {asg.priority} priority
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-base">{asg.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{asg.description}</p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {asg.attachments.map((file) => (
                        <span
                          key={file}
                          className="text-[11px] bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg"
                        >
                          📄 {file}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Due: {asg.dueDate}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateAssignmentStatus(
                            asg.id,
                            asg.status === 'Submitted' ? 'In Progress' : 'Submitted'
                          )
                        }
                        className={`font-semibold hover:underline cursor-pointer ${
                          asg.status === 'Overdue' ? 'text-rose-600' : 'text-indigo-600'
                        }`}
                      >
                        {asg.status === 'Submitted' ? 'Mark unsubmitted' : 'Mark as submitted'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: Practicals */}
          {activeTab === 'practicals' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                  Labs
                </p>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                  Practicals
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Experiments, lab manuals and record submissions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {practicals.map((prac) => (
                  <div
                    key={prac.id}
                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-600">
                        {prac.subject} · Exp {prac.experimentNumber}
                      </span>
                      <span className="text-xs text-slate-400">{prac.relativeDue}</span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-base">{prac.title}</h3>
                    <p className="text-xs text-slate-500">
                      {prac.labRoom} · {prac.faculty}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {prac.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button type="button" className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer">
                        📖 Lab manual
                      </button>
                      <button
                        type="button"
                        onClick={() => markPracticalComplete(prac.id)}
                        className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                          prac.completed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {prac.completed ? '✓ Completed' : 'Mark completed'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: Exams */}
          {activeTab === 'exams' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                  Assessments
                </p>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                  Exams
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Your examination schedule and syllabus for each paper.
                </p>
              </div>

              {exams.find((e) => e.isNextUp) && (
                <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-md shadow-indigo-100 space-y-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2.5 py-1 rounded-md">
                    Next up · In 2 days
                  </span>
                  <h3 className="text-xl font-bold">Data Structures quiz 3</h3>
                  <p className="text-xs text-indigo-100">
                    17 Oct 2026 · 10:00 – 10:45 · Room 204
                  </p>
                  <p className="text-xs text-indigo-200 pt-1">Syllabus: Unit 3 — Trees & heaps</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {exams.map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                        {ex.type}
                      </span>
                      <span className="text-xs text-slate-400">{ex.relativeNotice}</span>
                    </div>

                    <h4 className="font-semibold text-slate-900 text-base">{ex.title}</h4>
                    <p className="text-xs text-slate-500">{ex.subject}</p>
                    <p className="text-xs text-slate-400">
                      {ex.timeStr} · {ex.room}
                    </p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {ex.syllabus}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: Notices */}
          {activeTab === 'notices' && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                  Notice Board
                </p>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                  Notices
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">2 unread notices</p>
              </div>

              <div className="space-y-4">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-2 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 uppercase">
                        {n.category}
                      </span>
                      {n.isImportant && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 uppercase">
                          Important
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">{n.dateStr}</span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-base">{n.title}</h3>
                    <p className="text-xs text-slate-600">{n.summary}</p>

                    {n.attachmentName && (
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                          📎 {n.attachmentName}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 13: Resources & Faculty Directory */}
          {activeTab === 'resources' && (
            <div className="space-y-8">
              <div>
                <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
                  Campus
                </p>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
                  Resources
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Portals, people and help — all in one place.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-lg mb-4">Faculty directory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facultyDirectory.map((fac) => (
                    <div
                      key={fac.id}
                      className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-2"
                    >
                      <h4 className="font-semibold text-slate-900 text-sm">{fac.name}</h4>
                      <p className="text-xs text-slate-400">
                        {fac.department} · {fac.cabin}
                      </p>
                      <p className="text-[11px] text-slate-500">Hours: {fac.officeHours}</p>
                      <a
                        href={`mailto:${fac.email}`}
                        className="inline-block text-xs text-indigo-600 hover:underline"
                      >
                        ✉ {fac.email}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 text-lg mb-4">Lost & found</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lostItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{item.item}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.location} · {item.timeAgo}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'Found'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: MCP & Plugins (ChatGPT / Notion AI Connectors Hub) */}
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