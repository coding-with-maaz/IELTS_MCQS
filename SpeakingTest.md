# IELTS Speaking Test API Documentation

## Overview
This document outlines the API endpoints and functionality for the IELTS Speaking Test module. The system provides functionality for test creation, management, and test taking. Each test consists of sections with audio files for practice.

## Authentication
All endpoints require authentication using JWT tokens:
```http
Authorization: Bearer <your_jwt_token>
```

## Test Structure
Each speaking test consists of:
- Multiple sections (typically 3 parts)
- Each section contains:
  - Audio file for practice/instruction
  - Optional supporting materials (PDF/Image)
  - Time limit for practice
- Total test duration: 15 minutes (typical)

## API Endpoints

### 1. Test Management (Admin Only)

#### Create Speaking Test
```http
POST /api/speaking-tests
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "testName": "IELTS Speaking Test 1",
  "timeLimit": 15,
  "sections": ["section_id1", "section_id2", "section_id3"]
}
```

**File Upload:**
- Audio file (optional):
  - Field name: `audio`
  - Types: MP3, WAV
  - Max size: 20MB

#### Get All Tests
```http
GET /api/speaking-tests
```

#### Get Specific Test
```http
GET /api/speaking-tests/:id
```

#### Update Test
```http
PUT /api/speaking-tests/:id
Content-Type: multipart/form-data
```

#### Delete Test
```http
DELETE /api/speaking-tests/:id
```

### 2. Section Management (Admin Only)

#### Create Section
```http
POST /api/speaking-sections
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "sectionName": "Part 1: Introduction",
}
```

**File Uploads:**
- Audio (required):
  - Field name: `audio`
  - Types: MP3, WAV
- Image (optional):
  - Field name: `image`
  - Types: JPEG, PNG
- PDF (optional):
  - Field name: `pdf`
  - Type: PDF
- Max size: 20MB for each file

#### Update Section
```http
PUT /api/speaking-sections/:id
```

#### Delete Section
```http
DELETE /api/speaking-sections/:id
```

### 3. Test Taking (Users)

#### Submit Test Recording
```http
POST /api/speaking-tests/:id/submit
Content-Type: multipart/form-data
```

**File Upload:**
- Recording:
  - Field name: `recording`
  - Types: MP3, WAV
  - Max size: 20MB

## Models

### SpeakingTest
```javascript
{
  testName: String,
  sections: [{ type: ObjectId, ref: 'SpeakingSection' }],
  timeLimit: Number,
  audioFile: {
    filename: String,
    path: String,
    mimetype: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### SpeakingSection
```javascript
{
  sectionName: String,
  audioFile: {
    filename: String,
    path: String,
    mimetype: String
  },
  pdf: {
    filename: String,
    path: String,
    mimetype: String
  },
  image: {
    filename: String,
    path: String,
    mimetype: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## File Storage Structure

### Directories
```
uploads/
├── speaking-tests/     # Test audio files
├── speaking-sections/  # Section audio files
├── pdfs/              # Supporting PDFs
└── images/            # Supporting images
```

## Security Considerations

1. **Authentication and Authorization**
   - All routes require JWT authentication
   - Admin-only routes are protected
   - File uploads are validated and restricted

2. **File Upload Security**
   - File type validation
   - File size limits
   - Secure file storage
   - Unique filename generation

## Best Practices

### For Test Creation
1. Provide clear audio instructions
2. Include relevant supporting materials
3. Set appropriate time limits
4. Structure sections logically
5. Ensure audio quality is clear

### For Test Taking
1. Use proper recording equipment
2. Follow time limits
3. Listen to instructions carefully
4. Practice with sample tests

## Error Handling

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

### Error Response Format
```json
{
  "message": "Error description"
}
```

## Monitoring and Maintenance
1. Regular audio quality checks
2. Monitor file storage
3. Regular backup of test data
4. Archive completed tests 