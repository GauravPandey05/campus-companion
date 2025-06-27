import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  User, 
  Tag, 
  BookOpen,
  Share2,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Note } from '../../types';
import toast from 'react-hot-toast';


interface FilterOptions {
  subjectCode: string;
  isShared: string; // 'all', 'shared', 'private'
  tags: string;
  sortBy: 'newest' | 'oldest' | 'downloads' | 'title';
}

const NotesLibrary: React.FC = () => {
  const { userProfile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    subjectCode: '',
    isShared: 'all',
    tags: '',
    sortBy: 'newest'
  });
  const [subjects, setSubjects] = useState<{code: string, name: string}[]>([]);

  // Fetch notes when component mounts or user changes
  useEffect(() => {
    fetchNotes();
    fetchSubjects();
  }, [userProfile]);

  // Apply filters when notes, search term, or filters change
  useEffect(() => {
    applyFilters();
  }, [notes, searchTerm, filters]);

  const fetchSubjects = async () => {
    try {
      const subjectsRef = collection(db, 'subjects');
      const snapshot = await getDocs(subjectsRef);
      const subjectsList: {code: string, name: string}[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        subjectsList.push({
          code: data.code,
          name: data.name
        });
      });
      setSubjects(subjectsList);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchNotes = async () => {
    if (!userProfile) return;
    
    setLoading(true);
    try {
      const notesRef = collection(db, 'notes');
      let notesData: Note[] = [];
      
      // Simple approach - get all notes first, then filter in memory
      // This avoids complex Firestore query issues
      const snapshot = await getDocs(notesRef);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Make sure all fields exist to prevent errors
        const note: Note = {
          id: doc.id,
          title: data.title || 'Untitled',
          description: data.description || '',
          subjectCode: data.subjectCode || '',
          fileUrl: data.fileUrl || '',
          fileName: data.fileName || '',
          fileSize: data.fileSize || 0,
          uploadedBy: data.uploadedBy || '',
          uploaderName: data.uploaderName || '',
          subclassId: data.subclassId || '',
          isShared: data.isShared || false,
          tags: data.tags || [],
          downloads: data.downloads || 0,
          approved: data.approved !== undefined ? data.approved : true,
          createdAt: data.createdAt?.toDate() || new Date()
        };
        
        // Only add notes that should be visible to this user:
        // 1. Notes from user's own subclass
        // 2. Notes that are shared
        // 3. All notes if user is admin
        if (
          userProfile.role === 'admin' || 
          note.subclassId === userProfile.subclass || 
          note.isShared
        ) {
          notesData.push(note);
        }
      });
      
      // Sort by creation date (newest first)
      notesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log(`Loaded ${notesData.length} notes successfully`);
      setNotes(notesData);
      
      // Debugging: Log note URLs
      if (notesData.length > 0) {
        debugNotesUrls(notesData);
      }
      
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debugging function to log note URLs
  const debugNotesUrls = (notes: Note[]) => {
    console.log("=== DEBUG: Notes URLs ===");
    notes.forEach((note, index) => {
      console.log(`Note ${index + 1}: ${note.title}`);
      console.log(`- fileUrl: ${note.fileUrl}`);
      console.log(`- driveFileId: ${note.driveFileId || 'not set'}`);
      console.log(`- viewUrl: ${note.viewUrl || 'not set'}`);
      console.log(`- downloadUrl: ${note.downloadUrl || 'not set'}`);
      console.log(`- File extension: ${note.fileName.split('.').pop()}`);
      console.log("---");
    });
  };

  const applyFilters = () => {
    let filtered = [...notes];
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchLower) ||
        note.description.toLowerCase().includes(searchLower) ||
        note.subjectCode.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by subject code
    if (filters.subjectCode) {
      filtered = filtered.filter(note => note.subjectCode === filters.subjectCode);
    }
    
    // Filter by sharing status
    if (filters.isShared !== 'all') {
      filtered = filtered.filter(note => 
        filters.isShared === 'shared' ? note.isShared : !note.isShared
      );
    }
    
    // Filter by tags
    if (filters.tags) {
      const tagsLower = filters.tags.toLowerCase();
      filtered = filtered.filter(note =>
        note.tags.some(tag => tag.toLowerCase().includes(tagsLower))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'downloads':
          return b.downloads - a.downloads;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
    
    setFilteredNotes(filtered);
  };

  const handleDownload = async (note: Note) => {
    try {
      let downloadUrl = '';
      
      // For Google Drive files
      if (note.driveFileId) {
        downloadUrl = note.downloadUrl || `https://drive.google.com/uc?export=download&id=${note.driveFileId}`;
      }
      // Legacy files (not from Google Drive)
      else {
        downloadUrl = note.fileUrl;
      }
      
      // Create a temporary anchor to trigger download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = note.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Update download count
      await updateDoc(doc(db, 'notes', note.id), {
        downloads: note.downloads + 1
      });
      
      // Update local state
      setNotes(prevNotes => prevNotes.map(n => 
        n.id === note.id ? { ...n, downloads: n.downloads + 1 } : n
      ));
      
      toast.success('Downloading file...');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  const handlePreview = (note: Note) => {
    // Handle Google Drive files
    if (note.driveFileId) {
      const embedUrl = note.viewUrl || `https://drive.google.com/file/d/${note.driveFileId}/preview`;
      window.open(embedUrl, '_blank');
    } else {
      // Legacy files
      window.open(note.fileUrl, '_blank');
    }
  };

  const handleApproval = async (noteId: string, approved: boolean) => {
    try {
      await updateDoc(doc(db, 'notes', noteId), { approved });
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, approved } : note
      ));
      toast.success(`Note ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating approval:', error);
      toast.error('Failed to update approval status');
    }
  };

  const handleFileAccess = async (note: Note) => {
    try {
      console.log("Accessing file:", note);
      
      // Check if this is a Google Drive file
      if (note.driveFileId) {
        console.log("Using Google Drive file access");
        // Use the stored URLs if available, otherwise construct them
        if (note.viewUrl) {
          window.open(note.viewUrl, '_blank');
        } else {
          const embedUrl = `https://drive.google.com/file/d/${note.driveFileId}/preview`;
          window.open(embedUrl, '_blank');
        }
      } 
      // Legacy files (not from Google Drive)
      else {
        console.log("Using direct file URL:", note.fileUrl);
        window.open(note.fileUrl, '_blank');
      }
      
      // Update download count in Firestore
      try {
        await updateDoc(doc(db, 'notes', note.id), {
          downloads: note.downloads + 1
        });
        
        // Update local state
        setNotes(prevNotes => prevNotes.map(n => 
          n.id === note.id ? { ...n, downloads: n.downloads + 1 } : n
        ));
      } catch (updateError) {
        console.error("Failed to update download count:", updateError);
      }
      
      toast.success('Opening file...');
    } catch (error) {
      console.error('Error accessing file:', error);
      toast.error('Failed to access file. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getUniqueSubjects = () => {
    // Return unique subject codes from notes
    const subjectCodes = [...new Set(notes.map(note => note.subjectCode))];
    return subjectCodes.sort();
  };

  const getSubjectName = (code: string) => {
    const subject = subjects.find(s => s.code === code);
    return subject ? subject.name : code;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          {/* Subtle pulse animation instead of continuous rotation */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "reverse", 
              ease: "easeInOut" 
            }}
            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
          >
            <BookOpen className="w-8 h-8 text-blue-600" />
          </motion.div>
          <p className="text-lg font-medium text-gray-700">Loading notes...</p>
          <p className="text-sm text-gray-500">Please wait while we fetch your study materials</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notes Library</h1>
              <p className="text-blue-100 mt-1">Browse and download study materials</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{filteredNotes.length}</p>
            <p className="text-blue-100">Available Notes</p>
          </div>
        </div>
      </motion.div>

      {/* Debug Info */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Debug: Total notes loaded: {notes.length} | Filtered: {filteredNotes.length} | 
            User: {userProfile?.name} ({userProfile?.role}) | Subclass: {userProfile?.subclass}
          </p>
        </div>
      )}

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={filters.subjectCode}
            onChange={(e) => setFilters(prev => ({ ...prev, subjectCode: e.target.value }))}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            {getUniqueSubjects().map(subject => (
              <option key={subject} value={subject}>
                {subject} - {getSubjectName(subject)}
              </option>
            ))}
          </select>

          {/* Sharing Filter */}
          <select
            value={filters.isShared}
            onChange={(e) => setFilters(prev => ({ ...prev, isShared: e.target.value }))}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Notes</option>
            <option value="shared">Shared Notes</option>
            <option value="private">Class Notes</option>
          </select>

          {/* Tags Filter */}
          <input
            type="text"
            placeholder="Filter by tags..."
            value={filters.tags}
            onChange={(e) => setFilters(prev => ({ ...prev, tags: e.target.value }))}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="downloads">Most Downloaded</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </motion.div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 line-clamp-1">{note.title}</h3>
                    <p className="text-sm text-blue-600">{note.subjectCode}</p>
                    {note.subclassId !== userProfile?.subclass && (
                      <p className="text-xs text-gray-500">from {note.subclassId}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {note.isShared && (
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600">Shared</span>
                    </div>
                  )}
                  {note.subclassId !== userProfile?.subclass && (
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4 text-purple-500" />
                      <span className="text-xs text-purple-600">Cross-Dept</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {note.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{note.description}</p>
              )}

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {note.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
                      +{note.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* File Info */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{formatFileSize(note.fileSize)}</span>
                <span>{note.downloads} downloads</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{note.uploaderName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {note.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFileAccess(note)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownload(note)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </motion.button>
                
                {/* Admin/CR Approval Actions */}
                {(userProfile?.role === 'admin' || userProfile?.role === 'cr') && (
                  <div className="flex items-center space-x-2">
                    {note.approved ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApproval(note.id, false)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject Note"
                      >
                        <XCircle className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApproval(note.id, true)}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve Note"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                )}
              </div>

              {/* Approval Status */}
              {!note.approved && (userProfile?.role === 'admin' || userProfile?.role === 'cr') && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-700">Pending approval</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filters.subjectCode || filters.tags
              ? 'Try adjusting your search filters'
              : 'No notes have been uploaded yet'}
          </p>
          <button
            onClick={fetchNotes}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Notes
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default NotesLibrary;