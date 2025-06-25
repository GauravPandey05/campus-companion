import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Subject } from '../types';

export const useSubjects = (department?: string, year?: number) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, [department, year]);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const subjectsRef = collection(db, 'subjects');
      let subjectsQuery = query(subjectsRef, orderBy('year'), orderBy('semester'), orderBy('name'));

      // If department is specified, filter by department or shared subjects
      if (department) {
        // Get department-specific subjects
        const deptQuery = query(
          subjectsRef,
          where('department', '==', department),
          orderBy('year'),
          orderBy('semester')
        );
        const deptSnapshot = await getDocs(deptQuery);

        // Get shared subjects that include this department
        const sharedQuery = query(
          subjectsRef,
          where('isShared', '==', true),
          orderBy('year'),
          orderBy('semester')
        );
        const sharedSnapshot = await getDocs(sharedQuery);

        const subjectsData: Subject[] = [];

        // Add department-specific subjects
        deptSnapshot.forEach((doc) => {
          const data = doc.data();
          subjectsData.push({
            id: doc.id,
            name: data.name,
            code: data.code,
            departmentId: data.department,
            year: data.year,
            semester: data.semester,
            credits: data.credits,
            isShared: data.isShared || false,
            description: data.description || '',
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });

        // Add shared subjects that include this department
        sharedSnapshot.forEach((doc) => {
          const data = doc.data();
          const sharedWith = data.sharedWith || [];
          
          if (sharedWith.includes(department) || data.department === department) {
            // Avoid duplicates
            if (!subjectsData.find(s => s.code === data.code)) {
              subjectsData.push({
                id: doc.id,
                name: data.name,
                code: data.code,
                departmentId: data.department,
                year: data.year,
                semester: data.semester,
                credits: data.credits,
                isShared: data.isShared || false,
                description: data.description || '',
                createdAt: data.createdAt?.toDate() || new Date()
              });
            }
          }
        });

        // Filter by year if specified
        let filteredSubjects = subjectsData;
        if (year) {
          filteredSubjects = subjectsData.filter(subject => subject.year === year);
        }

        setSubjects(filteredSubjects);
      } else {
        // Get all subjects
        const snapshot = await getDocs(subjectsQuery);
        const subjectsData: Subject[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          subjectsData.push({
            id: doc.id,
            name: data.name,
            code: data.code,
            departmentId: data.department,
            year: data.year,
            semester: data.semester,
            credits: data.credits,
            isShared: data.isShared || false,
            description: data.description || '',
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });

        setSubjects(subjectsData);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  return { subjects, loading, error, refetch: fetchSubjects };
};