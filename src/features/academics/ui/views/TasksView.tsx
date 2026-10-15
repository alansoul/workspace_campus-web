'use client';

import React from 'react';
import { AcademicTask } from '../../types/academics.types';

interface TasksProps {
  tasks: AcademicTask[];
  newTaskTitle: string;
  onTitleChange: (v: string) => void;
  newTaskPriority: AcademicTask['priority'];
  onPriorityChange: (v: AcademicTask['priority']) => void;
  newTaskCategory: AcademicTask['category'];
  onCategoryChange: (v: AcademicTask['category']) => void;
  onAddTask: (e: React.FormEvent) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export function TasksView({
  tasks,
  newTaskTitle,
  onTitleChange,
  newTaskPriority,
  onPriorityChange,
  newTaskCategory,
  onCategoryChange,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TasksProps) {
  const openTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">To-Do</p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mt-0.5">Tasks</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {openTasks.length} open · {completedTasks.length} completed
        </p>
      </div>

      {/* Task Add Form */}
      <form
        onSubmit={onAddTask}
        className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3"
      >
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Add a task, deadline or reminder..."
          className="flex-1 min-w-[200px] text-sm px-3 py-2 outline-hidden text-slate-800 placeholder:text-slate-400"
        />
        <select
          value={newTaskPriority}
          onChange={(e) => onPriorityChange(e.target.value as AcademicTask['priority'])}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-hidden"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select
          value={newTaskCategory}
          onChange={(e) => onCategoryChange(e.target.value as AcademicTask['category'])}
          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-hidden"
        >
          <option value="Assignment">Assignment</option>
          <option value="Exam prep">Exam prep</option>
          <option value="Practical">Practical</option>
          <option value="Personal">Personal</option>
          <option value="Reminder">Reminder</option>
        </select>
        <button
          type="submit"
          className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
        >
          + Add
        </button>
      </form>

      {/* Two-Column Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Open Tasks */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <h3 className="font-semibold text-slate-900 text-base mb-4">Open</h3>
          {openTasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => onToggleTask(t.id)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <p className="text-xs font-semibold text-slate-900">{t.title}</p>
                  <p className="text-[11px] text-slate-400">{t.dueDateText}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  {t.category}
                </span>
                <button
                  onClick={() => onDeleteTask(t.id)}
                  className="text-slate-300 hover:text-rose-500 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Completed Tasks */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <h3 className="font-semibold text-slate-900 text-base mb-4">Completed</h3>
          {completedTasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/30 opacity-70"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => onToggleTask(t.id)}
                  className="rounded border-slate-300 text-indigo-600 w-4 h-4 cursor-pointer"
                />
                <p className="text-xs line-through text-slate-500">{t.title}</p>
              </div>
              <button
                onClick={() => onDeleteTask(t.id)}
                className="text-slate-300 hover:text-rose-500 text-xs px-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}