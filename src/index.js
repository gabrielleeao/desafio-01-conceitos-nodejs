const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).json({error: "User not found!"});
  }

  request.user = user;

  return next();
}

function checksExistsTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "Todo not found!"});
  }

  return next();

}




app.post('/users', (request, response) => {

  const { name, username } = request.body;

  const UserAlreadyExists = users.some(
      (user) => user.username === username
  );

  if (UserAlreadyExists) {
      return response.status(400).json({error: "User already exists!"});
  }

  const user = {
    id: uuidv4(),
    name, 
    username, 
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.status(200).json(user.todos) 

});


app.get('/users', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(201).json(user);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = { 
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { title, deadline, done = false } = request.body;
  const { id } = request.params;

  const todo = user.todos.find((todo) => {
    if(todo.id === id) {
      todo.title = title;
      todo.deadline = deadline;
      todo.done = done;
      return todo;
  }});

  return response.status(201).json(todo);
;


});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;


  const todo = user.todos.find((todo) => {
      if(todo.id === id) {
        todo.done = true;
        return todo;
      }
  });

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todos = user.todos.filter((todo) => todo.id !== id);

  user.todos = todos;
 
  return response.status(204).json(user.todos);
  });

module.exports = app;