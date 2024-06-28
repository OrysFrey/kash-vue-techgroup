import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared/shared.module';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Questions } from '../../models/questions';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent {

  selectedTypeRequest: string = '';
  id!: number;
  idUser!: number;

  constructor(private userService: UserService, private route: Router, private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar){}

  ngOnInit(){

  }
}
