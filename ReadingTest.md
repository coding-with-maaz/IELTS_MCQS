# IELTS Reading Test API Documentation

## Overview
This document outlines the complete flow and API endpoints for the IELTS Reading Test module. The system provides functionality for test creation, management, test taking, and admin-based grading.

## Authentication
All endpoints require authentication using JWT tokens:
```http
Authorization: Bearer <your_jwt_token>
```

## Test Management Flow

### 1. Test Creation (Admin Only)

#### Create a Reading Test
```http
POST /api/reading-tests
```

**Request Body:**
```json
{
  "testName": "Academic Reading Test 1",
  "testType": "academic", // or "general"
  "sections": ["section_id1", "section_id2", "section_id3"],
  "timeLimit": 60
}
```

### 2. Section Management (Admin Only)

#### Create a Section
```http
POST /api/reading-sections
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "sectionName": "Section 1",
  "passageText": "Reading passage content...",
  "questions": ["question_id1", "question_id2", ...]
}
```

**File Uploads:**
- Image (optional):
  - Field name: `image`
  - Types: JPEG, PNG
- PDF (optional):
  - Field name: `pdf`
  - Type: PDF
- Max size: 20MB for each file

### 3. Question Management (Admin Only)

#### Create Questions
```http
POST /api/reading-questions
```

**Request Body:**
```json
{
  "questionText": "What is the main idea of paragraph 2?",
  "answerType": "multiple-choice",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "option2",
  "instructions": "Choose the correct letter, A-D",
  "paragraphReference": 2
}
```

**Question Types:**
- multiple-choice
- true-false-not-given
- short-answer
- sentence-completion
- notes-completion
- summary-completion
- matching-paragraphs
- matching

## Test Taking Flow

### 1. View Available Tests

#### List All Tests
```http
GET /api/reading-tests
```

**Response:**
```json
{
  "tests": [
    {
      "id": "test_id",
      "testName": "Academic Reading Test 1",
      "testType": "academic",
      "timeLimit": 60,
      "sections": [...]
    }
  ]
}
```

### 2. Start Test

#### Get Test Details
```http
GET /api/reading-tests/:id
```

**Response includes:**
- Test information
- Section details with passage text
- Questions
- Time limit
- Instructions

### 3. Test Submission

#### Submit Test
```http
POST /api/reading-tests/:id/submit
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "answers": {
    "question_id1": "user's answer",
    "question_id2": "user's answer"
  }
}
```

**File Upload:**
- Field name: `answerSheet`
- Type: PDF
- Max size: 10MB

## Grading Flow (Admin Only)

### 1. View Pending Submissions
```http
GET /api/reading-tests/submissions/pending
```

### 2. Grade a Submission
```http
PUT /api/reading-tests/:id/grade
```

**Request Body:**
```json
{
  "bandScore": 7.5,
  "feedback": "Detailed feedback about performance"
}
```

## Models

### ReadingTest
```javascript
{
  testName: String,
  testType: String, // 'academic' or 'general'
  sections: [{ type: ObjectId, ref: 'ReadingSection' }],
  timeLimit: Number, // in minutes
  answerSheet: String // PDF file path
}
```

### ReadingSection
```javascript
{
  sectionName: String,
  passageText: String,
  questions: [{ type: ObjectId, ref: 'ReadingQuestion' }],
  image: String,  // Optional file path
  pdf: String     // Optional file path
}
```

### ReadingQuestion
```javascript
{
  questionText: String,
  answerType: String,
  options: [String],
  correctAnswer: String,
  instructions: String,
  paragraphReference: Number
}
```

### SubmittedReadingTest
```javascript
{
  user: ObjectId,
  test: ObjectId,
  answers: [{
    questionId: ObjectId,
    answer: String
  }],
  bandScore: Number,
  feedback: String,
  status: String, // 'pending' or 'graded'
  submittedAt: Date,
  gradedAt: Date,
  gradedBy: ObjectId,
  answerSheet: String
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

## Security Considerations

### Authentication and Authorization
1. All routes require authentication
2. Admin-only routes are protected
3. Users can only access their own submissions
4. File uploads are validated and restricted

### File Upload Security
1. File type validation
2. File size limits
3. Secure file storage
4. Unique filename generation

## Best Practices

### For Test Creation
1. Provide clear instructions for each question
2. Include paragraph references where applicable
3. Validate all correct answers
4. Structure sections logically
5. Include relevant supporting materials (PDFs, images)

### For Test Taking
1. Submit answers within time limit
2. Upload clear, legible answer sheets
3. Follow question-specific instructions
4. Review answers before submission

### For Grading
1. Review answer sheets thoroughly
2. Provide constructive feedback
3. Use standardized IELTS band scoring
4. Include section-specific comments
5. Grade submissions in a timely manner

## File Storage Structure
1. Answer sheets: `/uploads/answer-sheets`
2. Section materials: `/uploads/sections`
3. Supporting documents: `/uploads/documents`

## Monitoring and Maintenance
1. Track submission status
2. Monitor grading timelines
3. Maintain file storage
4. Regular backup of test data
5. Archive completed tests 