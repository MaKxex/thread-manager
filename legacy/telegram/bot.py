from aiogram import Bot, Dispatcher, executor, md, types
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.dispatcher import FSMContext
import re

from telegram.config import TOKEN
from telegram.keyboard import *
from telegram.text import *

api = Bot(token = TOKEN, parse_mode=types.ParseMode.MARKDOWN)
dp = Dispatcher(api, storage=MemoryStorage())

@dp.message_handler(commands=["start"])
async def start(message):
    message = await message.reply(text="asd", reply_markup = startPage_buttons)
    print("hello World")



@dp.callback_query_handler(text=["catalog"])
async def callback_handler(callback_query: types.CallbackQuery):

    await api.answer_callback_query(callback_query.id)

    message = callback_query.message
    chat_id = callback_query.message.chat.id


    await api.edit_message_text(text=catalogPage, chat_id=chat_id, message_id=message.message_id, reply_markup=CatalogList_buttons)

@dp.callback_query_handler(text=["todo"])
async def callback_handler(callback_query: types.CallbackQuery):

    await api.answer_callback_query(callback_query.id)

    message = callback_query.message
    chat_id = callback_query.message.chat.id


    await api.edit_message_text(text=catalogPage, chat_id=chat_id, message_id=message.message_id, reply_markup=CatalogList_buttons)

@dp.callback_query_handler(text=["start"])
async def callback_handler(callback_query: types.CallbackQuery):

    await api.answer_callback_query(callback_query.id)

    message = callback_query.message
    chat_id = callback_query.message.chat.id


    await api.edit_message_text(text=catalogPage, chat_id=chat_id, message_id=message.message_id, reply_markup=CatalogList_buttons)

@dp.callback_query_handler(text=["thread"])
async def callback_handler(callback_query: types.CallbackQuery):

    await api.answer_callback_query(callback_query.id)

    message = callback_query.message
    chat_id = callback_query.message.chat.id


    await api.edit_message_text(text=catalogPage, chat_id=chat_id, message_id=message.message_id, reply_markup=CatalogList_buttons)


def startTelegramPolling():
    executor.start_polling(dp, skip_updates=True)