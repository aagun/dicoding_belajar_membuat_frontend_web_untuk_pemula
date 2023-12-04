const todos = [];
const RENDER_EVENT = 'render-todo';
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';
const TOAST_TYPE = {
  success: 'check-button',
}

function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }

  return -1;
}

function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

function generateId() {
  return +new Date();
}

function generateTodoObject(id, task, timestamp, isCompleted) {
  return {
    id, task, timestamp, isCompleted
  }
}

function addTodo() {
  const textTodo = document.getElementById('title').value;
  const timestamp = document.getElementById('date').value;

  const generatedID = generateId();
  const todoObject = generateTodoObject(generatedID, textTodo, timestamp, false);
  todos.push(todoObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addTaskToCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (!todoTarget) return;

  todoTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeTaskFromCompleted(todoId) {
  const todoTarget = findTodoIndex(todoId);

  if (todoTarget === -1) return;

  todos.splice(todoTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeTodo(todoObject) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = todoObject.task;

  const textTimestamp = document.createElement('p');
  textTimestamp.innerText = todoObject.timestamp;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textTimestamp);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `todo-${todoObject.id}`);

  if (todoObject.isCompleted) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');

    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(todoObject.id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');

    trashButton.addEventListener('click', function () {
      removeTaskFromCompleted(todoObject.id);
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');

    checkButton.addEventListener('click', function () {
      addTaskToCompleted(todoObject.id);
    });

    container.append(checkButton);
  }

  return container;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function division(a, b) {
  return a / b;
}

function setDuration(millis) {
  return division(millis, 1_000);
}

function clearToast() {
  const toast = document.body.querySelector('.toast');
  if (toast) {
    toast.remove();
  }
}

function showToast(message = 'success', type = 'success', duration = 3000) {
  const icon = document.createElement('span');
  icon.classList.add(TOAST_TYPE[type]);

  const toastIcon = document.createElement('div');
  toastIcon.classList.add('toast-icon');
  toastIcon.append(icon);

  const toastMessage = document.createElement('div');
  toastMessage.classList.add('toast-message');
  toastMessage.innerText = message;

  const toastProgressBar = document.createElement('div');
  toastProgressBar.classList.add('toast-progress');
  toastProgressBar.style.animationDuration = `${setDuration(duration)}s`;

  const toastWrapper = document.createElement('div');
  toastWrapper.classList.add('toast-wrapper');

  const box = document.createElement('div');
  box.classList.add('toast', `toast-${type}`);
  box.append(toastIcon, toastMessage, toastProgressBar);

  clearToast();
  document.body.appendChild(box);
}

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('form');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addTodo();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedTODOList = document.getElementById('todos');
  uncompletedTODOList.innerHTML = '';

  const completedTODOList = document.getElementById('completed-todos');
  completedTODOList.innerHTML = '';

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (!todoItem.isCompleted) uncompletedTODOList.append(todoElement); else completedTODOList.append(todoElement);
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));

  showToast('Data todo list berhasil diperbaharui.', 'success', 5_000);
});
