from piccolo.columns import Boolean, Varchar, Integer, Text, ForeignKey
from piccolo.engine.sqlite import SQLiteEngine
from piccolo.table import Table
from piccolo.table import create_db_tables_sync
DB = SQLiteEngine("bd.sqlite")

class Todo(Table, db = DB):
    text = Text()
    completed = Boolean(default=False)

class Catalog(Table, db = DB):
    name = Varchar(unique = True)

class Thread(Table, db = DB):
    number = Integer(unique = True)
    catalog = ForeignKey(references=Catalog)
    hasBeen = Boolean(default=False)

class ThreadItem(Table, db = DB):
    thread = ForeignKey(references=Thread)
    type = Varchar(10)

    def __str__(self) -> str:
        return self.thread.number


#DB.create_tables(if_not_exists=True)

create_db_tables_sync(Todo, Catalog, Thread,ThreadItem, if_not_exists=True)
