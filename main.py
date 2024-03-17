from database import select
from database import initDatabase
import asyncio


async def test():
    print(await select.ListCatalogs())
    print(await select.ListThreads())
    print(await select.ListThreadItems())
    print(await select.ListTodos())


asyncio.run(test())
#asyncio.run(initDatabase())