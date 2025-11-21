import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService, TaskItem } from '../services/task';
import { UserService } from '../services/user';
import { AuthService } from '../services/auth';
import { ToastrService } from 'ngx-toastr';
import { DateValidatorService } from '../services/date-validator.service';

@Component({
  selector: 'app-assign',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign.comp.html',
  styleUrls: ['./assign.comp.css'],
})
export class AssignComponent implements OnInit, OnDestroy {
  allUsers: any[] = [];
  selectedUser: any = null;
  selectedUserId: number | null = null;
  userTasks: TaskItem[] = [];
  chartData: any[] = [];
  currentUser: any = null;

  newTask: TaskItem = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isCompleted: false,
  };

  today: string = new Date().toISOString().split('T')[0];

  stats = {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
  };

  private refreshInterval: any;

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private dateValidator: DateValidatorService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('📌 Giriş yapmış kullanıcı:', this.currentUser);

    this.loadAllUsers();

    this.refreshInterval = setInterval(() => {
      if (this.selectedUser) this.loadUserTasks(true);
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  loadAllUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users: any[]) => {
        this.allUsers = users.filter((u) => u.id !== this.currentUser?.id);
        console.log('✅ Kullanıcılar yüklendi:', this.allUsers);
        if (this.allUsers.length > 0) this.selectUser(this.allUsers[0]);
        this.prepareChartData();
      },
      error: (err: any) => console.error('❌ Kullanıcı yükleme hatası:', err),
    });
  }

  selectUser(user: any): void {
    this.selectedUser = user;
    this.selectedUserId = user.id;
    console.log('👤 Seçilen kullanıcı:', user);
    this.loadUserTasks();
  }

  loadUserTasks(silent: boolean = false): void {
    if (!this.selectedUser) return;
    if (!silent) console.log('🔄 Kullanıcı görevleri yükleniyor:', this.selectedUser.id);

    this.taskService.getTasksAssignedToUser(this.selectedUser.id).subscribe({
      next: (tasks: TaskItem[]) => {
        this.userTasks = tasks;
        if (!silent) console.log(`✅ ${this.selectedUser.fullName} için görevler:`, this.userTasks);
        this.calculateStats();
      },
      error: (err: any) => {
        if (!silent) console.error('❌ Görev yükleme hatası:', err);
        this.userTasks = [];
      },
    });
  }

  calculateStats(): void {
    this.stats.totalTasks = this.userTasks.length;
    this.stats.completedTasks = this.userTasks.filter((t) => t.isCompleted).length;
    this.stats.pendingTasks = this.userTasks.filter((t) => !t.isCompleted).length;
    this.stats.completionRate =
      this.stats.totalTasks > 0
        ? Math.round((this.stats.completedTasks / this.stats.totalTasks) * 100)
        : 0;
  }

  assignTask() {
    if (!this.dateValidator.validateDates(this.newTask.startDate, this.newTask.endDate)) return;

    const start = new Date(this.newTask.startDate);
    const end = new Date(this.newTask.endDate);

    const taskToSend: TaskItem = {
      title: this.newTask.title,
      description: this.newTask.description,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      isCompleted: false,
      userAssignedId: this.selectedUser.id,
    };

    this.taskService.addTask(taskToSend).subscribe({
      next: (addedTask: TaskItem) => {
        console.log('✅ Görev atandı:', addedTask);
        this.loadUserTasks();
        this.newTask = {
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          isCompleted: false,
        };
        this.toastr.success('Görev başarıyla atandı!');
      },
      error: () => this.toastr.error('Görev atanırken hata oluştu!'),
    });
  }

  deleteTask(taskId: number | undefined): void {
    if (!taskId) return;

    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.userTasks = this.userTasks.filter((t) => t.id !== taskId);
          this.calculateStats();
          this.toastr.info('Görev silindi.');
        },
        error: (err: any) => {
          this.toastr.error('Görev silinemedi!');
        },
      });
    }
  }

  prepareChartData(): void {
    this.taskService.getTasks().subscribe({
      next: (allTasks: TaskItem[]) => {
        this.chartData = this.allUsers.map((user) => {
          const userTasks = allTasks.filter(
            (t) => t.userId === user.id || t.userAssignedId === user.id
          );
          return {
            name: user.fullName,
            total: userTasks.length,
            completed: userTasks.filter((t) => t.isCompleted).length,
            pending: userTasks.filter((t) => !t.isCompleted).length,
          };
        });
        console.log('📊 Grafik verisi hazırlandı:', this.chartData);
      },
      error: (err: any) => console.error('❌ Grafik verisi hatası:', err),
    });
  }

  refreshTasks(): void {
    this.loadUserTasks();
    this.toastr.info('Görevler yenilendi!');
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getBarHeight(value: number, max: number): string {
    if (max === 0) return '0%';
    return `${(value / max) * 100}%`;
  }

  getMaxTasks(): number {
    return Math.max(...this.chartData.map((d) => d.total), 1);
  }
}
