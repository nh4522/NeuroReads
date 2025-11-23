# myapp/management/commands/create_admin.py
from django.core.management.base import BaseCommand
from myapp.admin_setup import create_admin_user, list_all_users, make_existing_user_admin

class Command(BaseCommand):
    help = 'Create an admin user for NeuroReads'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email of existing user to make admin',
        )
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🛠️  NeuroReads Admin Setup'))
        self.stdout.write('=' * 50)
        
        if options['email']:
            # Make existing user admin
            success = make_existing_user_admin(options['email'])
            if success:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ User {options["email"]} promoted to admin!')
                )
        else:
            # Create new admin user
            admin_user = create_admin_user()
            if admin_user:
                self.stdout.write(
                    self.style.SUCCESS('✅ Admin user created successfully!')
                )
        
        # List all users
        list_all_users()
        
        self.stdout.write('\n🔑 ADMIN LOGIN INSTRUCTIONS:')
        self.stdout.write('   1. Go to: http://localhost:8000/login/')
        self.stdout.write('   2. Use email: admin@neuroreads.com')
        self.stdout.write('   3. Use password: admin123')
        self.stdout.write('   4. After login, visit: http://localhost:8000/admin-access/')