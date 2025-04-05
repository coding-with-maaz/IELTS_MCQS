
/**
 * Validates file size and type
 */
export const validateFile = (
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } => {
  const { maxSizeMB = 5, allowedTypes = [] } = options;
  
  // Check file size
  const fileSizeInMB = file.size / (1024 * 1024);
  if (maxSizeMB && fileSizeInMB > maxSizeMB) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit (${fileSizeInMB.toFixed(2)}MB)`,
    };
  }
  
  // Check file type if restrictions provided
  if (allowedTypes.length > 0) {
    const fileType = file.type;
    if (!allowedTypes.includes(fileType)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }
  }
  
  return { valid: true };
};

/**
 * Creates a FormData object with files and form values
 */
export const createFormDataWithFiles = (
  files: Record<string, File | File[] | null>,
  formValues: Record<string, any> = {}
): FormData => {
  const formData = new FormData();
  
  // Add form values
  Object.entries(formValues).forEach(([key, value]) => {
    // Handle arrays and objects by stringifying them
    if (typeof value === 'object' && value !== null && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });
  
  // Add files
  Object.entries(files).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        // Handle multiple files
        value.forEach((file) => {
          formData.append(key, file);
        });
      } else {
        // Handle single file
        formData.append(key, value);
      }
    }
  });
  
  return formData;
};

/**
 * Create object URL for a file
 */
export const createFilePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Clean up object URL to prevent memory leaks
 */
export const revokeFilePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};
