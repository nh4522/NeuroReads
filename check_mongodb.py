# check_mongodb.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from myapp.mongodb import mongodb
from pymongo import MongoClient

print("=== Django Settings ===")
from django.conf import settings
print(f"Host: {settings.MONGODB_CONFIG.get('host')}")
print(f"Port: {settings.MONGODB_CONFIG.get('port')}")
print(f"Database: {settings.MONGODB_CONFIG.get('database')}")

print("\n=== MongoDB Connection ===")
print(f"Connected to database: {mongodb.db.name}")
print(f"Connection string: {mongodb.client.address}")

print("\n=== All Databases ===")
db_list = mongodb.client.list_database_names()
for db in db_list:
    print(f"  - {db}")

print("\n=== Collections in 'neuroreads_db' ===")
collections = mongodb.db.list_collection_names()
print(f"Collections: {collections}")

print("\n=== User Count ===")
count = mongodb.db.users.count_documents({})
print(f"Total users: {count}")

print("\n=== All Users ===")
for user in mongodb.db.users.find():
    print(f"\nUser ID: {user['_id']}")
    print(f"Email: {user['email']}")
    print(f"Full Name: {user['full_name']}")
    print(f"Created: {user['created_at']}")

# ✅ REMOVED Django Auth Users section - we don't use it anymore
print("\n=== MongoDB Only - No SQLite Users ===")
print("✅ All users are stored in MongoDB only!")

# Show contact messages count
print(f"\n=== Contact Messages ===")
contacts_count = mongodb.db.contacts.count_documents({})
print(f"Total contact messages: {contacts_count}")

# Show neuroreads_users collection (if using MongoEngine)
print(f"\n=== NeuroReads Users (MongoEngine) ===")
neuroreads_count = mongodb.db.neuroreads_users.count_documents({})
print(f"NeuroReads users: {neuroreads_count}")