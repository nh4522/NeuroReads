# test_mongo_connection.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from myapp.mongodb import mongodb

try:
    # Test connection
    client = mongodb.client
    client.server_info()
    print("✓ MongoDB connection successful")
    
    # Check database
    db = mongodb.db
    print(f"✓ Database name: {db.name}")
    
    # Check collections
    collections = db.list_collection_names()
    print(f"✓ Collections: {collections}")
    
    # Try to insert test data
    test_collection = db['test_collection']
    result = test_collection.insert_one({'test': 'data'})
    print(f"✓ Test insert successful: {result.inserted_id}")
    
    # Clean up test
    test_collection.delete_one({'test': 'data'})
    print("✓ Test cleanup successful")
    
    # Check user_profiles collection
    profiles = db['user_profiles'].find()
    profile_count = db['user_profiles'].count_documents({})
    print(f"\n✓ User profiles count: {profile_count}")
    
    if profile_count > 0:
        print("\nUser profiles found:")
        for profile in db['user_profiles'].find():
            print(f"  - {profile}")
    else:
        print("\n⚠ No user profiles found in MongoDB")
    
except Exception as e:
    print(f"✗ Error: {str(e)}")