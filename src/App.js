import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  });
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [selectedDay, setSelectedDay] = useState('monday');

  const days = [
    { key: 'monday', label: 'Monday', emoji: '🌅' },
    { key: 'tuesday', label: 'Tuesday', emoji: '☀️' },
    { key: 'wednesday', label: 'Wednesday', emoji: '🌤️' },
    { key: 'thursday', label: 'Thursday', emoji: '⛅' },
    { key: 'friday', label: 'Friday', emoji: '🌅' },
    { key: 'saturday', label: 'Saturday', emoji: '🎉' },
    { key: 'sunday', label: 'Sunday', emoji: '😴' }
  ];

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      day: selectedDay
    };
    
    setTodos(prev => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], newTodo]
    }));
    setInputValue('');
  };

  const toggleTodo = (id, day) => {
    setTodos(prev => ({
      ...prev,
      [day]: prev[day].map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    }));
  };

  const deleteTodo = (id, day) => {
    setTodos(prev => ({
      ...prev,
      [day]: prev[day].filter(todo => todo.id !== id)
    }));
  };

  const editTodo = (id, day, newText) => {
    if (newText.trim() === '') return;
    setTodos(prev => ({
      ...prev,
      [day]: prev[day].map(todo =>
        todo.id === id ? { ...todo, text: newText.trim() } : todo
      )
    }));
  };

  const clearCompleted = (day) => {
    setTodos(prev => ({
      ...prev,
      [day]: prev[day].filter(todo => !todo.completed)
    }));
  };

  const clearAllCompleted = () => {
    const newTodos = {};
    Object.keys(todos).forEach(day => {
      newTodos[day] = todos[day].filter(todo => !todo.completed);
    });
    setTodos(newTodos);
  };

  // Get all todos across all days for search and global stats
  const allTodos = Object.values(todos).flat();
  
  // Filter todos based on current filter and search term
  const filteredTodos = todos[selectedDay].filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && !todo.completed) ||
                         (filter === 'completed' && todo.completed);
    return matchesSearch && matchesFilter;
  });

  const activeTodos = todos[selectedDay].filter(todo => !todo.completed);
  const completedTodos = todos[selectedDay].filter(todo => todo.completed);

  // Get total stats across all days
  const totalActiveTodos = allTodos.filter(todo => !todo.completed).length;
  const totalCompletedTodos = allTodos.filter(todo => todo.completed).length;

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>✨ Weekly To-Do App</h1>
          <p>Organize your week, one day at a time</p>
        </header>

        {/* Day Tabs */}
        <div className="day-tabs">
          {days.map(day => (
            <button
              key={day.key}
              className={`day-tab ${selectedDay === day.key ? 'active' : ''}`}
              onClick={() => setSelectedDay(day.key)}
            >
              <span className="day-emoji">{day.emoji}</span>
              <span className="day-label">{day.label}</span>
              <span className="day-count">{todos[day.key].length}</span>
            </button>
          ))}
        </div>

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="add-todo-form">
          <div className="input-group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`What needs to be done on ${days.find(d => d.key === selectedDay)?.label}?`}
              className="todo-input"
            />
            <button type="submit" className="add-button">
              Add Task
            </button>
          </div>
        </form>

        {/* Search and Filter */}
        <div className="controls">
          <div className="search-box">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks..."
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({todos[selectedDay].length})
            </button>
            <button
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({activeTodos.length})
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({completedTodos.length})
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <p>No tasks found for {days.find(d => d.key === selectedDay)?.label}. Add a new task to get started!</p>
            </div>
          ) : (
            filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                day={selectedDay}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
              />
            ))
          )}
        </div>

        {/* Stats and Clear Buttons */}
        {allTodos.length > 0 && (
          <div className="stats">
            <div className="stats-left">
              <span className="day-stats">
                {days.find(d => d.key === selectedDay)?.label}: {activeTodos.length} tasks remaining
              </span>
              <span className="total-stats">
                Total: {totalActiveTodos} tasks remaining across all days
              </span>
            </div>
            <div className="stats-right">
              {completedTodos.length > 0 && (
                <button onClick={() => clearCompleted(selectedDay)} className="clear-completed">
                  Clear completed for {days.find(d => d.key === selectedDay)?.label}
                </button>
              )}
              {totalCompletedTodos > 0 && (
                <button onClick={clearAllCompleted} className="clear-all-completed">
                  Clear all completed
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Todo Item Component
function TodoItem({ todo, day, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.text);

  const handleEdit = () => {
    if (isEditing) {
      onEdit(todo.id, day, editValue);
      setIsEditing(false);
    } else {
      setIsEditing(true);
      setEditValue(todo.text);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(todo.text);
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-content">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id, day)}
          className="todo-checkbox"
        />
        
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleEdit}
            className="edit-input"
            autoFocus
          />
        ) : (
          <span className="todo-text">{todo.text}</span>
        )}
      </div>
      
      <div className="todo-actions">
        <button
          onClick={handleEdit}
          className="action-btn edit-btn"
          title="Edit task"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(todo.id, day)}
          className="action-btn delete-btn"
          title="Delete task"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

export default App;
