import React, { useState, useReducer, useMemo, useCallback } from 'react';
import { Plus, Edit2, Trash2, Check, X, Search, Filter, Calendar, Star, AlertCircle } from 'lucide-react';

// Types & Interfaces (Clean Code - Type Safety)
interface Task {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
    dueDate?: Date;
    tags: string[];
}

interface TaskState {
    tasks: Task[];
    filter: 'all' | 'active' | 'completed';
    searchQuery: string;
    selectedPriority: 'all' | 'low' | 'medium' | 'high';
}

// Action Types (Strategy Pattern)
type TaskAction =
    | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
    | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
    | { type: 'DELETE_TASK'; payload: string }
    | { type: 'TOGGLE_TASK'; payload: string }
    | { type: 'SET_FILTER'; payload: TaskState['filter'] }
    | { type: 'SET_SEARCH'; payload: string }
    | { type: 'SET_PRIORITY_FILTER'; payload: TaskState['selectedPriority'] }
    | { type: 'CLEAR_COMPLETED' };

// Data Structures & Algorithms - Task Management with efficient operations
class TaskManager {
    // Hash Map for O(1) task lookup
    private taskMap: Map<string, Task> = new Map();

    // Priority Queue simulation using arrays
    private priorityOrder = { high: 3, medium: 2, low: 1 };

    addTask(task: Task): void {
        this.taskMap.set(task.id, task);
    }

    updateTask(id: string, updates: Partial<Task>): Task | null {
        const task = this.taskMap.get(id);
        if (!task) return null;

        const updatedTask = { ...task, ...updates };
        this.taskMap.set(id, updatedTask);
        return updatedTask;
    }

    deleteTask(id: string): boolean {
        return this.taskMap.delete(id);
    }

    getAllTasks(): Task[] {
        return Array.from(this.taskMap.values());
    }

    // Binary Search-like filtering with multiple criteria
    filterTasks(
        tasks: Task[],
        filter: TaskState['filter'],
        searchQuery: string,
        priorityFilter: TaskState['selectedPriority']
    ): Task[] {
        return tasks
            .filter(task => {
                // Status filter
                if (filter === 'active' && task.completed) return false;
                if (filter === 'completed' && !task.completed) return false;

                // Search filter (case-insensitive)
                if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !task.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                }

                // Priority filter
                if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
                    return false;
                }

                return true;
            })
            // Sort by priority (high to low) then by creation date
            .sort((a, b) => {
                const priorityDiff = this.priorityOrder[b.priority] - this.priorityOrder[a.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
    }
}

// Singleton Pattern for Task Manager
const taskManager = new TaskManager();

// Reducer (Command Pattern)
function taskReducer(state: TaskState, action: TaskAction): TaskState {
    switch (action.type) {
        case 'ADD_TASK': {
            const newTask: Task = {
                ...action.payload,
                id: crypto.randomUUID(),
                createdAt: new Date()
            };
            taskManager.addTask(newTask);
            return {
                ...state,
                tasks: [...state.tasks, newTask]
            };
        }

        case 'UPDATE_TASK': {
            const updatedTask = taskManager.updateTask(action.payload.id, action.payload.updates);
            if (!updatedTask) return state;

            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === action.payload.id ? updatedTask : task
                )
            };
        }

        case 'DELETE_TASK': {
            taskManager.deleteTask(action.payload);
            return {
                ...state,
                tasks: state.tasks.filter(task => task.id !== action.payload)
            };
        }

        case 'TOGGLE_TASK': {
            const updatedTask = taskManager.updateTask(action.payload, {
                completed: !state.tasks.find(t => t.id === action.payload)?.completed
            });
            if (!updatedTask) return state;

            return {
                ...state,
                tasks: state.tasks.map(task =>
                    task.id === action.payload ? updatedTask : task
                )
            };
        }

        case 'SET_FILTER':
            return { ...state, filter: action.payload };

        case 'SET_SEARCH':
            return { ...state, searchQuery: action.payload };

        case 'SET_PRIORITY_FILTER':
            return { ...state, selectedPriority: action.payload };

        case 'CLEAR_COMPLETED':
            const activeTasks = state.tasks.filter(task => !task.completed);
            return { ...state, tasks: activeTasks };

        default:
            return state;
    }
}

// Custom Hook (Single Responsibility Principle)
function useTasks() {
    const [state, dispatch] = useReducer(taskReducer, {
        tasks: [],
        filter: 'all',
        searchQuery: '',
        selectedPriority: 'all'
    });

    const filteredTasks = useMemo(() => {
        return taskManager.filterTasks(
            state.tasks,
            state.filter,
            state.searchQuery,
            state.selectedPriority
        );
    }, [state.tasks, state.filter, state.searchQuery, state.selectedPriority]);

    const stats = useMemo(() => ({
        total: state.tasks.length,
        completed: state.tasks.filter(t => t.completed).length,
        active: state.tasks.filter(t => !t.completed).length,
        highPriority: state.tasks.filter(t => t.priority === 'high' && !t.completed).length
    }), [state.tasks]);

    return { state, dispatch, filteredTasks, stats };
}

// Factory Pattern for Task Creation
class TaskFactory {
    static createTask(
        title: string,
        description: string = '',
        priority: Task['priority'] = 'medium',
        dueDate?: Date,
        tags: string[] = []
    ): Omit<Task, 'id' | 'createdAt'> {
        return {
            title: title.trim(),
            description: description.trim(),
            completed: false,
            priority,
            dueDate,
            tags
        };
    }
}

// Components following SOLID principles

// Single Responsibility: Task Display Component
const TaskItem: React.FC<{
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, updates: Partial<Task>) => void;
}> = ({ task, onToggle, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description);

    const handleSave = useCallback(() => {
        if (editTitle.trim()) {
            onEdit(task.id, { title: editTitle.trim(), description: editDescription.trim() });
            setIsEditing(false);
        }
    }, [editTitle, editDescription, task.id, onEdit]);

    const handleCancel = useCallback(() => {
        setEditTitle(task.title);
        setEditDescription(task.description);
        setIsEditing(false);
    }, [task.title, task.description]);

    const priorityColors = {
        low: 'border-l-green-500 bg-green-50',
        medium: 'border-l-yellow-500 bg-yellow-50',
        high: 'border-l-red-500 bg-red-50'
    };

    const priorityIcons = {
        low: <div className="w-2 h-2 bg-green-500 rounded-full" />,
        medium: <div className="w-2 h-2 bg-yellow-500 rounded-full" />,
        high: <AlertCircle className="w-4 h-4 text-red-500" />
    };

    return (
        <div className={`border-l-4 p-4 bg-white rounded-lg shadow-sm transition-all duration-200 hover:shadow-md ${priorityColors[task.priority]} ${task.completed ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
                <button
                    onClick={() => onToggle(task.id)}
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${task.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                >
                    {task.completed && <Check className="w-3 h-3" />}
                </button>

                <div className="flex-1">
                    {isEditing ? (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Task title..."
                            />
                            <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                rows={2}
                                placeholder="Task description..."
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                {task.title}
                            </h3>
                            {task.description && (
                                <p className={`text-sm mt-1 ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                                    {task.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                {priorityIcons[task.priority]}
                                <span className="text-xs text-gray-500 capitalize">{task.priority}</span>
                                <span className="text-xs text-gray-400">
                                    {task.createdAt.toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <div className="flex gap-1">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(task.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Single Responsibility: Task Creation Component
const TaskForm: React.FC<{ onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void }> = ({ onAddTask }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('medium');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = useCallback(() => {
        if (title.trim()) {
            onAddTask(TaskFactory.createTask(title, description, priority));
            setTitle('');
            setDescription('');
            setPriority('medium');
            setIsExpanded(false);
        }
    }, [title, description, priority, onAddTask]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onFocus={() => setIsExpanded(true)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a new task..."
                    className="flex-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!title.trim()}
                    className="px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {isExpanded && (
                <div className="mt-3 space-y-3">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Task description (optional)..."
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                    />
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Task['priority'])}
                        className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                    </select>
                </div>
            )}
        </div>
    );
};

// Single Responsibility: Filters Component
const TaskFilters: React.FC<{
    filter: TaskState['filter'];
    searchQuery: string;
    selectedPriority: TaskState['selectedPriority'];
    onFilterChange: (filter: TaskState['filter']) => void;
    onSearchChange: (query: string) => void;
    onPriorityChange: (priority: TaskState['selectedPriority']) => void;
}> = ({ filter, searchQuery, selectedPriority, onFilterChange, onSearchChange, onPriorityChange }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    {(['all', 'active', 'completed'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => onFilterChange(f)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${filter === f
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                <select
                    value={selectedPriority}
                    onChange={(e) => onPriorityChange(e.target.value as TaskState['selectedPriority'])}
                    className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                </select>
            </div>
        </div>
    );
};

// Single Responsibility: Stats Component
const TaskStats: React.FC<{ stats: { total: number; completed: number; active: number; highPriority: number } }> = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{stats.active}</div>
                <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                <div className="text-sm text-gray-600">High Priority</div>
            </div>
        </div>
    );
};

// Main Component (Composition over Inheritance)
const TodoApp: React.FC = () => {
    const { state, dispatch, filteredTasks, stats } = useTasks();

    const handleAddTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
        dispatch({ type: 'ADD_TASK', payload: task });
    }, [dispatch]);

    const handleToggleTask = useCallback((id: string) => {
        dispatch({ type: 'TOGGLE_TASK', payload: id });
    }, [dispatch]);

    const handleDeleteTask = useCallback((id: string) => {
        dispatch({ type: 'DELETE_TASK', payload: id });
    }, [dispatch]);

    const handleEditTask = useCallback((id: string, updates: Partial<Task>) => {
        dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    }, [dispatch]);

    const handleClearCompleted = useCallback(() => {
        dispatch({ type: 'CLEAR_COMPLETED' });
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Advanced Todo App</h1>
                    <p className="text-gray-600">Stay organized with intelligent task management</p>
                </div>

                {/* Stats */}
                <TaskStats stats={stats} />

                {/* Task Form */}
                <TaskForm onAddTask={handleAddTask} />

                {/* Filters */}
                <TaskFilters
                    filter={state.filter}
                    searchQuery={state.searchQuery}
                    selectedPriority={state.selectedPriority}
                    onFilterChange={(filter) => dispatch({ type: 'SET_FILTER', payload: filter })}
                    onSearchChange={(query) => dispatch({ type: 'SET_SEARCH', payload: query })}
                    onPriorityChange={(priority) => dispatch({ type: 'SET_PRIORITY_FILTER', payload: priority })}
                />

                {/* Clear Completed Button */}
                {stats.completed > 0 && (
                    <div className="mb-6">
                        <button
                            onClick={handleClearCompleted}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                        >
                            Clear Completed ({stats.completed})
                        </button>
                    </div>
                )}

                {/* Tasks List */}
                <div className="space-y-3">
                    {filteredTasks.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-lg">
                                {state.tasks.length === 0 ? 'No tasks yet. Add one above!' : 'No tasks match your filters.'}
                            </div>
                        </div>
                    ) : (
                        filteredTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggle={handleToggleTask}
                                onDelete={handleDeleteTask}
                                onEdit={handleEditTask}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodoApp;