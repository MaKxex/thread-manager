
from database.model import Todo, Thread, ThreadItem


async def addNewThreadItem(Thread:Thread, type:str) -> None:
    await ThreadItem.insert(
            ThreadItem(thread=Thread,
                       type=type)
            )


async def addNewTodo(text) -> None:
    await Todo.insert(
            Todo(text=text,
                 completed = False)
            )
    


