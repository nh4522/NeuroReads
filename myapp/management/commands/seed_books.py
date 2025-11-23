# myapp/management/commands/seed_books.py
from django.core.management.base import BaseCommand
from myapp.mongodb import mongodb
from bson import ObjectId
import json

class Command(BaseCommand):
    help = 'Clean books collection and insert properly structured book data'

    def handle(self, *args, **options):
        books_collection = mongodb.get_collection('books')
        
        # 1. Remove all previous documents
        self.stdout.write('🗑️  Removing all previous books...')
        result = books_collection.delete_many({})
        self.stdout.write(f'✅ Removed {result.deleted_count} previous books')
        
        # 2. Insert new properly structured documents
        self.stdout.write('📚 Inserting new books with proper structure...')
        
        books_data = [
            {
                "_id": ObjectId("6910830325ac5b4a67dc9046"),
                "title": "The Midnight Library",
                "author": "Matt Haig",
                "cover_image": "/static/myapp/images/bookCover/the_midnight_library_matt_haig.jpg",
                "category": "bestseller",
                "genre": ["Fiction", "Fantasy"],
                "description": "A novel about a library that contains books that let you experience the lives you might have lived.",
                "language": "English",
                "average_rating": 4.2,
                "views_count": 1500,
                "publication_year": 2020,
                "isbn": "9780525559474",
                "pages": 304,
                "publisher": "Viking"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9047"),
                "title": "To Kill a Mockingbird",
                "author": "Harper Lee",
                "cover_image": "/static/myapp/images/bookCover/to_kill_a_mockingbird.jpg",
                "category": "classic",
                "genre": ["Fiction", "Classic"],
                "description": "A novel about racial inequality and moral growth in the American South.",
                "language": "English",
                "average_rating": 4.8,
                "views_count": 5000,
                "publication_year": 1960,
                "isbn": "9780061120084",
                "pages": 324,
                "publisher": "J.B. Lippincott & Co."
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9048"),
                "title": "Sapiens: A Brief History of Humankind",
                "author": "Yuval Noah Harari",
                "cover_image": "/static/myapp/images/bookCover/sapiens.jpg",
                "category": "bestseller",
                "genre": ["Non-Fiction", "History", "Science"],
                "description": "Explores the history and impact of Homo sapiens from the Stone Age to the 21st century.",
                "language": "English",
                "average_rating": 4.5,
                "views_count": 3000,
                "publication_year": 2014,
                "isbn": "9780062316097",
                "pages": 443,
                "publisher": "Harper"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9049"),
                "title": "The Alchemist",
                "author": "Paulo Coelho",
                "cover_image": "/static/myapp/images/bookCover/the_alchemist.jpg",
                "category": "bestseller",
                "genre": ["Fiction", "Adventure", "Fantasy"],
                "description": "A mystical story of a shepherd boy's journey to find his personal legend.",
                "language": "English",
                "average_rating": 4.7,
                "views_count": 4000,
                "publication_year": 1988,
                "isbn": "9780061122415",
                "pages": 208,
                "publisher": "HarperOne"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9050"),
                "title": "1984",
                "author": "George Orwell",
                "cover_image": "/static/myapp/images/bookCover/1984.jpg",
                "category": "classic",
                "genre": ["Fiction", "Dystopian", "Science Fiction"],
                "description": "A dystopian social science fiction novel about totalitarian control.",
                "language": "English",
                "average_rating": 4.6,
                "views_count": 4500,
                "publication_year": 1949,
                "isbn": "9780451524935",
                "pages": 328,
                "publisher": "Secker & Warburg"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9051"),
                "title": "Pride and Prejudice",
                "author": "Jane Austen",
                "cover_image": "/static/myapp/images/bookCover/pride_and_prejudice.jpg",
                "category": "classic",
                "genre": ["Fiction", "Romance", "Classic"],
                "description": "A romantic novel of manners that depicts the emotional development of protagonist Elizabeth Bennet.",
                "language": "English",
                "average_rating": 4.7,
                "views_count": 3500,
                "publication_year": 1813,
                "isbn": "9780141439518",
                "pages": 432,
                "publisher": "T. Egerton"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9052"),
                "title": "The Great Gatsby",
                "author": "F. Scott Fitzgerald",
                "cover_image": "/static/myapp/images/bookCover/the_great_gatsby.jpg",
                "category": "classic",
                "genre": ["Fiction", "Classic"],
                "description": "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
                "language": "English",
                "average_rating": 4.5,
                "views_count": 3800,
                "publication_year": 1925,
                "isbn": "9780743273565",
                "pages": 180,
                "publisher": "Charles Scribner's Sons"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9053"),
                "title": "Harry Potter and the Philosopher's Stone",
                "author": "J.K. Rowling",
                "cover_image": "/static/myapp/images/bookCover/harry_potter_philosophers_stone.jpg",
                "category": "featured",
                "genre": ["Fiction", "Fantasy", "Young Adult"],
                "description": "The first novel in the Harry Potter series following Harry Potter, a young wizard.",
                "language": "English",
                "average_rating": 4.9,
                "views_count": 6000,
                "publication_year": 1997,
                "isbn": "9780747532699",
                "pages": 223,
                "publisher": "Bloomsbury"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9054"),
                "title": "The Hobbit",
                "author": "J.R.R. Tolkien",
                "cover_image": "/static/myapp/images/bookCover/the_hobbit.jpg",
                "category": "classic",
                "genre": ["Fiction", "Fantasy", "Adventure"],
                "description": "A fantasy novel about the adventures of hobbit Bilbo Baggins.",
                "language": "English",
                "average_rating": 4.8,
                "views_count": 4200,
                "publication_year": 1937,
                "isbn": "9780547928227",
                "pages": 310,
                "publisher": "George Allen & Unwin"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9055"),
                "title": "The Da Vinci Code",
                "author": "Dan Brown",
                "cover_image": "/static/myapp/images/bookCover/the_da_vinci_code.jpg",
                "category": "bestseller",
                "genre": ["Fiction", "Mystery", "Thriller"],
                "description": "A mystery thriller novel about a conspiracy within the Catholic Church.",
                "language": "English",
                "average_rating": 4.3,
                "views_count": 2800,
                "publication_year": 2003,
                "isbn": "9780307474278",
                "pages": 489,
                "publisher": "Doubleday"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9056"),
                "title": "The Catcher in the Rye",
                "author": "J.D. Salinger",
                "cover_image": "/static/myapp/images/bookCover/the_catcher_in_the_rye.jpg",
                "category": "classic",
                "genre": ["Fiction", "Classic"],
                "description": "A story about teenage rebellion and alienation narrated by protagonist Holden Caulfield.",
                "language": "English",
                "average_rating": 4.4,
                "views_count": 3200,
                "publication_year": 1951,
                "isbn": "9780316769174",
                "pages": 234,
                "publisher": "Little, Brown and Company"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9057"),
                "title": "The Lord of the Rings",
                "author": "J.R.R. Tolkien",
                "cover_image": "/static/myapp/images/bookCover/lord_of_the_rings.jpg",
                "category": "classic",
                "genre": ["Fiction", "Fantasy", "Adventure"],
                "description": "An epic high fantasy novel about the quest to destroy the One Ring.",
                "language": "English",
                "average_rating": 4.9,
                "views_count": 5500,
                "publication_year": 1954,
                "isbn": "9780544003415",
                "pages": 1178,
                "publisher": "George Allen & Unwin"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9058"),
                "title": "The Kite Runner",
                "author": "Khaled Hosseini",
                "cover_image": "/static/myapp/images/bookCover/the_kite_runner.jpg",
                "category": "bestseller",
                "genre": ["Fiction", "Drama"],
                "description": "A story of friendship, betrayal, and redemption set in Afghanistan.",
                "language": "English",
                "average_rating": 4.6,
                "views_count": 2700,
                "publication_year": 2003,
                "isbn": "9781594631931",
                "pages": 371,
                "publisher": "Riverhead Books"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9059"),
                "title": "The Hunger Games",
                "author": "Suzanne Collins",
                "cover_image": "/static/myapp/images/bookCover/the_hunger_games.jpg",
                "category": "featured",
                "genre": ["Fiction", "Dystopian", "Young Adult"],
                "description": "A dystopian novel set in a post-apocalyptic nation called Panem.",
                "language": "English",
                "average_rating": 4.7,
                "views_count": 4800,
                "publication_year": 2008,
                "isbn": "9780439023481",
                "pages": 374,
                "publisher": "Scholastic"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9060"),
                "title": "The Girl on the Train",
                "author": "Paula Hawkins",
                "cover_image": "/static/myapp/images/bookCover/the_girl_on_the_train.jpg",
                "category": "new",
                "genre": ["Fiction", "Mystery", "Thriller"],
                "description": "A psychological thriller about a woman who becomes entangled in a missing persons investigation.",
                "language": "English",
                "average_rating": 4.1,
                "views_count": 2200,
                "publication_year": 2015,
                "isbn": "9781594633669",
                "pages": 336,
                "publisher": "Riverhead Books"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9061"),
                "title": "Gone Girl",
                "author": "Gillian Flynn",
                "cover_image": "/static/myapp/images/bookCover/gone_girl.jpg",
                "category": "bestseller",
                "genre": ["Fiction", "Mystery", "Thriller"],
                "description": "A psychological thriller about the disappearance of Amy Dunne.",
                "language": "English",
                "average_rating": 4.4,
                "views_count": 3100,
                "publication_year": 2012,
                "isbn": "9780307588371",
                "pages": 415,
                "publisher": "Crown Publishing Group"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9062"),
                "title": "The Silent Patient",
                "author": "Alex Michaelides",
                "cover_image": "/static/myapp/images/bookCover/the_silent_patient.jpg",
                "category": "new",
                "genre": ["Fiction", "Mystery", "Thriller"],
                "description": "A psychological thriller about a woman who shoots her husband and then stops speaking.",
                "language": "English",
                "average_rating": 4.5,
                "views_count": 1900,
                "publication_year": 2019,
                "isbn": "9781250301697",
                "pages": 323,
                "publisher": "Celadon Books"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9063"),
                "title": "Educated",
                "author": "Tara Westover",
                "cover_image": "/static/myapp/images/bookCover/educated.jpg",
                "category": "bestseller",
                "genre": ["Non-Fiction", "Memoir", "Biography"],
                "description": "A memoir about a woman who grows up in a survivalist family and eventually earns a PhD.",
                "language": "English",
                "average_rating": 4.7,
                "views_count": 2600,
                "publication_year": 2018,
                "isbn": "9780399590504",
                "pages": 334,
                "publisher": "Random House"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9064"),
                "title": "Where the Crawdads Sing",
                "author": "Delia Owens",
                "cover_image": "/static/myapp/images/bookCover/where_the_crawdads_sing.jpg",
                "category": "featured",
                "genre": ["Fiction", "Mystery", "Coming-of-age"],
                "description": "A novel about an abandoned girl who raises herself in the marshes of North Carolina.",
                "language": "English",
                "average_rating": 4.8,
                "views_count": 3400,
                "publication_year": 2018,
                "isbn": "9780735219090",
                "pages": 368,
                "publisher": "G.P. Putnam's Sons"
            },
            {
                "_id": ObjectId("6910830325ac5b4a67dc9065"),
                "title": "Atomic Habits",
                "author": "James Clear",
                "cover_image": "/static/myapp/images/bookCover/atomic_habits.jpg",
                "category": "quick",
                "genre": ["Non-Fiction", "Self-help", "Psychology"],
                "description": "A guide to building good habits and breaking bad ones with tiny changes.",
                "language": "English",
                "average_rating": 4.8,
                "views_count": 2900,
                "publication_year": 2018,
                "isbn": "9780735211292",
                "pages": 320,
                "publisher": "Avery"
            }
        ]
        
        # Insert all books
        result = books_collection.insert_many(books_data)
        self.stdout.write(f'✅ Successfully inserted {len(result.inserted_ids)} books')
        
        # 3. Create indexes for better performance
        self.stdout.write('📝 Creating indexes for better search performance...')
        
        # Text index for search
        books_collection.create_index([
            ("title", "text"),
            ("author", "text"),
            ("description", "text"),
            ("genre", "text")
        ], name="search_text_index")
        
        # Individual indexes for filtering and sorting
        books_collection.create_index([("language", 1)])
        books_collection.create_index([("genre", 1)])
        books_collection.create_index([("category", 1)])
        books_collection.create_index([("publication_year", -1)])
        books_collection.create_index([("average_rating", -1)])
        books_collection.create_index([("views_count", -1)])
        
        self.stdout.write('✅ All indexes created successfully!')
        self.stdout.write('🎉 Database seeding completed successfully!')