import { Pipe, PipeTransform } from '@angular/core';
import { AppUser } from '../models/user.model';

@Pipe({
  name: 'userDisplayName',
  standalone: true
})
export class UserDisplayNamePipe implements PipeTransform {
  transform(user: AppUser | null | undefined): string {
    if (!user) return '';

    if (user.displayName?.trim()) {
      return user.displayName.trim();
    } else {
      const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
      return fullName || user.email || '';
    }
  }
}
