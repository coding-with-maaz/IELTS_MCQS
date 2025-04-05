// import { useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { useToast } from '@/components/ui/use-toast';
// import { Loader2, Plus, Trash2, ArrowLeft, FileText } from 'lucide-react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   // useGetTestQuery,
//   // useCreateSectionMutation,
//   // useCreateQuestionMutation,
//   // useDeleteSectionMutation,
//   // useDeleteQuestionMutation,
//   // QuestionType,
//   // CreateQuestionDto
// } from '@/store/api/listeningTestsApi';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// import {
//   ScrollArea,
// } from '@/components/ui/scroll-area';
// import { cn } from '@/lib/utils';
// import { Check } from 'lucide-react';

// export default function ManageTestSections() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   // const { data: test, isLoading } = useGetTestQuery(id!);
//   // const [createSection] = useCreateSectionMutation();
//   // const [createQuestion] = useCreateQuestionMutation();
//   // const [deleteSection] = useDeleteSectionMutation();
//   // const [deleteQuestion] = useDeleteQuestionMutation();

//   const [newSection, setNewSection] = useState({
//     name: '',
//     audio: null as File | null,
//     image: null as File | null,
//     pdf: null as File | null,
//   });

//   const [newQuestion, setNewQuestion] = useState({
//     questionText: '',
//     // answerType: 'short-answer' as QuestionType,
//     options: [] as string[],
//     correctAnswer: '',
//     instructions: '',
//   });

//   const [questionOptions, setQuestionOptions] = useState<string[]>([]);
//   const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

//   const handleCreateSection = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newSection.audio) {
//       toast({
//         title: 'Error',
//         description: 'Audio file is required',
//         variant: 'destructive',
//       });
//       return;
//     }

//     // if (test?.sections.length === 4) {
//     //   toast({
//     //     title: 'Error',
//     //     description: 'Maximum of 4 sections allowed',
//     //     variant: 'destructive',
//     //   });
//     //   return;
//     // }

//     const formData = new FormData();
//     formData.append('name', newSection.name);
//     formData.append('audio', newSection.audio);
//     if (newSection.image) formData.append('image', newSection.image);
//     if (newSection.pdf) formData.append('pdf', newSection.pdf);

//     try {
//       await createSection(formData).unwrap();
//       toast({
//         title: 'Success',
//         description: 'Section created successfully',
//       });
//       setNewSection({
//         name: '',
//         audio: null,
//         image: null,
//         pdf: null,
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to create section',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleCreateQuestion = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedSectionId) {
//       toast({
//         title: 'Error',
//         description: 'Please select a section',
//         variant: 'destructive',
//       });
//       return;
//     }

//     const questionData: CreateQuestionDto = {
//       ...newQuestion,
//       options: newQuestion.answerType === 'multiple-choice' ? questionOptions : undefined,
//       sectionId: selectedSectionId,
//     };

//     try {
//       await createQuestion(questionData).unwrap();
//       toast({
//         title: 'Success',
//         description: 'Question created successfully',
//       });
//       setNewQuestion({
//         questionText: '',
//         answerType: 'short-answer' as QuestionType,
//         options: [],
//         correctAnswer: '',
//         instructions: '',
//       });
//       setQuestionOptions([]);
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to create question',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleDeleteSection = async (sectionId: string) => {
//     if (test?.sections.length === 1) {
//       toast({
//         title: 'Error',
//         description: 'Test must have at least one section',
//         variant: 'destructive',
//       });
//       return;
//     }

//     try {
//       await deleteSection(sectionId).unwrap();
//       toast({
//         title: 'Success',
//         description: 'Section deleted successfully',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to delete section',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleDeleteQuestion = async (questionId: string) => {
//     try {
//       await deleteQuestion(questionId).unwrap();
//       toast({
//         title: 'Success',
//         description: 'Question deleted successfully',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to delete question',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleAddOption = () => {
//     setQuestionOptions([...questionOptions, '']);
//   };

//   const handleOptionChange = (index: number, value: string) => {
//     const newOptions = [...questionOptions];
//     newOptions[index] = value;
//     setQuestionOptions(newOptions);
//   };

//   const handleRemoveOption = (index: number) => {
//     setQuestionOptions(questionOptions.filter((_, i) => i !== index));
//   };

//   if (isLoading) {
//     return (
//       <DashboardLayout title="Manage Test Sections">
//         <div className="flex items-center justify-center h-[calc(100vh-200px)]">
//           <Loader2 className="h-8 w-8 animate-spin" />
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout title="Manage Test Sections">
//       <div className="mb-6">
//         <Button
//           variant="outline"
//           onClick={() => navigate('/dashboard/listening-tests')}
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
//         </Button>
//       </div>

//       <div className="grid gap-6 md:grid-cols-2">
//         <div>
//           <Card>
//             <CardHeader>
//               <CardTitle>Sections ({test?.sections.length || 0}/4)</CardTitle>
//               <CardDescription>
//                 Add and manage sections for this test
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Dialog>
//                 <DialogTrigger asChild>
//                   <Button 
//                     className="w-full" 
//                     disabled={test?.sections.length === 4}
//                   >
//                     <Plus className="mr-2 h-4 w-4" /> Add New Section
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent>
//                   <DialogHeader>
//                     <DialogTitle>Add New Section</DialogTitle>
//                     <DialogDescription>
//                       Create a new section for this test
//                     </DialogDescription>
//                   </DialogHeader>
//                   <form onSubmit={handleCreateSection} className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="name">Section Name</Label>
//                       <Input
//                         id="name"
//                         value={newSection.name}
//                         onChange={(e) =>
//                           setNewSection({ ...newSection, name: e.target.value })
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="audio">Audio File (Required)</Label>
//                       <Input
//                         id="audio"
//                         type="file"
//                         accept="audio/*"
//                         onChange={(e) =>
//                           setNewSection({ ...newSection, audio: e.target.files?.[0] || null })
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="image">Image (Optional)</Label>
//                       <Input
//                         id="image"
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) =>
//                           setNewSection({ ...newSection, image: e.target.files?.[0] || null })
//                         }
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="pdf">PDF (Optional)</Label>
//                       <Input
//                         id="pdf"
//                         type="file"
//                         accept=".pdf"
//                         onChange={(e) =>
//                           setNewSection({ ...newSection, pdf: e.target.files?.[0] || null })
//                         }
//                       />
//                     </div>
//                     <DialogFooter>
//                       <Button type="submit">Create Section</Button>
//                     </DialogFooter>
//                   </form>
//                 </DialogContent>
//               </Dialog>

//               <div className="mt-4 space-y-4">
//                 {test?.sections.map((section) => (
//                   <Card key={section.id}>
//                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                       <CardTitle className="text-base font-medium">
//                         {section.name}
//                       </CardTitle>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => handleDeleteSection(section.id)}
//                         disabled={test.sections.length === 1}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </CardHeader>
//                     <CardContent>
//                       <p className="text-sm text-muted-foreground">
//                         {section.questions.length} questions
//                       </p>
//                       {section.audio && (
//                         <div className="mt-2">
//                           <audio controls className="w-full">
//                             <source src={section.audio} type="audio/mpeg" />
//                             Your browser does not support the audio element.
//                           </audio>
//                         </div>
//                       )}
//                       {section.image && (
//                         <div className="mt-2">
//                           <img 
//                             src={section.image} 
//                             alt={`${section.name} visual`} 
//                             className="w-full h-auto rounded-md"
//                           />
//                         </div>
//                       )}
//                       {section.pdf && (
//                         <div className="mt-2 flex items-center gap-2">
//                           <FileText className="h-4 w-4 text-gray-400" />
//                           <span className="text-sm text-gray-600">PDF material available</span>
//                         </div>
//                       )}
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         <div>
//           <Card>
//             <CardHeader>
//               <CardTitle>Questions</CardTitle>
//               <CardDescription>
//                 Add and manage questions for each section
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Dialog>
//                 <DialogTrigger asChild>
//                   <Button className="w-full">
//                     <Plus className="mr-2 h-4 w-4" /> Add New Question
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent>
//                   <DialogHeader>
//                     <DialogTitle>Add New Question</DialogTitle>
//                     <DialogDescription>
//                       Create a new question for a section
//                     </DialogDescription>
//                   </DialogHeader>
//                   <form onSubmit={handleCreateQuestion} className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="section">Section</Label>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             role="combobox"
//                             className="w-full justify-between"
//                           >
//                             {selectedSectionId ? 
//                               test?.sections.find(s => s.id === selectedSectionId)?.name || "Select section"
//                               : "Select section"
//                             }
//                             <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-[400px] p-0" align="start">
//                           <div className="flex flex-col">
//                             <div className="border-b px-3 py-2">
//                               <input
//                                 className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
//                                 placeholder="Search sections..."
//                               />
//                             </div>
//                             <ScrollArea className="h-[300px]">
//                               <div className="p-2">
//                                 {test?.sections.map((section) => {
//                                   const isSelected = selectedSectionId === section.id;
//                                   return (
//                                     <div
//                                       key={section.id}
//                                       role="button"
//                                       tabIndex={0}
//                                       onClick={() => setSelectedSectionId(section.id)}
//                                       onKeyDown={(e) => {
//                                         if (e.key === 'Enter' || e.key === ' ') {
//                                           e.preventDefault();
//                                           setSelectedSectionId(section.id);
//                                         }
//                                       }}
//                                       className={cn(
//                                         "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none cursor-pointer",
//                                         "hover:bg-accent hover:text-accent-foreground",
//                                         isSelected && "bg-accent"
//                                       )}
//                                     >
//                                       <div
//                                         className={cn(
//                                           "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary",
//                                           isSelected && "bg-primary text-primary-foreground"
//                                         )}
//                                       >
//                                         {isSelected && <Check className="h-3 w-3" />}
//                                       </div>
//                                       <div className="flex flex-col flex-1">
//                                         <span className="font-medium">{section.name}</span>
//                                         <span className="text-xs text-muted-foreground">
//                                           {section.questions.length} questions
//                                         </span>
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </ScrollArea>
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="questionText">Question Text</Label>
//                       <Textarea
//                         id="questionText"
//                         value={newQuestion.questionText}
//                         onChange={(e) =>
//                           setNewQuestion({ ...newQuestion, questionText: e.target.value })
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="answerType">Answer Type</Label>
//                       <Select
//                         value={newQuestion.answerType}
//                         onValueChange={(value: QuestionType) =>
//                           setNewQuestion({ ...newQuestion, answerType: value })
//                         }
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select answer type" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="short-answer">Short Answer</SelectItem>
//                           <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
//                           <SelectItem value="sentence-completion">Sentence Completion</SelectItem>
//                           <SelectItem value="notes-completion">Notes Completion</SelectItem>
//                           <SelectItem value="summary-completion">Summary Completion</SelectItem>
//                           <SelectItem value="matching">Matching</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     {newQuestion.answerType === 'multiple-choice' && (
//                       <div className="space-y-4">
//                         <div className="flex items-center justify-between">
//                           <Label>Options</Label>
//                           <Button
//                             type="button"
//                             variant="outline"
//                             size="sm"
//                             onClick={handleAddOption}
//                           >
//                             Add Option
//                           </Button>
//                         </div>
//                         {questionOptions.map((option, index) => (
//                           <div key={index} className="flex items-center gap-2">
//                             <Input
//                               value={option}
//                               onChange={(e) => handleOptionChange(index, e.target.value)}
//                               placeholder={`Option ${index + 1}`}
//                             />
//                             <Button
//                               type="button"
//                               variant="ghost"
//                               size="icon"
//                               onClick={() => handleRemoveOption(index)}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     <div className="space-y-2">
//                       <Label htmlFor="correctAnswer">Correct Answer</Label>
//                       <Input
//                         id="correctAnswer"
//                         value={newQuestion.correctAnswer}
//                         onChange={(e) =>
//                           setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="instructions">Instructions</Label>
//                       <Textarea
//                         id="instructions"
//                         value={newQuestion.instructions}
//                         onChange={(e) =>
//                           setNewQuestion({ ...newQuestion, instructions: e.target.value })
//                         }
//                         required
//                       />
//                     </div>
//                     <DialogFooter>
//                       <Button type="submit">Create Question</Button>
//                     </DialogFooter>
//                   </form>
//                 </DialogContent>
//               </Dialog>

//               <div className="mt-4 space-y-4">
//                 {test?.sections.map((section) => (
//                   <div key={section.id} className="space-y-2">
//                     <h3 className="font-medium">{section.name}</h3>
//                     {section.questions.map((question) => (
//                       <Card key={question.id}>
//                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                           <div>
//                             <CardTitle className="text-sm font-medium">
//                               {question.questionText}
//                             </CardTitle>
//                             <CardDescription>
//                               Type: {question.answerType}
//                               {question.options && question.options.length > 0 && (
//                                 <div className="mt-1">
//                                   Options: {question.options.join(', ')}
//                                 </div>
//                               )}
//                             </CardDescription>
//                           </div>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => handleDeleteQuestion(question.id)}
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </CardHeader>
//                       </Card>
//                     ))}
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// } 