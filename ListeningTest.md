# IELTS Listening Test API Documentation

## Overview
This document outlines the complete flow and API endpoints for the IELTS Listening Test module. The system provides functionality for test creation, management, taking tests, and grading submissions.

## Authentication
All endpoints require authentication using JWT tokens:
```http
Authorization: Bearer <your_jwt_token>
```

## Test Management Flow

### 1. Test Creation (Admin Only)

#### Create a New Test
```http
POST /api/listening-tests
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "testName": "Academic Listening Test 1",
  "testType": "academic", // or "general"
  "sections": ["section_id1", "section_id2", "section_id3", "section_id4"],
  "totalQuestions": 40,
  "duration": 30,
  "instructions": "Listen to the audio and answer the questions..."
}
```
**File Upload:**
- Field name: `answerSheet`
- Type: PDF
- Max size: 5MB

### 2. Section Management (Admin Only)

#### Create a Section
```http
POST /api/sections
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "sectionName": "Section 1",
  "questions": ["question_id1", "question_id2", ...]
}
```
**File Uploads:**
- Audio file (required):
  - Field name: `audio`
  - Types: MP3, WAV
  - Max size: 20MB
- Image (optional):
  - Field name: `image`
  - Types: JPEG, PNG
- PDF (optional):
  - Field name: `pdf`
  - Type: PDF

### 3. Question Management (Admin Only)

#### Create Questions
```http
POST /api/questions
```

**Request Body:**
```json
{
  "questionText": "What is the speaker's name?",
  "answerType": "short-answer",
  "correctAnswer": "John Smith",
  "instructions": "Write NO MORE THAN TWO WORDS"
}
```

## Test Taking Flow

### 1. View Available Tests

#### List All Tests
```http
GET /api/listening-tests
```

**Response:**
```json
{
  "tests": [
    {
      "id": "test_id",
      "testName": "Academic Listening Test 1",
      "testType": "academic",
      "duration": 30,
      "totalQuestions": 40,
      "sections": [...]
    }
  ]
}
```

### 2. Start Test

#### Get Test Details
```http
GET /api/listening-tests/:id
```

**Response includes:**
- Test information
- Section details
- Audio URLs
- Questions
- Instructions

### 3. Test Submission

#### Submit Answers
```http
POST /api/submitted-listening-tests/submit
```

**Request Body:**
```json
{
  "testId": "test_id",
  "answers": [
    {
      "questionId": "question_id",
      "answer": "user's answer"
    }
  ],
  "completionTime": 28 // Time taken in minutes
}
```

## Grading Flow (Admin Only)

### 1. View Pending Submissions
```http
GET /api/admin/submissions/pending
```

### 2. Grade a Submission
```http
PUT /api/admin/submissions/listening/:submissionId/grade
```

**Request Body:**
```json
{
  "grade": 7.5,
  "feedback": "Detailed feedback about performance"
}
```

## User Results Flow

### 1. View Submissions

#### Get User's Submissions
```http
GET /api/submitted-listening-tests/my-submissions
```

#### Get Specific Submission
```http
GET /api/submitted-listening-tests/:id
```

### 2. View Statistics
```http
GET /api/admin/submissions/stats
```

## Models

### ListeningTest
```javascript
{
  testName: String,
  testType: String, // 'academic' or 'general'
  sections: [{ type: ObjectId, ref: 'Section' }],
  totalQuestions: Number,
  duration: Number,
  answerSheetPDF: String,
  instructions: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Section
```javascript
{
  sectionName: String,
  audio: String, // File path
  image: String, // Optional file path
  pdf: String,   // Optional file path
  questions: [{ type: ObjectId, ref: 'Question' }]
}
```

### Question
```javascript
{
  questionText: String,
  answerType: String,
  correctAnswer: String,
  instructions: String
}
```

### SubmittedListeningTest
```javascript
{
  user: ObjectId,
  test: ObjectId,
  answers: [{
    questionId: ObjectId,
    answer: String
  }],
  grade: Number,
  feedback: String,
  status: String, // 'pending' or 'graded'
  submittedAt: Date,
  gradedAt: Date,
  gradedBy: ObjectId
}
```

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
  "message": "Error description",
  "errors": [] // Validation errors if any
}
```

## Best Practices

### For Test Creation
1. Always validate audio files before upload
2. Ensure sections are in correct order (1-4)
3. Verify all questions have correct answers
4. Include clear instructions for each section

### For Test Taking
1. Implement audio preloading
2. Handle network interruptions gracefully
3. Auto-save answers periodically
4. Validate answers before submission
5. Track completion time accurately

### For Grading
1. Follow IELTS grading guidelines
2. Provide constructive feedback
3. Double-check grades before submission
4. Monitor grading consistency

## Security Considerations
1. Enforce authentication for all routes
2. Validate file uploads
3. Implement rate limiting
4. Sanitize user inputs
5. Secure audio file access
6. Protect answer sheets

## File Storage
1. Audio files: `/uploads/audio`
2. Answer sheets: `/uploads/answer-sheets`
3. Images: `/uploads/images`
4. PDFs: `/uploads/pdfs`

## Monitoring and Maintenance
1. Track submission success rates
2. Monitor file storage usage
3. Audit grading patterns
4. Clean up unused files
5. Regular backup of test data 