import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent {
  @Input() eyebrow = 'WELCOME BACK';
  @Input() headline = 'Drive the';
  @Input() headlineAccent = 'exceptional.';
  @Input() description = '';
}
