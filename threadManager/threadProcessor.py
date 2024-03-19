from database.model import Todo, Catalog, Thread, ThreadItem

async def ListTodos():
    todo = await Todo.objects()
    print("ListTodos")
    return todo

async def ListCatalogs():
    todo = await Catalog.objects()
    print("ListCatalogs")
    return todo

async def ListThreads():
    todo = await Thread.objects()
    print("ListThreads")
    return todo

async def ListThreadItems():
    todo = await ThreadItem.objects()
    print("ListThreadItems")
    return todo


async def addNewThreadItem(thread:Thread, type:str) -> None:
    await ThreadItem.insert(
            ThreadItem(thread=thread,
                       type=type)
            )

async def addNewTodo(text) -> None:
    await Todo.insert(
            Todo(text=text,
                 completed = False)
            )

async def deleteThreadItem(item_id: int) -> None:
    item = await ThreadItem.objects().get(id=item_id)
    await item.delete()

async def deleteTodo(todo_id: int) -> None:
    # Получаем задачу по ее идентификатору и удаляем ее из базы данных
    todo = await Todo.objects().get(id=todo_id)
    await todo.delete()


