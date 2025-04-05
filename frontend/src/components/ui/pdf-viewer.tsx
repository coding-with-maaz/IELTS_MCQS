import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Download, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Process the PDF URL to make it web-compatible
  const processPdfUrl = (url: string): string => {
    const isLocalFilePath = url.startsWith('F:') || url.startsWith('C:') || url.startsWith('D:') || 
                           url.startsWith('file:') || url.includes(':\\');
    
    if (isLocalFilePath) {
      const filename = url.split(/[\/\\]/).pop();
      return `http://backend.abspak.com/uploads/${filename}`;
    }
    
    if (url.startsWith('uploads/')) {
      return `http://backend.abspak.com/${url}`;
    }
    
    return url;
  };

  const processedPdfUrl = React.useMemo(() => processPdfUrl(pdfUrl), [pdfUrl]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
    
    // Add a cache buster to the URL
    const cacheBuster = `?v=${Date.now()}`;
    const newUrl = processedPdfUrl.includes('?') 
      ? processedPdfUrl 
      : processedPdfUrl + cacheBuster;
    
    // Force reload the iframe
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.src = newUrl;
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError("Failed to load PDF file. Please ensure the file is accessible.");
    toast({
      title: "PDF Error",
      description: "Could not load the PDF file. Please check if the file exists and try again.",
      variant: "destructive",
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = processedPdfUrl;
    link.download = title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(processedPdfUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-xl border border-gray-200 p-4 subtle-shadow"
    >
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100"
              onClick={handleOpenInNewTab}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      )}

      {error ? (
        <div className="text-red-500 p-4 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="font-medium">{error}</p>
          <div className="text-sm text-gray-600 mt-2 mb-3">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{processedPdfUrl}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      ) : (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="h-8 w-8 border-2 border-blue-500 border-opacity-30 border-t-blue-500 rounded-full"
              />
            </div>
          )}
          <iframe
            src={processedPdfUrl}
            className="w-full h-[600px] rounded-lg border border-gray-200"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      )}
    </motion.div>
  );
};

export default PDFViewer; 