import firebase_admin
from firebase_admin import credentials, firestore

# Path to your Firebase service account key
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

departments = [
    {
        'id': 'CS',
        'name': 'Computer Science',
        'code': 'CS',
        'subclasses': ['CSE-1', 'CSE-2', 'CSAI-1', 'CSAI-2', 'CSDS', 'MAC', 'IT']
    },
    {
        'id': 'Electrical',
        'name': 'Electrical Engineering',
        'code': 'Electrical',
        'subclasses': ['EEE-1', 'EEE-2']
    },
    {
        'id': 'Mechanical',
        'name': 'Mechanical Engineering',
        'code': 'Mechanical',
        'subclasses': ['MECH-1', 'MECH-2']
    }
]

subclasses = [
    {'id': 'CSE-1', 'name': 'CSE-1', 'department': 'CS', 'year': 1},
    {'id': 'CSE-2', 'name': 'CSE-2', 'department': 'CS', 'year': 1},
    {'id': 'CSAI-1', 'name': 'CSAI-1', 'department': 'CS', 'year': 1},
    {'id': 'CSAI-2', 'name': 'CSAI-2', 'department': 'CS', 'year': 2},
    {'id': 'CSDS', 'name': 'CSDS', 'department': 'CS', 'year': 2},
    {'id': 'MAC', 'name': 'MAC', 'department': 'CS', 'year': 2},
    {'id': 'IT', 'name': 'IT', 'department': 'CS', 'year': 2},
    {'id': 'EEE-1', 'name': 'EEE-1', 'department': 'Electrical', 'year': 1},
    {'id': 'EEE-2', 'name': 'EEE-2', 'department': 'Electrical', 'year': 2},
    {'id': 'MECH-1', 'name': 'MECH-1', 'department': 'Mechanical', 'year': 1},
    {'id': 'MECH-2', 'name': 'MECH-2', 'department': 'Mechanical', 'year': 2}
]

# Add departments
for dept in departments:
    db.collection('departments').document(dept['id']).set(dept)
    print(f"Added department: {dept['name']}")

# Add subclasses
for sub in subclasses:
    db.collection('subclasses').document(sub['id']).set(sub)
    print(f"Added subclass: {sub['name']}")

print('Seeding complete!')