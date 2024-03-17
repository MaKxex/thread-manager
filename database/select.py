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

