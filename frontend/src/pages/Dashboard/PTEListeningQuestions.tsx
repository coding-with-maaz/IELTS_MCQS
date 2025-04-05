import { useState } from 'react';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllQuestionsQuery, useCreateQuestionMutation, useDeleteQuestionMutation } from '@/store/api/pteListeningQuestionApi';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { CreateQuestionRequest } from '@/store/api/pteListeningQuestionApi';

export default function PTEListeningQuestions() {
  const [formData, setFormData] = useState<CreateQuestionRequest>({
    questionType: 'multiple_choice',
    questionText: '',
    options: [{ text: '', isCorrect: false }],
    correctAnswer: '',
    explanation: '',
    points: 0,
    audioSegment: {
      startTime: 0,
      endTime: 0,
    },
    difficulty: 'medium',
    order: 0,
    section: undefined
  });

  const { data: questions, isLoading } = useGetAllQuestionsQuery();
  const [createQuestion] = useCreateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setFormData((prev) => {
      const newOptions = [...prev.options];
      newOptions[index] = {
        ...newOptions[index],
        [field]: value,
      };
      return {
        ...prev,
        options: newOptions,
      };
    });
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }],
    }));
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQuestion(formData).unwrap();
      toast.success('Question created successfully');
      setFormData({
        questionType: 'multiple_choice',
        questionText: '',
        options: [{ text: '', isCorrect: false }],
        correctAnswer: '',
        explanation: '',
        points: 0,
        audioSegment: {
          startTime: 0,
          endTime: 0,
        },
        difficulty: 'medium',
        order: 0,
        section: undefined
      });
    } catch (error) {
      toast.error('Failed to create question');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(id).unwrap();
      toast.success('Question deleted successfully');
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout title="PTE Listening Questions">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questionType">Question Type</Label>
                  <Select
                    value={formData.questionType}
                    onValueChange={(value) => handleSelectChange('questionType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                      <SelectItem value="fill_in_blanks">Fill in Blanks</SelectItem>
                      <SelectItem value="highlight_correct_summary">Highlight Correct Summary</SelectItem>
                      <SelectItem value="highlight_incorrect_words">Highlight Incorrect Words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionText">Question Text</Label>
                  <Textarea
                    id="questionText"
                    name="questionText"
                    value={formData.questionText}
                    onChange={handleInputChange}
                    placeholder="Enter question text"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOptionChange(index, 'isCorrect', !option.isCorrect)}
                      >
                        {option.isCorrect ? 'Correct' : 'Incorrect'}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Correct Answer</Label>
                  <Input
                    id="correctAnswer"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    placeholder="Enter correct answer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    name="explanation"
                    value={formData.explanation}
                    onChange={handleInputChange}
                    placeholder="Enter explanation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      name="points"
                      type="number"
                      value={formData.points}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      name="order"
                      type="number"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Audio Start Time (seconds)</Label>
                    <Input
                      id="startTime"
                      name="audioSegment.startTime"
                      type="number"
                      value={formData.audioSegment.startTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          audioSegment: {
                            ...prev.audioSegment,
                            startTime: Number(e.target.value),
                          },
                        }))
                      }
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">Audio End Time (seconds)</Label>
                    <Input
                      id="endTime"
                      name="audioSegment.endTime"
                      type="number"
                      value={formData.audioSegment.endTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          audioSegment: {
                            ...prev.audioSegment,
                            endTime: Number(e.target.value),
                          },
                        }))
                      }
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => handleSelectChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit">Create Question</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions?.map((question) => (
                <div
                  key={question._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{question.questionText}</h3>
                    <p className="text-sm text-muted-foreground">
                      Type: {question.questionType} | Difficulty: {question.difficulty}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(question._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
} 