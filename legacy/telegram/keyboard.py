from aiogram.types import InlineKeyboardMarkup, KeyboardButton
from telegram.text import *




def startPage_buttons() -> InlineKeyboardMarkup:
    markup = InlineKeyboardMarkup(resize_keyboard=True)
    markup.insert(KeyboardButton(text=threadTextButton, callback_data=f"catalog"))
    markup.insert(KeyboardButton(text=todoListButton, callback_data=f"todo"))
    return markup


def TodoList_buttons() -> InlineKeyboardMarkup:
    markup = InlineKeyboardMarkup(resize_keyboard=True)
    markup.insert(KeyboardButton(text=backToButton, callback_data=f"start"))
    return markup


def CatalogList_buttons() -> InlineKeyboardMarkup:
    markup = InlineKeyboardMarkup(resize_keyboard=True)
    markup.insert(KeyboardButton(text=backToButton, callback_data=f"start"))
    return markup


def ThreadList_buttons() -> InlineKeyboardMarkup:
    markup = InlineKeyboardMarkup(resize_keyboard=True)
    markup.insert(KeyboardButton(text=backToButton, callback_data=f"catalog"))
    return markup


def ThreadDetail_buttons() -> InlineKeyboardMarkup:
    markup = InlineKeyboardMarkup(resize_keyboard=True)
    markup.insert(KeyboardButton(text=plusOne, callback_data=f"plusOne"))
    markup.insert(KeyboardButton(text=minusOne, callback_data=f"minusOne"))
    markup.insert(KeyboardButton(text=plusOneBig, callback_data=f"plusOneBig"))
    markup.insert(KeyboardButton(text=minusOneBig, callback_data=f"minusOneBig"))
    markup.insert(KeyboardButton(text=backToButton, callback_data=f"thread"))
    return markup










