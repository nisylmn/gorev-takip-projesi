import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class DateValidatorService {
  constructor(private toastr: ToastrService) {}

  validateDates(startDate: string, endDate: string): boolean {
    if (!startDate || !endDate) {
      this.toastr.warning('Lütfen başlangıç ve bitiş tarihlerini girin!');
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      this.toastr.error('Girilen tarih geçersiz!');
      return false;
    }

    if (start < today) {
      this.toastr.error('Geçmiş bir tarihe görev oluşturamazsınız!');
      return false;
    }

    if (end < start) {
      this.toastr.error('Bitiş tarihi başlangıç tarihinden önce olamaz!');
      return false;
    }

    return true;
  }
}
