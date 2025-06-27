import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, or, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  year: number;
  semester: number;
  credits: number;
  isShared?: boolean;
  sharedWith?: string[];
  description?: string;
}

export function useSubjects(department?: string) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const subjectsRef = collection(db, 'subjects');
        let subjectsData: Subject[] = [];

        if (department) {
          // 1. Subjects for this department
          const deptQuery = query(
            subjectsRef,
            where('department', '==', department)
          );
          const deptSnap = await getDocs(deptQuery);
          deptSnap.forEach(doc => {
            const d = doc.data();
            subjectsData.push({
              id: doc.id,
              code: d.code,
              name: d.name,
              department: d.department,
              year: d.year,
              semester: d.semester,
              credits: d.credits,
              isShared: d.isShared,
              sharedWith: d.sharedWith,
              description: d.description,
            });
          });

          // 2. Shared subjects that include this department
          const sharedQuery = query(
            subjectsRef,
            where('isShared', '==', true),
            where('sharedWith', 'array-contains', department)
          );
          const sharedSnap = await getDocs(sharedQuery);
          sharedSnap.forEach(doc => {
            const d = doc.data();
            // Avoid duplicates
            if (!subjectsData.find(s => s.code === d.code)) {
              subjectsData.push({
                id: doc.id,
                code: d.code,
                name: d.name,
                department: d.department,
                year: d.year,
                semester: d.semester,
                credits: d.credits,
                isShared: d.isShared,
                sharedWith: d.sharedWith,
                description: d.description,
              });
            }
          });
        } else {
          // No department filter: fetch all
          const allSnap = await getDocs(subjectsRef);
          allSnap.forEach(doc => {
            const d = doc.data();
            subjectsData.push({
              id: doc.id,
              code: d.code,
              name: d.name,
              department: d.department,
              year: d.year,
              semester: d.semester,
              credits: d.credits,
              isShared: d.isShared,
              sharedWith: d.sharedWith,
              description: d.description,
            });
          });
        }

        // Sort by year, then semester, then name
        subjectsData.sort((a, b) =>
          a.year !== b.year
            ? a.year - b.year
            : a.semester !== b.semester
            ? a.semester - b.semester
            : a.name.localeCompare(b.name)
        );

        setSubjects(subjectsData);
      } catch (err: any) {
        setError('Failed to fetch subjects');
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [department]);

  return { subjects, loading, error };
}