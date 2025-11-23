# myapp/mongodb.py - FIXED VERSION
from pymongo import MongoClient
from django.conf import settings

class MongoDB:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        try:
            # Connect directly to neuroreads_db database
            self.client = MongoClient('mongodb://localhost:27017/')
            self.db = self.client['neuroreads_db']  # ✅ Use your actual database name
            print(f"✅ Connected to MongoDB: neuroreads_db")
            
            # Test connection
            collections = self.db.list_collection_names()
            print(f"📚 Available collections: {collections}")
            
        except Exception as e:
            print(f"❌ MongoDB connection error: {e}")
            raise
    
    def get_collection(self, name):
        return self.db[name]

# ✅ This creates the 'mongodb' instance
mongodb = MongoDB()

# ✅ Add the get_database function that your views.py needs
def get_database():
    """
    Get MongoDB database connection - for compatibility with explore view
    """
    return mongodb.db