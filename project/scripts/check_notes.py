import firebase_admin
from firebase_admin import credentials, firestore
import sys
from datetime import datetime

def check_firestore_data():
    """Quick script to check what's in Firestore"""
    try:
        # Initialize Firebase (adjust path as needed)
        cred = credentials.Certificate('src/config/serviceAccountKey.json')
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        
        print("🔍 Checking Firestore collections...")
        
        # Check collections
        collections = ['users', 'departments', 'subclasses', 'notes', 'subjects']
        
        for collection_name in collections:
            print(f"\n📂 {collection_name.upper()} Collection:")
            try:
                docs = db.collection(collection_name).limit(5).get()
                print(f"   Total documents found: {len(docs)}")
                
                for i, doc in enumerate(docs):
                    data = doc.to_dict()
                    print(f"   {i+1}. ID: {doc.id}")
                    
                    if collection_name == 'notes':
                        print(f"      Title: {data.get('title', 'N/A')}")
                        print(f"      Subject: {data.get('subjectCode', 'N/A')}")
                        print(f"      Subclass: {data.get('subclassId', 'N/A')}")
                        print(f"      Shared: {data.get('isShared', 'N/A')}")
                        print(f"      Created: {data.get('createdAt', 'N/A')}")
                        print(f"      Approved: {data.get('approved', 'N/A')}")
                    
                    elif collection_name == 'users':
                        print(f"      Name: {data.get('name', 'N/A')}")
                        print(f"      Role: {data.get('role', 'N/A')}")
                        print(f"      Department: {data.get('department', 'N/A')}")
                        print(f"      Subclass: {data.get('subclass', 'N/A')}")
                    
                    elif collection_name == 'subclasses':
                        print(f"      Name: {data.get('name', 'N/A')}")
                        print(f"      Department: {data.get('department', 'N/A')}")
                        print(f"      Year: {data.get('year', 'N/A')}")
                    
                    print()
                        
            except Exception as e:
                print(f"   ❌ Error accessing {collection_name}: {e}")
        
        # Specific notes query test
        print("\n🔍 Testing Notes Queries:")
        notes_ref = db.collection('notes')
        
        # Test simple query
        try:
            simple_query = notes_ref.limit(3).get()
            print(f"✅ Simple query successful: {len(simple_query)} notes")
        except Exception as e:
            print(f"❌ Simple query failed: {e}")
        
        # Test where query
        try:
            where_query = notes_ref.where('isShared', '==', True).limit(3).get()
            print(f"✅ Where query successful: {len(where_query)} shared notes")
        except Exception as e:
            print(f"❌ Where query failed: {e}")
            
        print("\n✅ Data check complete!")
        
    except Exception as e:
        print(f"❌ Failed to connect to Firestore: {e}")
        print("Make sure your serviceAccountKey.json is in the correct location")

if __name__ == "__main__":
    check_firestore_data()