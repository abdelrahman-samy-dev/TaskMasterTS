# TaskMasterTS - Advanced Todo Application

## 🚀 Overview
A sophisticated Todo application built with React and TypeScript, implementing software engineering best practices and modern architectural patterns.

## 🎯 Key Features
- ✅ Task management with multiple priority levels
- 🔍 Advanced search and filtering capabilities
- 📊 Real-time task statistics
- 🎨 Modern and interactive design
- 📱 Responsive design for all devices
- ⚡ Optimized performance with best practices

## 🛠️ Tech Stack

### Frontend Framework & Libraries
- **React 18** - Core UI library
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library

### React Hooks Utilized
- `useState` - Local state management
- `useReducer` - Complex state management
- `useMemo` - Performance optimization and memoization
- `useCallback` - Preventing unnecessary re-renders

## 🏗️ Data Structures & Algorithms Implementation

### 1. Hash Map (Task Mapping)
```typescript
private taskMap: Map<string, Task> = new Map();
```
- **Purpose**: O(1) fast task lookup
- **Benefit**: Accelerates task finding and updating operations

### 2. Priority Queue Simulation
```typescript
private priorityOrder = { high: 3, medium: 2, low: 1 };
```
- **Purpose**: Task ordering by priority
- **Benefit**: Display high-priority tasks first

### 3. Multi-Criteria Filtering Algorithm
```typescript
filterTasks(tasks, filter, searchQuery, priorityFilter)
```
- **Purpose**: Efficient multi-criteria filtering
- **Complexity**: O(n log n) for filtering and sorting

### 4. Binary Search-like Operations
- Fast filtering using multiple predicates
- Advanced sorting by priority and date

## 🎯 SOLID Principles Implementation

### 1. Single Responsibility Principle (SRP)
```typescript
// Each component has a single responsibility
const TaskItem = () => {} // Display task only
const TaskForm = () => {} // Create tasks only
const TaskFilters = () => {} // Filtering only
const TaskStats = () => {} // Statistics only
```

### 2. Open/Closed Principle (OCP)
```typescript
// TaskAction types are extensible without modifying existing code
type TaskAction = 
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  // New types can be added without modifying existing ones
```

### 3. Liskov Substitution Principle (LSP)
```typescript
// All Task components are substitutable with the base interface
interface Task {
  id: string;
  title: string;
  // ... other properties
}
```

### 4. Interface Segregation Principle (ISP)
```typescript
// Small, specific interfaces
interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: Partial<Task>) => void;
}
```

### 5. Dependency Inversion Principle (DIP)
```typescript
// Components depend on abstractions, not concrete implementations
const TaskForm: React.FC<{ onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void }>
```

## 🎨 Design Patterns Used

### 1. Factory Pattern
```typescript
class TaskFactory {
  static createTask(title, description, priority, dueDate, tags) {
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
```
- **Purpose**: Consistent and unified Task object creation

### 2. Singleton Pattern
```typescript
const taskManager = new TaskManager();
```
- **Purpose**: Ensure single instance of TaskManager

### 3. Command Pattern
```typescript
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK':
    case 'UPDATE_TASK':
    case 'DELETE_TASK':
    // ...
  }
}
```
- **Purpose**: Encapsulate operations in executable and reversible commands

### 4. Strategy Pattern
```typescript
type TaskAction = 
  | { type: 'ADD_TASK'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  // ...
```
- **Purpose**: Define algorithm families and use them interchangeably

### 5. Observer Pattern (via React Hooks)
```typescript
const { state, dispatch, filteredTasks, stats } = useTasks();
```
- **Purpose**: Automatically notify components of state changes

## 🧼 Clean Code Principles

### 1. Meaningful Names
```typescript
// Clear and expressive names
const handleToggleTask = useCallback((id: string) => {
  dispatch({ type: 'TOGGLE_TASK', payload: id });
}, [dispatch]);
```

### 2. Small Functions
```typescript
// Small, focused functions
const handleSave = useCallback(() => {
  if (editTitle.trim()) {
    onEdit(task.id, { title: editTitle.trim(), description: editDescription.trim() });
    setIsEditing(false);
  }
}, [editTitle, editDescription, task.id, onEdit]);
```

### 3. No Side Effects
```typescript
// Pure functions without side effects
const filteredTasks = useMemo(() => {
  return taskManager.filterTasks(
    state.tasks,
    state.filter,
    state.searchQuery,
    state.selectedPriority
  );
}, [state.tasks, state.filter, state.searchQuery, state.selectedPriority]);
```

### 4. DRY Principle
```typescript
// Don't Repeat Yourself - using Factory Pattern
const newTask = TaskFactory.createTask(title, description, priority);
```

## 🎨 UI/UX Features

### 1. Responsive Design
- Tailwind CSS Grid and Flexbox implementation
- Mobile-first responsive design for all screen sizes

### 2. Interactive Elements
- Smooth hover effects and transitions
- Visual feedback for user actions
- Interactive icons and buttons

### 3. Color Coding
```typescript
const priorityColors = {
  low: 'border-l-green-500 bg-green-50',
  medium: 'border-l-yellow-500 bg-yellow-50',
  high: 'border-l-red-500 bg-red-50'
};
```

### 4. Modern Styling
- Gradients and shadows implementation
- Material Design inspired components
- Clear typography hierarchy

## 🚀 Performance Optimizations

### 1. Memoization
```typescript
const filteredTasks = useMemo(() => {
  // expensive filtering operation
}, [dependencies]);
```

### 2. Callback Optimization
```typescript
const handleToggleTask = useCallback((id: string) => {
  // stable reference
}, [dispatch]);
```

### 3. Efficient Data Structures
- Map usage for O(1) fast lookups
- Avoiding unnecessary operations

## 📊 App Statistics
- **Total Tasks**: Count of all tasks
- **Completed Tasks**: Finished tasks
- **Active Tasks**: Incomplete tasks
- **High Priority Tasks**: Important incomplete tasks

## 🔧 Core Features

### Task Management
- ✅ Add new tasks
- ✏️ Edit existing tasks
- 🗑️ Delete tasks
- ☑️ Mark tasks as complete

### Advanced Filtering
- 🔍 Text search
- 📊 Filter by status (All/Active/Completed)
- 🎯 Filter by priority
- 🧹 Clear completed tasks

### Priority System
- 🔴 High Priority
- 🟡 Medium Priority
- 🟢 Low Priority

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/abdelrahman-samy-dev/TaskMasterTS.git

# Navigate to project directory
cd TaskMasterTS

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
```

## 🎯 Future Enhancements

1. **Local Storage Integration**
   - Save tasks in browser storage
   - Persist tasks on page reload

2. **Drag & Drop**
   - Reorder tasks
   - Change priority with drag and drop

3. **Categories & Tags**
   - Task categorization
   - Tag system implementation

4. **Due Dates**
   - Task deadlines
   - Overdue task notifications

5. **Dark Mode**
   - Theme switching
   - User preference persistence

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Abdelrahman Samy Ali**
- GitHub: [@abdelrahman-samy-dev](https://github.com/abdelrahman-samy-dev)
- LinkedIn: [Abdelrahman Samy](https://linkedin.com/in/abdelrahman-samy-dev)
- Email: abdelrahman.samy.dev@outlook.com

## 🏆 Key Achievements

This application demonstrates best practices in:
- **Software Architecture**: SOLID principles and Design Patterns
- **Performance**: Optimized Data Structures and Algorithms
- **Code Quality**: Clean Code principles
- **User Experience**: Modern and interactive UI/UX
- **Maintainability**: Organized and extensible code

---

⭐ **Star this repository if you find it helpful!**