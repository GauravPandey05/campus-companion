import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, BookOpen, Share2, Tag, User } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { CloudinaryUploadResult } from '../../config/cloudinary';
import { useSubjects } from '../../hooks/useSubjects';
import FileUpload from '../Upload/FileUpload';
import toast from 'react-hot-toast';

const UploadNotes: React.FC = () => {
  const { userProfile } = useAuth();
  const { subjects, loading: subjectsLoading } = useSubjects(userProfile?.department);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectCode: '',
    isShared: false,
    tags: ''
  });
  const [uploadedFile, setUploadedFile] = useState<CloudinaryUploadResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUploaded = (result: CloudinaryUploadResult) => {
    setUploadedFile(result);
    // Auto-fill title if not already filled
    if (!formData.title && result.original_filename) {
      setFormData(prev => ({
        ...prev,
        title: result.original_filename.replace(/\.[^/.]+$/, '') // Remove extension
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFile) {
      toast.error('Please upload a file first');
      return;
    }

    if (!formData.title || !formData.subjectCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const noteData = {
        title: formData.title,
        description: formData.description,
        subjectCode: formData.subjectCode,
        fileUrl: uploadedFile.secure_url,
        fileName: uploadedFile.original_filename,
        fileSize: uploadedFile.bytes,
        uploadedBy: userProfile!.id,
        uploaderName: userProfile!.name,
        subclassId: userProfile!.subclass || '',
        isShared: formData.isShared,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        downloads: 0,
        approved: userProfile!.role === 'admin' ? true : false, // Auto-approve for admins
        createdAt: new Date()
      };

      await addDoc(collection(db, 'notes'), noteData);
      
      toast.success('Notes uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subjectCode: '',
        isShared: false,
        tags: ''
      });
      setUploadedFile(null);
      
    } catch (error) {
      console.error('Error uploading notes:', error);
      toast.error('Failed to upload notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group subjects by year for better organization
  const subjectsByYear = subjects.reduce((acc, subject) => {
    if (!acc[subject.year]) {
      acc[subject.year] = [];
    }
    acc[subject.year].push(subject);
    return acc;
  }, {} as Record<number, typeof subjects>);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Upload Notes</h1>
              <p className="text-green-100 mt-1">Share your study materials with classmates</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <FileUpload
                onFileUploaded={handleFileUploaded}
                acceptedTypes={['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt']}
                maxSizeMB={25}
                folder="notes"
              />
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter a descriptive title for your notes"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Add a brief description of the content"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subjectCode" className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              {subjectsLoading ? (
                <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  Loading subjects...
                </div>
              ) : (
                <select
                  id="subjectCode"
                  name="subjectCode"
                  value={formData.subjectCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a subject</option>
                  {Object.entries(subjectsByYear).map(([year, yearSubjects]) => (
                    <optgroup key={year} label={`Year ${year}`}>
                      {yearSubjects.map((subject) => (
                        <option key={subject.code} value={subject.code}>
                          {subject.code} - {subject.name}
                          {subject.isShared ? ' (Shared)' : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter tags separated by commas (e.g., midterm, important, concepts)"
              />
            </div>

            {/* Share Checkbox */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isShared"
                name="isShared"
                checked={formData.isShared}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="isShared" className="text-sm font-medium text-gray-700">
                Share with other departments (if subject is shared)
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !uploadedFile}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Uploading...' : 'Upload Notes'}
            </motion.button>
          </form>
        </motion.div>

        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Upload Guidelines */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Guidelines</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">
                  Use clear, descriptive titles for your notes
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">
                  Add relevant tags to help others find your notes
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">
                  Only upload original content or properly cited material
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">
                  Max file size: 25MB per file
                </p>
              </div>
            </div>
          </div>

          {/* File Preview */}
          {uploadedFile && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">File Preview</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{uploadedFile.original_filename}</p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.bytes / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subject Info */}
          {formData.subjectCode && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Info</h3>
              {(() => {
                const selectedSubject = subjects.find(s => s.code === formData.subjectCode);
                return selectedSubject ? (
                  <div className="space-y-2">
                    <p className="text-sm"><strong>Name:</strong> {selectedSubject.name}</p>
                    <p className="text-sm"><strong>Year:</strong> {selectedSubject.year}</p>
                    <p className="text-sm"><strong>Credits:</strong> {selectedSubject.credits}</p>
                    <p className="text-sm"><strong>Type:</strong> {selectedSubject.isShared ? 'Shared Subject' : 'Department Subject'}</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UploadNotes;
