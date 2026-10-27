import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TCL } from './components/tcl/tcl';

@Component({
  imports: [RouterOutlet, TCL],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('GeneradorTCL');
}
