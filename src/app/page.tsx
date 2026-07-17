'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Todo } from '@/utils/supabaseClient';
import {
  Check,
  Trash2,
  Edit2,
  Plus,
  LogOut,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  X,
  Sparkles,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Create Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');

  // Editing State
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editDueDate, setEditDueDate] = useState('');

  // Filter and Sort State
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date'>('created_at');

  const router = useRouter();

  // Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Fetch Todos
  const fetchTodos = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        showToast(error.message, 'error');
      } else {
        setTodos(data || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Auth Status Checker
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        fetchTodos(currentUser.id);
      }
    };
    checkAuth();
  }, [router, fetchTodos]);

  // Logout Handler
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Logged out successfully', 'success');
        router.push('/login');
        router.refresh();
      }
    } catch (err: any) {
      showToast(err.message || 'Logout failed', 'error');
    }
  };

  // Create Todo Handler
  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            description: description.trim() || null,
            priority,
            due_date: dueDate || null,
            is_completed: false,
          },
        ])
        .select();

      if (error) {
        showToast(error.message, 'error');
      } else if (data) {
        setTodos((prev) => [data[0], ...prev]);
        showToast('Task created successfully!', 'success');
        // Reset form
        setTitle('');
        setDescription('');
        setPriority('medium');
        setDueDate('');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating task', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Todo Completed Status
  const handleToggleComplete = async (todo: Todo) => {
    const targetStatus = !todo.is_completed;
    
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, is_completed: targetStatus } : t))
    );

    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: targetStatus })
        .eq('id', todo.id);

      if (error) {
        showToast(error.message, 'error');
        // Rollback state
        setTodos((prev) =>
          prev.map((t) => (t.id === todo.id ? { ...t, is_completed: todo.is_completed } : t))
        );
      } else {
        showToast(
          targetStatus ? 'Task marked as completed' : 'Task marked as active',
          'success'
        );
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating task', 'error');
      // Rollback state
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, is_completed: todo.is_completed } : t))
      );
    }
  };

  // Delete Todo
  const handleDeleteTodo = async (id: string) => {
    const originalTodos = [...todos];
    // Optimistic UI update
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);

      if (error) {
        showToast(error.message, 'error');
        // Rollback state
        setTodos(originalTodos);
      } else {
        showToast('Task deleted successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting task', 'error');
      // Rollback
      setTodos(originalTodos);
    }
  };

  // Start Edit Mode
  const startEdit = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditPriority(todo.priority);
    setEditDueDate(todo.due_date || '');
  };

  // Cancel Edit Mode
  const cancelEdit = () => {
    setEditingTodoId(null);
    setEditTitle('');
    setEditDescription('');
    setEditPriority('medium');
    setEditDueDate('');
  };

  // Submit Edit Todo
  const handleUpdateTodo = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      showToast('Task title is required', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('todos')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          priority: editPriority,
          due_date: editDueDate || null,
        })
        .eq('id', id);

      if (error) {
        showToast(error.message, 'error');
      } else {
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  title: editTitle.trim(),
                  description: editDescription.trim() || null,
                  priority: editPriority,
                  due_date: editDueDate || null,
                }
              : t
          )
        );
        showToast('Task updated successfully', 'success');
        setEditingTodoId(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating task', 'error');
    }
  };

  // Filtering and Sorting logic
  const filteredTodos = todos
    .filter((todo) => {
      // 1. Status Filter
      if (statusFilter === 'active') return !todo.is_completed;
      if (statusFilter === 'completed') return todo.is_completed;
      return true;
    })
    .filter((todo) => {
      // 2. Priority Filter
      if (priorityFilter === 'all') return true;
      return todo.priority === priorityFilter;
    })
    .sort((a, b) => {
      // 3. Sorting
      if (sortBy === 'due_date') {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      // default: created_at desc (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Check if a date is overdue
  const isOverdue = (dateString: string | null, isCompleted: boolean) => {
    if (!dateString || isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(dateString);
    dueDateObj.setHours(0, 0, 0, 0);
    return dueDateObj < today;
  };

  // Format date display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading || !user) {
    return (
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.5rem' }}>
          <div style={{ height: '40px', width: '200px' }} className="skeleton" />
          <div style={{ height: '40px', width: '150px' }} className="skeleton" />
        </div>
        <div style={{ height: '220px', width: '100%', marginBottom: '2rem' }} className="skeleton" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ height: '36px', width: '250px' }} className="skeleton" />
          <div style={{ height: '36px', width: '200px' }} className="skeleton" />
        </div>
        <div className="skeleton-item skeleton" />
        <div className="skeleton-item skeleton" />
        <div className="skeleton-item skeleton" />
      </div>
    );
  }

  return (
    <div className="container">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="dashboard-title-area">
          <h1 className="gradient-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListTodo size={28} style={{ color: 'var(--primary)' }} />
            Taskflow
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Keep track, organize, and accomplish your work</p>
        </div>
        <div className="dashboard-user">
          <span className="user-email">{user.email}</span>
          <button onClick={handleLogout} className="btn-icon danger" title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Todo Creation Card */}
      <section className="todo-form-card glass">
        <h2 className="todo-form-title">
          <Sparkles size={18} style={{ color: 'var(--primary)' }} />
          Create New Task
        </h2>
        <form onSubmit={handleCreateTodo}>
          <div className="form-group">
            <label className="form-label" htmlFor="todo-title">
              Task Title
            </label>
            <input
              id="todo-title"
              type="text"
              className="form-input"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={actionLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="todo-desc">
              Description (Optional)
            </label>
            <textarea
              id="todo-desc"
              className="form-input"
              style={{ minHeight: '80px', resize: 'vertical' }}
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={actionLoading}
            />
          </div>

          <div className="todo-form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="todo-priority">
                Priority
              </label>
              <select
                id="todo-priority"
                className="form-input form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                disabled={actionLoading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="todo-date">
                Due Date (Optional)
              </label>
              <input
                id="todo-date"
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={actionLoading}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary glow-primary"
                style={{ height: '42px', marginBottom: '1.25rem' }}
                disabled={actionLoading}
              >
                <Plus size={18} />
                Add Task
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Filter and Sort bar */}
      <section className="filter-bar">
        <div className="filter-tabs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
          >
            Completed
          </button>
        </div>

        <div className="filter-actions">
          <SlidersHorizontal size={16} style={{ color: 'var(--text-muted)' }} />
          
          <select
            className="filter-select"
            value={priorityFilter}
            aria-label="Filter by priority"
            onChange={(e) => setPriorityFilter(e.target.value as any)}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>

          <select
            className="filter-select"
            value={sortBy}
            aria-label="Sort tasks by"
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="created_at">Sort: Created Date</option>
            <option value="due_date">Sort: Due Date</option>
          </select>
        </div>
      </section>

      {/* Todos list */}
      <main>
        {filteredTodos.length === 0 ? (
          <div className="empty-state glass">
            <CheckCircle2 size={48} className="empty-state-icon" />
            <h3>No Tasks Found</h3>
            <p>
              {statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters to find tasks.'
                : 'Click "Add Task" above to create your first task flow.'}
            </p>
          </div>
        ) : (
          <div className="todo-list">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`todo-item glass ${todo.is_completed ? 'completed' : ''}`}
              >
                {editingTodoId === todo.id ? (
                  /* Edit Mode Interface */
                  <form
                    onSubmit={(e) => handleUpdateTodo(e, todo.id)}
                    className="todo-edit-form"
                  >
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Task title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        className="form-input"
                        style={{ minHeight: '60px', resize: 'vertical' }}
                        placeholder="Description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Priority</label>
                        <select
                          className="form-input form-select"
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value as any)}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Due Date</label>
                        <input
                          type="date"
                          className="form-input"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="todo-edit-actions">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="btn btn-outline"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', width: 'auto' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', width: 'auto' }}
                      >
                        Save Task
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Standard Mode Interface */
                  <>
                    <div className="todo-checkbox-wrapper">
                      <button
                        className={`custom-checkbox ${todo.is_completed ? 'checked' : ''}`}
                        onClick={() => handleToggleComplete(todo)}
                        aria-label={todo.is_completed ? 'Mark task active' : 'Mark task completed'}
                      >
                        <Check />
                      </button>
                    </div>
                    <div className="todo-content">
                      <h3 className="todo-title">{todo.title}</h3>
                      {todo.description && (
                        <p className="todo-description">{todo.description}</p>
                      )}
                      <div className="todo-meta">
                        <span className={`badge priority-${todo.priority}`}>
                          {todo.priority}
                        </span>
                        {todo.due_date && (
                          <span
                            className={`badge date-badge ${
                              isOverdue(todo.due_date, todo.is_completed) ? 'overdue' : ''
                            }`}
                          >
                            <Calendar size={12} />
                            {isOverdue(todo.due_date, todo.is_completed) ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                <AlertTriangle size={10} />
                                Overdue: {formatDate(todo.due_date)}
                              </span>
                            ) : (
                              formatDate(todo.due_date)
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="todo-actions">
                      <button
                        onClick={() => startEdit(todo)}
                        className="btn-icon"
                        title="Edit Task"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="btn-icon danger"
                        title="Delete Task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Toast Notification Containers */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast glass">
            {toast.type === 'error' ? (
              <AlertTriangle size={18} style={{ color: '#f87171' }} />
            ) : toast.type === 'info' ? (
              <Info size={18} style={{ color: '#38bdf8' }} />
            ) : (
              <CheckCircle2 size={18} style={{ color: '#34d399' }} />
            )}
            <span style={{ fontSize: '0.9rem' }}>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
