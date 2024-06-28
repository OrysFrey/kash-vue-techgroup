import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule } from './shared/shared/shared.module';
import { CommonModule } from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SharedModule, ScrollingModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cashvue';
}
