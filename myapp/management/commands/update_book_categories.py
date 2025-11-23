# myapp/management/commands/update_book_categories.py
from django.core.management.base import BaseCommand
from myapp.mongodb import mongodb

class Command(BaseCommand):
    help = 'Update book categories with display_category field'

    def handle(self, *args, **options):
        books_collection = mongodb.get_collection('books')
        
        # Map existing categories to display categories
        category_mapping = {
            'science fiction': 'featured',
            'bestseller': 'bestseller', 
            'classic': 'classic',
            'horror': 'trending'
        }
        
        updated_count = 0
        
        for book in books_collection.find():
            current_category = book.get('category', '').lower()
            
            # Determine display_category based on book properties
            display_category = self.get_display_category(book, category_mapping)
            
            # Update the book
            result = books_collection.update_one(
                {'_id': book['_id']},
                {'$set': {'display_category': display_category}}
            )
            
            if result.modified_count > 0:
                updated_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Updated '{book['title']}': {current_category} -> {display_category}"
                    )
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully updated {updated_count} books')
        )
    
    def get_display_category(self, book, category_mapping):
        current_category = book.get('category', '').lower()
        publication_year = book.get('publication_year', 0)
        pages = book.get('pages', 0)
        
        # Use mapping for known categories
        if current_category in category_mapping:
            base_category = category_mapping[current_category]
            
            # Add variety based on book properties
            if current_category == 'science fiction':
                if publication_year >= 2021:
                    return 'new'
                else:
                    return 'featured'
            elif current_category == 'horror':
                if pages <= 300:
                    return 'quick'
                else:
                    return 'trending'
            else:
                return base_category
        
        # Fallback logic for uncategorized books
        if publication_year >= 2023:
            return 'new'
        elif pages <= 250:
            return 'quick'
        elif book.get('views_count', 0) >= 3000:
            return 'trending'
        else:
            return 'featured'