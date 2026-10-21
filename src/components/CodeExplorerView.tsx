import React, { useState } from 'react';
import { JAVA_PROJECT_FILES, JavaFileEntry } from '../data/javaProjectFiles';
import JSZip from 'jszip';
import { 
  Folder, 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Search, 
  FileText, 
  Package, 
  Database, 
  Settings 
} from 'lucide-react';

export const CodeExplorerView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<JavaFileEntry>(JAVA_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isZipping, setIsZipping] = useState(false);

  const filteredFiles = JAVA_PROJECT_FILES.filter((f) => {
    if (filterCategory !== 'ALL' && f.category !== filterCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return f.path.toLowerCase().includes(q) || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();

      // Add all project files
      for (const f of JAVA_PROJECT_FILES) {
        zip.file(f.path, f.content);
      }

      // Add schema scripts & README
      zip.file('database/schema.sql', `-- Database Schema\n` + (JAVA_PROJECT_FILES.find((f) => f.path.includes('schema'))?.content || ''));
      zip.file('README.md', `# Online Book Store Management System\nAlliance University B.Tech CSE Micro-Project\n\nRun 'mvn clean package' and deploy to Apache Tomcat 10.1.`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'online-book-store-management-system.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip archive', err);
      alert('Could not generate zip archive.');
    } finally {
      setIsZipping(false);
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Files' },
    { id: 'POM', label: 'pom.xml' },
    { id: 'CONFIG', label: 'web.xml' },
    { id: 'MODEL', label: 'Models' },
    { id: 'DAO', label: 'DAOs' },
    { id: 'SERVICE', label: 'Services' },
    { id: 'CONTROLLER', label: 'Servlets' },
    { id: 'FILTER', label: 'Filters' },
    { id: 'UTIL', label: 'Utilities' },
    { id: 'JSP_CLIENT', label: 'Client JSPs' },
    { id: 'TEST', label: 'JUnit Tests' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded uppercase">
                Source Repository Explorer
              </span>
              <span className="text-xs text-slate-400 font-mono">Maven Standard Directory Layout</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Java EE / Jakarta 10 Codebase Explorer
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Inspect production Java classes, DAOs with PreparedStatements, Service layer transactions, Servlets, and JSP templates.
            </p>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg flex items-center gap-2 disabled:opacity-50 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            {isZipping ? 'Packaging Project ZIP...' : 'Download Full Project (.ZIP)'}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: File Tree & Filter */}
          <div className="lg:col-span-4 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col max-h-[750px]">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search file name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-1 overflow-x-auto pb-2 mb-3 text-[11px]">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                    filterCategory === cat.id ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto space-y-1 text-xs">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-900/60 text-amber-300 border border-blue-500/40'
                        : 'text-slate-300 hover:bg-slate-900/90'
                    }`}
                  >
                    <FileCode className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs font-semibold truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{file.path}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Code Viewer */}
          <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-xl">
            {/* Viewer Header */}
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-mono text-xs font-bold text-amber-400 flex items-center gap-2">
                  <span>{selectedFile.path}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded uppercase">
                    {selectedFile.language}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{selectedFile.description}</p>
              </div>

              <button
                onClick={handleCopy}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-x-auto max-h-[640px] text-xs font-mono leading-relaxed bg-slate-950 text-slate-200 selection:bg-amber-400 selection:text-slate-950">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
