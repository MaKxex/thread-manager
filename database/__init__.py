import csv
from database.model import Todo, Catalog, Thread
import asyncio
# 0 - catalog name , 1 - color code , 2 - color name, 3 - color hex
origin = []


# with open('marathonVol3.csv', newline='') as csvfile:
#     spamreader = csv.reader(csvfile, delimiter=',')
#     for row in spamreader:
#         origin.append(row)


async def initDatabase():
    print("awdaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    # Открываем CSV-файл и читаем его
    with open(r'database/marathonVol3.csv', newline='\n') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',')
        next(spamreader)
        row = next(spamreader)
        print(row)
        catalog_name = row[0]
        await Catalog.objects().create(name=catalog_name)
        catalogf = await Catalog.objects().where(Catalog.name == catalog_name).first()
        number = int(row[1][7:])  # Предполагая, что второй столбец содержит числовое значение
        print(catalogf)
        await Thread.objects().create(number=number, catalog=catalogf.id)
        # Проходимся по каждой строке CSV и вставляем данные в соответствующую таблицу
        for row in spamreader:
            # Вставляем данные в таблицу Catalog

            # Вставляем данные в таблицу Thread
            number = int(row[1][7:])  # Предполагая, что второй столбец содержит числовое значение
            print(catalogf)

            
            Thread.objects().create(number=number, catalog=catalogf.id)

