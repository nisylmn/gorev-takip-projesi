import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TaskItem {
  id?: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  userId?: number;
  userAssignedId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:5066/api/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<TaskItem[]> {
    console.log('🔍 getTasks çağrılıyor');
    return this.http.get<TaskItem[]>(this.apiUrl);
  }

  getTasksAssignedToUser(userId: number): Observable<TaskItem[]> {
    console.log('🔍 getTasksAssignedToUser çağrılıyor - userId:', userId);
    return this.http.get<TaskItem[]>(`${this.apiUrl}/assigned-to/${userId}`);
  }

  getMyAssignedTasks(): Observable<TaskItem[]> {
    console.log('🔍 getMyAssignedTasks çağrılıyor');
    return this.http.get<TaskItem[]>(`${this.apiUrl}/assigned-to-me`);
  }

  getUserTasks(userId: number): Observable<TaskItem[]> {
    console.log('🔍 getUserTasks çağrılıyor - userId:', userId);
    return this.http.get<TaskItem[]>(`${this.apiUrl}/user/${userId}`);
  }

  getTaskById(id: number): Observable<TaskItem> {
    return this.http.get<TaskItem>(`${this.apiUrl}/${id}`);
  }

  addTask(task: TaskItem): Observable<TaskItem> {
    console.log('🔍 addTask çağrılıyor', task);
    return this.http.post<TaskItem>(this.apiUrl, task);
  }

  updateTask(id: number, task: TaskItem): Observable<TaskItem> {
    console.log('🔍 updateTask çağrılıyor - id:', id);
    return this.http.put<TaskItem>(`${this.apiUrl}/${id}`, task);
  }

  completeTask(taskId: number) {
    return this.http.put(`${this.apiUrl}/${taskId}/complete`, {});
  }

  deleteTask(id: number): Observable<void> {
    console.log('🔍 deleteTask çağrılıyor - id:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAllTasks(): Observable<TaskItem[]> {
    console.log('🔍 getAllTasks çağrılıyor (admin)');
    return this.http.get<TaskItem[]>(`${this.apiUrl}/all`);
  }
}
