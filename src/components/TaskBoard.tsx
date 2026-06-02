import React, { useState } from "react";
import { OfficeTask, Character } from "../types";
import { 
  Plus, 
  Trash2, 
  User, 
  Tag, 
  CheckSquare, 
  Clock, 
  ArrowRight,
  ClipboardCheck,
  CheckCircle2
} from "lucide-react";

interface TaskBoardProps {
  tasks: OfficeTask[];
  characters: Character[];
  onAddTask: (title: string, description: string, assignee: string, priority: 'low' | 'medium' | 'high') => void;
  onUpdateTaskStatus: (taskId: string, newStatus: OfficeTask['status']) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskBoard({
  tasks,
  characters,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask
}: TaskBoardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAssignee, setNewAssignee] = useState("senior-dev");
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>("medium");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle, newDesc, newAssignee, newPriority);
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
  };

  const columns: { id: OfficeTask['status']; title: string; color: string; bg: string }[] = [
    { id: "todo", title: "📝 To Do", color: "text-blue-400 border-blue-500/20", bg: "bg-blue-950/10" },
    { id: "in_progress", title: "⚡ In Progress", color: "text-amber-400 border-amber-500/20", bg: "bg-amber-950/10" },
    { id: "review", title: "🔎 In Review", color: "text-purple-400 border-purple-500/20", bg: "bg-purple-950/10" },
    { id: "done", title: "✅ Completed", color: "text-emerald-400 border-emerald-500/20", bg: "bg-emerald-950/10" }
  ];

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "medium": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default: return "bg-gray-800 text-gray-400 border-gray-700/60";
    }
  };

  return (
    <div className="bg-[#0c111d] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col h-[520px]">
      {/* Board Header controls */}
      <div className="flex justify-between items-center mb-5 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-sm font-extrabold text-white tracking-wide">📊 บอร์ดแผนงานคุมงาน (Office Task Kanban)</h2>
          <p className="text-[10px] text-gray-400">สั่งงานพนักงาน กำหนดความสำคัญ และตรวจสอบความเคลื่อนไหวจากห้องโปรเจกต์</p>
        </div>
        
        <button
          id="btn-open-task-form"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>สั่งงานใหม่</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-950/90 border border-slate-800 p-4 rounded-xl mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">หัวข้องาน (Task Title)</label>
              <input
                id="task-form-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="เช่น Refactor dashboard query..."
                className="w-full bg-[#0d1321] border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-gray-200 outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">ผู้รับผิดชอบ (Assignee)</label>
              <select
                id="task-form-assignee"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full bg-[#0d1321] border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-gray-200 outline-none"
              >
                {characters.filter(c => c.id !== "user").map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">รายละเอียด (Description)</label>
            <textarea
              id="task-form-desc"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="เป้าหมายและข้อกำหนดสากล..."
              className="w-full h-16 bg-[#0d1321] border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-xs text-type-gray outline-none resize-none text-gray-200"
            />
          </div>

          <div className="flex justify-between items-center bg-[#070b13] p-2 rounded-lg">
            <div className="flex gap-2">
              <span className="text-[10px] text-gray-500 font-bold self-center">ความเร่งด่วน:</span>
              {['low', 'medium', 'high'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p as any)}
                  className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase border transition-all ${
                    newPriority === p 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                      : "bg-transparent text-gray-500 border-gray-800"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-[10px] text-gray-400 font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-1 bg-emerald-500 text-slate-950 hover:bg-emerald-600 rounded-lg text-[10px] font-bold"
              >
                บันทึกคำสั่ง
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Grid of columns */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 overflow-y-auto pr-1">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);

          return (
            <div key={col.id} className={`rounded-xl border border-gray-800 p-3 flex flex-col h-full bg-gray-950/40 relative shadow-inner`}>
              {/* Column Title */}
              <div className={`text-[10px] font-extrabold uppercase px-2 py-1 bg-gray-900 border border-gray-800 rounded-lg flex justify-between items-center mb-3`}>
                <span className={col.color}>{col.title}</span>
                <span className="text-gray-500 font-mono">({colTasks.length})</span>
              </div>

              {/* Tasks mapping */}
              <div className="flex-1 space-y-2.5 overflow-y-auto scrollbar-none">
                {colTasks.length === 0 ? (
                  <div className="h-20 border border-dashed border-gray-900 rounded-xl flex items-center justify-center text-center text-[10px] text-gray-600">
                    ไม่มีรายการ
                  </div>
                ) : (
                  colTasks.map(task => {
                    const assignee = characters.find(c => c.id === task.assignee);
                    
                    return (
                      <div
                        key={task.id}
                        className="bg-[#0e1422] border border-gray-800 rounded-xl p-3 shadow hover:border-gray-700 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className={`px-2 py-0.5 rounded border text-[8px] font-extrabold font-mono uppercase ${getPriorityColor(task.priority)}`}>
                            {task.priority || "medium"}
                          </span>
                          
                          <button
                            id={`btn-del-task-${task.id}`}
                            onClick={() => onDeleteTask(task.id)}
                            className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="text-[11px] font-bold text-gray-200 line-clamp-2 leading-tight mb-1">{task.title}</h4>
                        <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{task.description}</p>

                        <div className="border-t border-gray-900/60 pt-2 flex justify-between items-center">
                          {/* Assignee item */}
                          <div className="flex items-center gap-1">
                            <span className="text-[10px]">{assignee?.avatar || "👤"}</span>
                            <span className="text-[9px] text-gray-400 font-semibold">{assignee?.name || "Unassigned"}</span>
                          </div>

                          {/* Quick movement selectors */}
                          <div className="flex gap-0.5">
                            {col.id !== "done" && (
                              <button
                                id={`btn-move-task-${task.id}`}
                                onClick={() => {
                                  const statuses: OfficeTask['status'][] = ["todo", "in_progress", "review", "done"];
                                  const currentIdx = statuses.indexOf(task.status);
                                  if (currentIdx < statuses.length - 1) {
                                    onUpdateTaskStatus(task.id, statuses[currentIdx + 1]);
                                  }
                                }}
                                className="p-1 hover:bg-slate-800 rounded text-emerald-400 hover:text-white transition-colors"
                                title="ย้ายขั้นตอนถัดไป"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
