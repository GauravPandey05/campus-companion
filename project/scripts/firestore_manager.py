import firebase_admin
from firebase_admin import credentials, firestore
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
import sys
import argparse

class FirestoreManager:
    def __init__(self, service_account_path: str = 'src/config/serviceAccountKey.json'):
        """Initialize Firestore connection"""
        try:
            cred = credentials.Certificate(service_account_path)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred)
            self.db = firestore.client()
            print("✅ Connected to Firestore successfully")
        except Exception as e:
            print(f"❌ Failed to connect to Firestore: {e}")
            sys.exit(1)

    def create_department(self, dept_data: Dict[str, Any]) -> str:
        """Create a new department"""
        try:
            dept_ref = self.db.collection('departments').document(dept_data['code'])
            dept_ref.set({
                'id': dept_data['code'],
                'name': dept_data['name'],
                'code': dept_data['code'],
                'subclasses': dept_data.get('subclasses', []),
                'createdAt': datetime.now()
            })
            print(f"✅ Created department: {dept_data['name']}")
            return dept_data['code']
        except Exception as e:
            print(f"❌ Failed to create department: {e}")
            return None

    def create_subclass(self, subclass_data: Dict[str, Any]) -> str:
        """Create a new subclass"""
        try:
            subclass_ref = self.db.collection('subclasses').document(subclass_data['id'])
            subclass_ref.set({
                'id': subclass_data['id'],
                'name': subclass_data['name'],
                'department': subclass_data['department'],
                'year': subclass_data['year'],
                'semester': subclass_data.get('semester', (subclass_data['year'] * 2) - 1),
                'capacity': subclass_data.get('capacity', 60),
                'createdAt': datetime.now()
            })
            print(f"✅ Created subclass: {subclass_data['name']}")
            return subclass_data['id']
        except Exception as e:
            print(f"❌ Failed to create subclass: {e}")
            return None

    def create_subject(self, subject_data: Dict[str, Any]) -> str:
        """Create a new subject"""
        try:
            subject_ref = self.db.collection('subjects').document(subject_data['code'])
            subject_ref.set({
                'id': subject_data['code'],
                'name': subject_data['name'],
                'code': subject_data['code'],
                'department': subject_data['department'],
                'year': subject_data['year'],
                'semester': subject_data['semester'],
                'credits': subject_data['credits'],
                'isShared': subject_data.get('isShared', False),
                'sharedWith': subject_data.get('sharedWith', []),
                'description': subject_data.get('description', ''),
                'createdAt': datetime.now()
            })
            print(f"✅ Created subject: {subject_data['name']} ({subject_data['code']})")
            return subject_data['code']
        except Exception as e:
            print(f"❌ Failed to create subject: {e}")
            return None

    def get_all_departments(self) -> List[Dict[str, Any]]:
        """Get all departments"""
        try:
            docs = self.db.collection('departments').get()
            departments = []
            for doc in docs:
                dept_data = doc.to_dict()
                dept_data['id'] = doc.id
                departments.append(dept_data)
            return departments
        except Exception as e:
            print(f"❌ Failed to get departments: {e}")
            return []

    def get_all_subclasses(self, department: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all subclasses, optionally filtered by department"""
        try:
            query = self.db.collection('subclasses')
            if department:
                query = query.where('department', '==', department)
            
            docs = query.get()
            subclasses = []
            for doc in docs:
                subclass_data = doc.to_dict()
                subclass_data['id'] = doc.id
                subclasses.append(subclass_data)
            return subclasses
        except Exception as e:
            print(f"❌ Failed to get subclasses: {e}")
            return []

    def get_all_subjects(self, department: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all subjects, optionally filtered by department"""
        try:
            query = self.db.collection('subjects')
            if department:
                query = query.where('department', '==', department)
            
            docs = query.get()
            subjects = []
            for doc in docs:
                subject_data = doc.to_dict()
                subject_data['id'] = doc.id
                subjects.append(subject_data)
            return subjects
        except Exception as e:
            print(f"❌ Failed to get subjects: {e}")
            return []

    def update_department_subclasses(self, dept_code: str, subclasses: List[str]):
        """Update department's subclasses list"""
        try:
            dept_ref = self.db.collection('departments').document(dept_code)
            dept_ref.update({'subclasses': subclasses})
            print(f"✅ Updated {dept_code} subclasses: {subclasses}")
        except Exception as e:
            print(f"❌ Failed to update department subclasses: {e}")

    def assign_user_role(self, user_id: str, role: str):
        """Assign role to user (student, cr, admin)"""
        try:
            user_ref = self.db.collection('users').document(user_id)
            user_ref.update({'role': role})
            print(f"✅ Assigned role '{role}' to user {user_id}")
        except Exception as e:
            print(f"❌ Failed to assign role: {e}")

    def get_statistics(self) -> Dict[str, int]:
        """Get database statistics"""
        try:
            stats = {}
            collections = ['departments', 'subclasses', 'subjects', 'users', 'notes', 'assignments']
            
            for collection_name in collections:
                docs = self.db.collection(collection_name).get()
                stats[collection_name] = len(docs)
            
            return stats
        except Exception as e:
            print(f"❌ Failed to get statistics: {e}")
            return {}

    def cleanup_orphaned_data(self):
        """Clean up orphaned subclasses and subjects"""
        try:
            # Get all departments
            departments = {dept['code']: dept for dept in self.get_all_departments()}
            
            # Check subclasses
            subclasses = self.get_all_subclasses()
            orphaned_subclasses = []
            
            for subclass in subclasses:
                if subclass['department'] not in departments:
                    orphaned_subclasses.append(subclass['id'])
            
            # Check subjects
            subjects = self.get_all_subjects()
            orphaned_subjects = []
            
            for subject in subjects:
                if subject['department'] not in departments:
                    orphaned_subjects.append(subject['id'])
            
            print(f"Found {len(orphaned_subclasses)} orphaned subclasses")
            print(f"Found {len(orphaned_subjects)} orphaned subjects")
            
            # Optional: Delete orphaned data (uncomment if needed)
            # for subclass_id in orphaned_subclasses:
            #     self.db.collection('subclasses').document(subclass_id).delete()
            # for subject_id in orphaned_subjects:
            #     self.db.collection('subjects').document(subject_id).delete()
            
        except Exception as e:
            print(f"❌ Failed to cleanup: {e}")

def main():
    parser = argparse.ArgumentParser(description='Firestore Management Tool')
    parser.add_argument('--action', choices=['init', 'stats', 'cleanup', 'interactive'], 
                      default='interactive', help='Action to perform')
    parser.add_argument('--config', default='config/college_data.json', 
                      help='Path to college configuration file')
    
    args = parser.parse_args()
    
    fm = FirestoreManager()
    
    if args.action == 'stats':
        stats = fm.get_statistics()
        print("\n📊 Database Statistics:")
        for collection, count in stats.items():
            print(f"   {collection}: {count}")
    
    elif args.action == 'cleanup':
        fm.cleanup_orphaned_data()
    
    elif args.action == 'interactive':
        interactive_mode(fm)

def interactive_mode(fm: FirestoreManager):
    """Interactive mode for managing Firestore"""
    while True:
        print("\n🔥 Firestore Manager - Interactive Mode")
        print("1. View Statistics")
        print("2. List Departments")
        print("3. List Subclasses")
        print("4. List Subjects")
        print("5. Add Department")
        print("6. Add Subclass")
        print("7. Add Subject")
        print("8. Assign User Role")
        print("9. Initialize with Sample Data")
        print("0. Exit")
        
        choice = input("\nEnter your choice (0-9): ").strip()
        
        if choice == '0':
            break
        elif choice == '1':
            stats = fm.get_statistics()
            print("\n📊 Database Statistics:")
            for collection, count in stats.items():
                print(f"   {collection}: {count}")
        
        elif choice == '2':
            departments = fm.get_all_departments()
            print(f"\n🏢 Departments ({len(departments)}):")
            for dept in departments:
                print(f"   {dept['code']}: {dept['name']}")
        
        elif choice == '3':
            departments = fm.get_all_departments()
            print("\nSelect department (or press Enter for all):")
            for i, dept in enumerate(departments):
                print(f"{i+1}. {dept['code']}")
            
            choice_dept = input("Enter number or press Enter: ").strip()
            dept_filter = None
            if choice_dept.isdigit() and 1 <= int(choice_dept) <= len(departments):
                dept_filter = departments[int(choice_dept)-1]['code']
            
            subclasses = fm.get_all_subclasses(dept_filter)
            print(f"\n🎓 Subclasses ({len(subclasses)}):")
            for subclass in subclasses:
                print(f"   {subclass['id']}: {subclass['name']} (Year {subclass['year']})")
        
        elif choice == '4':
            departments = fm.get_all_departments()
            print("\nSelect department (or press Enter for all):")
            for i, dept in enumerate(departments):
                print(f"{i+1}. {dept['code']}")
            
            choice_dept = input("Enter number or press Enter: ").strip()
            dept_filter = None
            if choice_dept.isdigit() and 1 <= int(choice_dept) <= len(departments):
                dept_filter = departments[int(choice_dept)-1]['code']
            
            subjects = fm.get_all_subjects(dept_filter)
            print(f"\n📚 Subjects ({len(subjects)}):")
            for subject in subjects:
                shared_text = " (Shared)" if subject.get('isShared') else ""
                print(f"   {subject['code']}: {subject['name']}{shared_text}")
        
        elif choice == '5':
            add_department_interactive(fm)
        elif choice == '6':
            add_subclass_interactive(fm)
        elif choice == '7':
            add_subject_interactive(fm)
        elif choice == '8':
            assign_role_interactive(fm)
        elif choice == '9':
            initialize_sample_data(fm)

def add_department_interactive(fm: FirestoreManager):
    """Interactive department addition"""
    print("\n➕ Add New Department")
    code = input("Department Code (e.g., CS): ").strip().upper()
    name = input("Department Name (e.g., Computer Science): ").strip()
    
    if code and name:
        dept_data = {
            'code': code,
            'name': name,
            'subclasses': []
        }
        fm.create_department(dept_data)

def add_subclass_interactive(fm: FirestoreManager):
    """Interactive subclass addition"""
    print("\n➕ Add New Subclass")
    departments = fm.get_all_departments()
    
    if not departments:
        print("❌ No departments found. Please add departments first.")
        return
    
    print("Available departments:")
    for i, dept in enumerate(departments):
        print(f"{i+1}. {dept['code']} - {dept['name']}")
    
    choice = input("Select department number: ").strip()
    if not choice.isdigit() or not (1 <= int(choice) <= len(departments)):
        print("❌ Invalid choice")
        return
    
    selected_dept = departments[int(choice)-1]
    
    subclass_id = input("Subclass ID (e.g., CSE-1): ").strip().upper()
    subclass_name = input("Subclass Name (e.g., CSE-1): ").strip()
    year = input("Year (1-4): ").strip()
    
    if subclass_id and subclass_name and year.isdigit():
        subclass_data = {
            'id': subclass_id,
            'name': subclass_name,
            'department': selected_dept['code'],
            'year': int(year)
        }
        result = fm.create_subclass(subclass_data)
        if result:
            # Update department's subclasses list
            current_subclasses = selected_dept.get('subclasses', [])
            if subclass_id not in current_subclasses:
                current_subclasses.append(subclass_id)
                fm.update_department_subclasses(selected_dept['code'], current_subclasses)

def add_subject_interactive(fm: FirestoreManager):
    """Interactive subject addition"""
    print("\n➕ Add New Subject")
    departments = fm.get_all_departments()
    
    if not departments:
        print("❌ No departments found. Please add departments first.")
        return
    
    print("Available departments:")
    for i, dept in enumerate(departments):
        print(f"{i+1}. {dept['code']} - {dept['name']}")
    
    choice = input("Select department number: ").strip()
    if not choice.isdigit() or not (1 <= int(choice) <= len(departments)):
        print("❌ Invalid choice")
        return
    
    selected_dept = departments[int(choice)-1]
    
    code = input("Subject Code (e.g., CS101): ").strip().upper()
    name = input("Subject Name (e.g., Programming Fundamentals): ").strip()
    year = input("Year (1-4): ").strip()
    semester = input("Semester (1-8): ").strip()
    credits = input("Credits (1-6): ").strip()
    is_shared = input("Is this subject shared across departments? (y/n): ").strip().lower() == 'y'
    
    if all([code, name, year.isdigit(), semester.isdigit(), credits.isdigit()]):
        subject_data = {
            'code': code,
            'name': name,
            'department': selected_dept['code'],
            'year': int(year),
            'semester': int(semester),
            'credits': int(credits),
            'isShared': is_shared,
            'sharedWith': []
        }
        
        if is_shared:
            print("Select departments to share with:")
            for i, dept in enumerate(departments):
                if dept['code'] != selected_dept['code']:
                    print(f"{i+1}. {dept['code']}")
            
            shared_choices = input("Enter department numbers (comma-separated): ").strip()
            if shared_choices:
                try:
                    shared_indices = [int(x.strip())-1 for x in shared_choices.split(',')]
                    shared_depts = [departments[i]['code'] for i in shared_indices 
                                  if 0 <= i < len(departments) and departments[i]['code'] != selected_dept['code']]
                    subject_data['sharedWith'] = shared_depts
                except:
                    print("⚠️ Invalid input for shared departments, creating as non-shared")
        
        fm.create_subject(subject_data)

def assign_role_interactive(fm: FirestoreManager):
    """Interactive role assignment"""
    print("\n👤 Assign User Role")
    user_id = input("Enter User ID (from Firestore): ").strip()
    
    print("Available roles:")
    print("1. student")
    print("2. cr (Class Representative)")
    print("3. admin")
    
    choice = input("Select role number: ").strip()
    roles = {'1': 'student', '2': 'cr', '3': 'admin'}
    
    if choice in roles:
        fm.assign_user_role(user_id, roles[choice])
    else:
        print("❌ Invalid choice")

def initialize_sample_data(fm: FirestoreManager):
    """Initialize with comprehensive sample data"""
    print("\n🚀 Initializing with sample data...")
    
    # Sample departments
    departments = [
        {'code': 'CS', 'name': 'Computer Science'},
        {'code': 'EE', 'name': 'Electrical Engineering'},
        {'code': 'ME', 'name': 'Mechanical Engineering'},
        {'code': 'CE', 'name': 'Civil Engineering'},
        {'code': 'ECE', 'name': 'Electronics & Communication'}
    ]
    
    # Create departments
    for dept in departments:
        fm.create_department(dept)
    
    # Sample subclasses
    subclasses = [
        # CS Department
        {'id': 'CSE-1', 'name': 'CSE-1', 'department': 'CS', 'year': 1},
        {'id': 'CSE-2', 'name': 'CSE-2', 'department': 'CS', 'year': 1},
        {'id': 'CSAI-1', 'name': 'CSAI-1', 'department': 'CS', 'year': 2},
        {'id': 'CSAI-2', 'name': 'CSAI-2', 'department': 'CS', 'year': 2},
        {'id': 'CSDS', 'name': 'CSDS', 'department': 'CS', 'year': 3},
        {'id': 'MAC', 'name': 'MAC', 'department': 'CS', 'year': 3},
        
        # EE Department
        {'id': 'EEE-1', 'name': 'EEE-1', 'department': 'EE', 'year': 1},
        {'id': 'EEE-2', 'name': 'EEE-2', 'department': 'EE', 'year': 2},
        
        # ME Department
        {'id': 'MECH-1', 'name': 'MECH-1', 'department': 'ME', 'year': 1},
        {'id': 'MECH-2', 'name': 'MECH-2', 'department': 'ME', 'year': 2},
    ]
    
    # Create subclasses
    for subclass in subclasses:
        fm.create_subclass(subclass)
    
    # Update department subclass lists
    dept_subclasses = {
        'CS': ['CSE-1', 'CSE-2', 'CSAI-1', 'CSAI-2', 'CSDS', 'MAC'],
        'EE': ['EEE-1', 'EEE-2'],
        'ME': ['MECH-1', 'MECH-2']
    }
    
    for dept_code, subclass_list in dept_subclasses.items():
        fm.update_department_subclasses(dept_code, subclass_list)
    
    # Sample subjects
    subjects = [
        # Shared subjects (Year 1)
        {'code': 'MA101', 'name': 'Mathematics I', 'department': 'CS', 'year': 1, 'semester': 1, 'credits': 4, 'isShared': True, 'sharedWith': ['EE', 'ME', 'CE']},
        {'code': 'PH101', 'name': 'Physics I', 'department': 'CS', 'year': 1, 'semester': 1, 'credits': 4, 'isShared': True, 'sharedWith': ['EE', 'ME', 'CE']},
        {'code': 'CH101', 'name': 'Chemistry I', 'department': 'CS', 'year': 1, 'semester': 1, 'credits': 4, 'isShared': True, 'sharedWith': ['EE', 'ME', 'CE']},
        {'code': 'EN101', 'name': 'English Communication', 'department': 'CS', 'year': 1, 'semester': 1, 'credits': 3, 'isShared': True, 'sharedWith': ['EE', 'ME', 'CE']},
        
        # CS specific subjects
        {'code': 'CS101', 'name': 'Programming Fundamentals', 'department': 'CS', 'year': 1, 'semester': 1, 'credits': 4, 'isShared': False},
        {'code': 'CS201', 'name': 'Data Structures', 'department': 'CS', 'year': 2, 'semester': 3, 'credits': 4, 'isShared': False},
        {'code': 'CS301', 'name': 'Database Management', 'department': 'CS', 'year': 3, 'semester': 5, 'credits': 4, 'isShared': False},
        
        # EE specific subjects
        {'code': 'EE201', 'name': 'Circuit Analysis', 'department': 'EE', 'year': 2, 'semester': 3, 'credits': 4, 'isShared': False},
        {'code': 'EE301', 'name': 'Power Systems', 'department': 'EE', 'year': 3, 'semester': 5, 'credits': 4, 'isShared': False},
        
        # ME specific subjects
        {'code': 'ME201', 'name': 'Thermodynamics', 'department': 'ME', 'year': 2, 'semester': 3, 'credits': 4, 'isShared': False},
        {'code': 'ME301', 'name': 'Fluid Mechanics', 'department': 'ME', 'year': 3, 'semester': 5, 'credits': 4, 'isShared': False},
    ]
    
    # Create subjects
    for subject in subjects:
        fm.create_subject(subject)
    
    print("✅ Sample data initialization complete!")

if __name__ == "__main__":
    main()