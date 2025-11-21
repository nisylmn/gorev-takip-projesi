import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TaskService, TaskItem } from '../services/task';
import { AuthService } from '../services/auth';
import { ToastrService } from 'ngx-toastr';
import { DateValidatorService } from '../services/date-validator.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.comp.html',
  styleUrls: ['./dashboard.comp.css'],
})
export class DashboardComponent implements OnInit {
  myCreatedTasks: TaskItem[] = [];
  assignedToMeTasks: TaskItem[] = [];

  newTask: TaskItem = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isCompleted: false,
  };

  today: string = new Date().toISOString().split('T')[0];
  userInfo: any = null;
  private apiUrl = 'http://localhost:5066/api';
  private authHeader!: HttpHeaders;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private toastr: ToastrService,
    private dateValidator: DateValidatorService
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getCurrentUser();
    console.log('📌 Giriş yapan kullanıcı:', this.userInfo);

    const token = localStorage.getItem('token');
    this.authHeader = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.loadMyCreatedTasks();
    this.loadAssignedToMeTasks();
  }

  loadMyCreatedTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (data: TaskItem[]) => {
        this.myCreatedTasks = data;
        console.log('✅ Oluşturduğum görevler yüklendi:', this.myCreatedTasks);
      },
      error: () => this.toastr.error('Görevler yüklenirken hata oluştu!'),
    });
  }

  loadAssignedToMeTasks(): void {
    this.taskService.getMyAssignedTasks().subscribe({
      next: (data: TaskItem[]) => {
        this.assignedToMeTasks = data;
        console.log('✅ Bana atanan görevler yüklendi:', this.assignedToMeTasks);
      },
      error: () => this.toastr.error('Atanan görevler yüklenirken hata oluştu!'),
    });
  }

  getCreatedCompletedCount(): number {
    return this.myCreatedTasks.filter((task) => task.isCompleted).length;
  }
  getCreatedPendingCount(): number {
    return this.myCreatedTasks.filter((task) => !task.isCompleted).length;
  }
  getAssignedCompletedCount(): number {
    return this.assignedToMeTasks.filter((task) => task.isCompleted).length;
  }
  getAssignedPendingCount(): number {
    return this.assignedToMeTasks.filter((task) => !task.isCompleted).length;
  }

  addTask(): void {
    // 🔹 Tarih doğrulaması (servis)
    if (!this.dateValidator.validateDates(this.newTask.startDate, this.newTask.endDate)) return;

    // 🔹 Başlık kontrolü
    if (!this.newTask.title.trim()) {
      this.toastr.warning('Lütfen görev başlığı girin!');
      return;
    }

    const taskToSend: TaskItem = {
      ...this.newTask,
      startDate: new Date(this.newTask.startDate).toISOString(),
      endDate: new Date(this.newTask.endDate).toISOString(),
    };

    this.taskService.addTask(taskToSend).subscribe({
      next: (addedTask: TaskItem) => {
        console.log('✅ Görev eklendi:', addedTask);
        this.loadMyCreatedTasks();
        this.newTask = {
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          isCompleted: false,
        };
        this.toastr.success('Görev başarıyla eklendi!');
      },
      error: () => this.toastr.error('Görev eklenirken bir hata oluştu!'),
    });
  }

  toggleCreatedTaskCompletion(task: TaskItem): void {
    if (!task.id) return;

    task.isCompleted = !task.isCompleted;
    this.taskService.updateTask(task.id, task).subscribe({
      next: () => {
        this.toastr.info(task.isCompleted ? 'Görev tamamlandı!' : 'Görev geri alındı!');
        console.log('✅ Görev durumu güncellendi:', task.title);
      },
      error: () => {
        task.isCompleted = !task.isCompleted;
        this.toastr.error('Görev durumu güncellenirken hata oluştu!');
      },
    });
  }

  toggleAssignedTaskCompletion(task: TaskItem): void {
    if (!task.id) return;

    const endpoint = task.isCompleted
      ? `${this.apiUrl}/tasks/${task.id}/uncomplete`
      : `${this.apiUrl}/tasks/${task.id}/complete`;

    this.http.put(endpoint, {}, { headers: this.authHeader }).subscribe({
      next: () => {
        task.isCompleted = !task.isCompleted;
        this.toastr.success(task.isCompleted ? 'Görev tamamlandı!' : 'Görev geri alındı!');
      },
      error: () => this.toastr.error('İşlem sırasında bir hata oluştu!'),
    });
  }

  deleteCreatedTask(taskId: number | undefined): void {
    if (!taskId) return;

    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.myCreatedTasks = this.myCreatedTasks.filter((t) => t.id !== taskId);
          this.toastr.info('Görev silindi.');
        },
        error: () => this.toastr.error('Görev silinirken hata oluştu!'),
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.toastr.info('Oturum kapatıldı!');
    this.router.navigate(['/login']);
  }

  goToAssign(): void {
    this.router.navigate(['/assign']);
  }
}
