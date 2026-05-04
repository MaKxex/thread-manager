import csv
from database.model import Todo, Catalog, Thread
# 0 - catalog name , 1 - color code , 2 - color name, 3 - color hex


async def initDatabase():
    # Открываем CSV-файл и читаем его
    with open(r'database/marathonVol3.csv', newline='\n') as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',')
        next(spamreader)
        row = next(spamreader)
        print(row)
        catalog_name = row[0]
        await Catalog.objects().create(name=catalog_name)
        catalogf = await Catalog.objects().where(Catalog.name == catalog_name).first()
        number = int(row[1][7:])
        print(catalogf)
        await Thread.objects().create(number=number, catalog=catalogf.id)
        for row in spamreader:
            number = int(row[1][7:])
            print(catalogf)

            Thread.objects().create(number=number, catalog=catalogf.id)

