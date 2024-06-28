import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../../shared/shared/shared.module';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../../models/users';

import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule, RouterModule, MatMenuModule, MatSidenavModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  close: boolean = false;
  title: string = "Home";
  name!: string;
  photo!: string;
  idUser!: number;
  hidden: boolean = false;
  currentRoute: string = '';


  constructor(private userService: UserService, private router: Router,
    private activatedRouter: ActivatedRoute, @Inject(PLATFORM_ID) private platformId: Object){
      this.idUser = activatedRouter.snapshot.params["id"];
    }

  ngOnInit(){
    this.infoUser();
    this.changeOption();
  }
  
  infoUser():void{
    this.idUser = this.activatedRouter.snapshot.params["id"];
    console.log(this.idUser);
    this.userService.getUser(this.idUser).subscribe({
      next: (data: User) => {
        this.name = data.name;
        this.photo = data.photo;
        console.log(this.idUser);
        console.log(this.photo);
        console.log(this.name);
      },
      error: (err) => {
          console.log(err);
      }
    });
  }

  toggleBadgeVisibility(){
    this.hidden = !this.hidden;
  }

  changeOption():void{
    if (isPlatformBrowser(this.platformId)){
      const options = document.querySelectorAll('.option');

      options.forEach((option) => {
        option.addEventListener('click', () => {
          options.forEach((op) => op.classList.remove('active'));
          option.classList.add('active');
        });
      });
    }
  }
}
