# myapp/mongo_helper.py

from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["neuroreads"]  # database name
collection = db["books"]   # collection name

# Functions to interact with MongoDB
def insert_book(title, author, pages):
    doc = {
        "title": title,
        "author": author,
        "pages": pages
    }
    result = collection.insert_one(doc)
    return result.inserted_id

def get_all_books():
    return list(collection.find())

def find_book_by_title(title):
    return collection.find_one({"title": title})
