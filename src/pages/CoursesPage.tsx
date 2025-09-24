import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Users, CheckCircle } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Climate Change Fundamentals',
    description: 'Understand the science behind climate change and its global impact',
    progress: 75,
    modules: 8,
    completedModules: 6,
    duration: '4 weeks',
    students: 1247,
    difficulty: 'Beginner',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 2,
    title: 'Renewable Energy Systems',
    description: 'Explore solar, wind, and other renewable energy technologies',
    progress: 40,
    modules: 12,
    completedModules: 5,
    duration: '6 weeks',
    students: 892,
    difficulty: 'Intermediate',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 3,
    title: 'Sustainable Living Practices',
    description: 'Learn practical ways to reduce your environmental footprint',
    progress: 100,
    modules: 6,
    completedModules: 6,
    duration: '3 weeks',
    students: 2156,
    difficulty: 'Beginner',
    color: 'from-purple-500 to-pink-600'
  }
];

export const CoursesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Courses</h1>
          <p className="text-muted-foreground">Continue your eco-learning journey</p>
        </div>

        <div className="grid gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="group hover:shadow-elevated transition-all duration-300 border-border/50 hover:border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${course.color}`} />
                      <Badge variant="outline" className="text-xs">
                        {course.difficulty}
                      </Badge>
                      {course.progress === 100 && (
                        <Badge className="bg-success/20 text-success border-success/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {course.completedModules} of {course.modules} modules completed
                    </p>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.modules} modules
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.students.toLocaleString()} students
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};