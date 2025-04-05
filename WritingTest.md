# IELTS Writing Test API Documentation

## Overview
This document outlines the complete API endpoints and functionality for the IELTS Writing Test module. The system provides functionality for test creation, management, test taking, and admin-based grading.

## Authentication
All endpoints require authentication using JWT tokens:
```http
Authorization: Bearer <your_jwt_token>
```

## Test Structure
Each writing test consists of:
- Two tasks (Task 1 and Task 2)
- Task 1: 20 minutes, 150 words minimum
- Task 2: 40 minutes, 250 words minimum
- Total time: 60 minutes

## API Endpoints

### 1. Test Management (Admin Only)

#### Create Writing Test
```http
POST /api/writing-tests
Content-Type: application/json
```

**Request Body:**
```json
{
  "testName": "Academic Writing Test 1",
  "testType": "academic",
  "instructions": "Complete both tasks within the time limit.",
  "timeLimit": 60,
  "sections": ["section_id1", "section_id2"]
}
```

#### Get All Tests
```http
GET /api/writing-tests
```

#### Get Specific Test
```http
GET /api/writing-tests/:id
```

#### Delete Test
```http
DELETE /api/writing-tests/:id
```

### 2. Section Management (Admin Only)

#### Create Section
```http
POST /api/writing-sections
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "sectionName": "Task 1",
  "taskType": "task1",
  "instructions": "Describe the graph in your own words.",
  "minimumWords": 150,
  "timeLimit": 20,
  "questions": ["question_id1"]
}
```

**File Uploads:**
- Image (optional):
  - Field name: `image`
  - Types: JPEG, PNG
- PDF (optional):
  - Field name: `pdf`
  - Type: PDF
- Max size: 10MB for each file

#### Update Section
```http
PUT /api/writing-sections/:id
```

#### Delete Section
```http
DELETE /api/writing-sections/:id
```

### 3. Question Management (Admin Only)

#### Create Question
```http
POST /api/writing-questions
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "questionText": "The graph below shows...",
  "questionType": "graph-description",
  "instructions": "Write at least 150 words about...",
  "evaluationCriteria": {
    "taskAchievement": "Criteria for task achievement",
    "coherenceAndCohesion": "Criteria for coherence",
    "lexicalResource": "Criteria for vocabulary",
    "grammaticalRangeAndAccuracy": "Criteria for grammar"
  },
  "sampleAnswer": "A model answer for reference"
}
```

**File Upload:**
- Diagram (optional):
  - Field name: `diagram`
  - Types: JPEG, PNG, PDF
  - Max size: 5MB

### 4. Test Taking (Users)

#### Submit Test
```http
POST /api/writing-tests/:id/submit
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "answers": {
    "task1": {
      "content": "User's answer for task 1",
      "wordCount": 165,
      "completionTime": 18
    },
    "task2": {
      "content": "User's answer for task 2",
      "wordCount": 275,
      "completionTime": 38
    }
  }
}
```

**File Upload:**
- Answer Sheet:
  - Field name: `answerFile`
  - Types: PDF, DOC, DOCX
  - Max size: 10MB

### 5. Grading System (Admin Only)

#### View Pending Submissions
```http
GET /api/writing-tests/submissions/pending
```

#### View All Submissions
```http
GET /api/writing-tests/submissions/all
```

#### Grade Submission
```http
PUT /api/writing-tests/submissions/:submissionId/grade
Content-Type: application/json
```

**Request Body:**
```json
{
  "grades": {
    "taskAchievement": 7,
    "coherenceAndCohesion": 7,
    "lexicalResource": 6,
    "grammaticalRangeAndAccuracy": 7
  },
  "feedback": {
    "task1": "Detailed feedback for task 1",
    "task2": "Detailed feedback for task 2",
    "general": "Overall feedback"
  },
  "overallBandScore": 6.5
}
```

## Models

### WritingTest
```javascript
{
  testName: String,
  testType: String, // 'academic' or 'general'
  sections: [{ type: ObjectId, ref: 'WritingSection' }],
  timeLimit: Number,
  instructions: String,
  answerSheet: String, // template path
  createdAt: Date,
  updatedAt: Date
}
```

### WritingSection
```javascript
{
  sectionName: String,
  taskType: String, // 'task1' or 'task2'
  questions: [{ type: ObjectId, ref: 'WritingQuestion' }],
  minimumWords: Number,
  timeLimit: Number,
  instructions: String,
  pdf: String,
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

### WritingQuestion
```javascript
{
  questionText: String,
  questionType: String,
  instructions: String,
  evaluationCriteria: {
    taskAchievement: String,
    coherenceAndCohesion: String,
    lexicalResource: String,
    grammaticalRangeAndAccuracy: String
  },
  sampleAnswer: String,
  diagramUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### SubmittedWritingTest
```javascript
{
  user: ObjectId,
  test: ObjectId,
  answers: {
    task1: {
      content: String,
      wordCount: Number,
      completionTime: Number
    },
    task2: {
      content: String,
      wordCount: Number,
      completionTime: Number
    }
  },
  answerSheet: String,
  status: String, // 'pending' or 'graded'
  grades: {
    taskAchievement: Number,
    coherenceAndCohesion: Number,
    lexicalResource: Number,
    grammaticalRangeAndAccuracy: Number
  },
  overallBandScore: Number,
  feedback: {
    task1: String,
    task2: String,
    general: String
  },
  submittedAt: Date,
  gradedAt: Date,
  gradedBy: ObjectId
}
```

## File Storage Structure

### Directories
```
uploads/
├── writing-answers/    # User submitted answer sheets
├── sections/          # Section materials (PDFs, images)
└── diagrams/          # Question diagrams and visuals
```

## Security Considerations

1. **Authentication and Authorization**
   - All routes require JWT authentication
   - Admin-only routes are protected with isAdmin middleware
   - Users can only access their own submissions
   - File uploads are validated and restricted

2. **File Upload Security**
   - File type validation
   - File size limits
   - Secure file storage
   - Unique filename generation

## Best Practices

### For Test Creation
1. Provide clear instructions for each task
2. Include relevant supporting materials
3. Set appropriate word limits and time limits
4. Include detailed evaluation criteria
5. Provide sample answers for reference

### For Test Taking
1. Submit answers within time limit
2. Meet minimum word count requirements
3. Upload clear, legible answer sheets
4. Follow task-specific instructions

### For Grading
1. Review answers thoroughly against criteria
2. Provide constructive feedback for each task
3. Use standardized IELTS band scoring
4. Grade submissions promptly
5. Include specific examples in feedback

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

## Monitoring and Maintenance
1. Track submission status
2. Monitor grading timelines
3. Maintain file storage
4. Regular backup of test data
5. Archive completed tests 