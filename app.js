const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const { format, isValid } = require("date-fns");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const convertDBObjectToResponseObject = (DBObject) => {
  return {
    id: DBObject.id,
    todo: DBObject.todo,
    priority: DBObject.priority,
    status: DBObject.status,
    category: DBObject.category,
    dueDate: DBObject.due_date,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const validatePriority = (requestQuery) => {
  if (
    requestQuery.priority === "HIGH" ||
    requestQuery.priority === "MEDIUM" ||
    requestQuery.priority === "LOW"
  ) {
    return true;
  } else {
    return false;
  }
};

const validateStatus = (requestQuery) => {
  if (
    requestQuery.status === "TO DO" ||
    requestQuery.status === "IN PROGRESS" ||
    requestQuery.status === "DONE"
  ) {
    return true;
  } else {
    return false;
  }
};

const validateCategory = (requestQuery) => {
  if (
    requestQuery.category === "WORK" ||
    requestQuery.category === "HOME" ||
    requestQuery.category === "LEARNING"
  ) {
    return true;
  } else {
    return false;
  }
};

const hasPriorityAndCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined &&
    requestQuery.category !== undefined &&
    requestQuery.status !== undefined
  );
};

const hasPriorityAndCategory = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};

const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const validateDate = (date) => {
  const newDate = new Date(date);
  const validateDate = isValid(newDate);
  if (validateDate) {
    return true;
  } else {
    return false;
  }
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, category, status } = request.query;
  let isPriority;
  let isStatus;
  let isCategory;
  let getTODOQuery = ``;
  let todo = null;
  switch (true) {
    case hasPriorityAndCategoryAndStatus(request.query):
      isPriority = validatePriority(request.query);
      isCategory = validateCategory(request.query);
      isStatus = validateStatus(request.query);
      if (isCategory && isPriority && isStatus) {
        getTODOQuery = `
            SELECT * 
            FROM todo 
            WHERE todo LIKE '%${search_q}%'
              and priority = '${priority}'
              and category = '${category}'
              and status = '${status}';`;
        todo = await db.all(getTODOQuery);
        response.send(
          todo.map((eachTODO) => convertDBObjectToResponseObject(eachTODO))
        );
      } else {
        if (isStatus) {
          response.status(400);
          response.send("Invalid Todo Status");
        } else if (isPriority) {
          response.status(400);
          response.send("Invalid Todo Priority");
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      }
      break;
    case hasPriorityAndCategory(request.query):
      isPriority = validatePriority(request.query);
      isCategory = validateCategory(request.query);
      if (isCategory && isPriority) {
        getTODOQuery = `
            SELECT * 
            FROM todo 
            WHERE todo LIKE '%${search_q}%'
              and priority = '${priority}'
              and category = '${category}';`;
        todo = await db.all(getTODOQuery);
        response.send(
          todo.map((eachTODO) => convertDBObjectToResponseObject(eachTODO))
        );
      } else {
        if (isPriority) {
          response.status(400);
          response.send("Invalid Todo Priority");
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      }
      break;
    case hasPriorityAndStatus(request.query):
      isPriority = validatePriority(request.query);
      isStatus = validateStatus(request.query);
      if (isPriority && isStatus) {
        getTODOQuery = `
            SELECT * 
            FROM todo 
            WHERE todo LIKE '%${search_q}%'
              and priority = '${priority}'
              and status = '${status}';`;
        todo = await db.all(getTODOQuery);
        response.send(
          todo.map((eachTODO) => convertDBObjectToResponseObject(eachTODO))
        );
      } else {
        if (isStatus) {
          response.status(400);
          response.send("Invalid Todo Status");
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      }
      break;
    case hasCategoryAndStatus(request.query):
      isCategory = validateCategory(request.query);
      isStatus = validateStatus(request.query);
      if (isCategory && isStatus) {
        getTODOQuery = `
            SELECT * 
            FROM todo 
            WHERE todo LIKE '%${search_q}%'
              and category = '${category}'
              and status = '${status}';`;
        todo = await db.all(getTODOQuery);
        response.send(
          todo.map((eachTODO) => convertDBObjectToResponseObject(eachTODO))
        );
      } else {
        if (isStatus) {
          response.status(400);
          response.send("Invalid Todo Status");
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      }
      break;
    case hasCategory(request.query):
      isCategory = validateCategory(request.query);
      if (isCategory) {
        getTODOQuery = `
            SELECT * 
            FROM todo 
            WHERE todo LIKE '%${search_q}%'
              and category = '${category}';`;
        todo = await db.all(getTODOQuery);
        response.send(
          todo.map((eachTODO) => convertDBObjectToResponseObject(eachTODO))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasStatus(request.query):
      isStatus = validateStatus(request.query);
      if (isStatus) {
        getTODOQuery = `
            SELECT * 
            FROM todo 
            WHERE todo LIKE '%${search_q}%'
              and status = '${status}';`;
        todo = await db.all(getTODOQuery);
        response.send(
          todo.map((eachTODO) => convertDBObjectToResponseObject(eachTODO))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasPriority(request.query):
      isPriority = validatePriority(request.query);
      if (isPriority) {
        getTODOQuery = `
            SELECT * 
            FROM todo 
            WHERE todo LIKE '%${search_q}%'
              and priority = '${priority}';`;
        todo = await db.all(getTODOQuery);
        response.send(
          todo.map((eachTODO) => convertDBObjectToResponseObject(eachTODO))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    default:
      getTODOQuery = `
            SELECT * 
            FROM todo 
            WHERE todo LIKE '%${search_q}%';`;
      todo = await db.all(getTODOQuery);
      response.send(
        todo.map((eachTODO) => convertDBObjectToResponseObject(eachTODO))
      );
      break;
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTODOQuery = `
    SELECT * 
    FROM todo 
    WHERE id = ${todoId};`;
  const todo = await db.get(getTODOQuery);
  response.send(convertDBObjectToResponseObject(todo));
});

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const isDateValid = validateDate(date);
  if (isDateValid === true) {
    const formatDate = format(new Date(date), "yyyy-MM-dd");
    const getTodoQuery = `
    SELECT * 
    FROM todo 
    WHERE due_date = '${formatDate}';`;
    const todo = await db.all(getTodoQuery);
    response.send(
      todo.map((eachTodo) => convertDBObjectToResponseObject(eachTodo))
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const isPriority = validatePriority(request.body);
  const isStatus = validateStatus(request.body);
  const isCategory = validateCategory(request.body);
  const isDate = validateDate(dueDate);
  if (isCategory && isPriority && isStatus && isDate) {
    const addTODOQuery = `
    INSERT INTO 
    todo (id, todo, priority, status, category, due_date)
    VALUES (${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`;
    await db.run(addTODOQuery);
    response.send("Todo Successfully Added");
  } else {
    if (!isCategory) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else if (!isPriority) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else if (!isStatus) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (!isDate) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  let isStatus;
  let isPriority;
  let isCategory;
  let isDate;
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      isStatus = validateStatus(requestBody);
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      isPriority = validatePriority(requestBody);
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
    case requestBody.category !== undefined:
      updateColumn = "Category";
      isCategory = validateCategory(requestBody);
      break;
    case requestBody.dueDate !== undefined:
      updateColumn = "Due Date";
      const { dueDate } = requestBody;
      isDate = validateDate(dueDate);
      break;
  }
  if (isCategory || isPriority || isStatus || isDate) {
    const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
    const previousTodo = await db.get(previousTodoQuery);

    const {
      todo = previousTodo.todo,
      priority = previousTodo.priority,
      status = previousTodo.status,
      category = previousTodo.category,
      dueDate = previousTodo.due_date,
    } = request.body;

    const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${dueDate}'
    WHERE
      id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);
  } else if (updateColumn === "Todo") {
    const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
    const previousTodo = await db.get(previousTodoQuery);

    const {
      todo = previousTodo.todo,
      priority = previousTodo.priority,
      status = previousTodo.status,
      category = previousTodo.category,
      dueDate = previousTodo.due_date,
    } = request.body;

    const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date ='${dueDate}'
    WHERE
      id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send(`${updateColumn} Updated`);
  } else {
    if (updateColumn === "Due Date") {
      response.status(400);
      response.send("Invalid Due Date");
    } else {
      response.status(400);
      response.send(`Invalid Todo ${updateColumn}`);
    }
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
