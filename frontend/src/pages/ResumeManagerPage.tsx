import { useResumes } from '../hooks/useResumes';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Upload, Trash2, FileText } from 'lucide-react';
import { useRef, useState } from 'react';
import { format } from 'date-fns';

export default function ResumeManagerPage() {
  const { resumes, uploadResume, deleteResume, isLoading } = useResumes();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      uploadResume(file);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownload = (fileUrl: string) => {
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${fileUrl}`;
    window.open(url, '_blank');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      deleteResume(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading resumes...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Resume Manager</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage your resume versions
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </Button>
        </div>
      </div>

      {resumes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No resumes uploaded yet. Upload your first resume to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <Card key={resume._id}>
              <CardHeader>
                <CardTitle className="text-lg">{resume.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Uploaded: {format(new Date(resume.uploadedAt), 'MMM d, yyyy')}
                </p>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(resume.fileUrl)}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(resume._id)}
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

