import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { NetworkStatusService } from './core/services/network-status.service';
import { SocketService } from './core/services/socket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class App {
  constructor(
    readonly theme: ThemeService,
    readonly network: NetworkStatusService,
    readonly socket: SocketService
  ) {}
}
