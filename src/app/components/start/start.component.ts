import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../../shared/shared/shared.module';
import { NgClass, isPlatformBrowser } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../models/users';


@Component({
  selector: 'app-start',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.css'
})
export class StartComponent {
  EsInsertar: boolean = true;
  login!: FormGroup;
  register!: FormGroup;
  loginError: boolean = false;
  id!: number;
  dateRegister!: Date;
  showEffect: boolean = false;
  
  constructor(private formBuilder: FormBuilder, private userService: UserService, 
    private router: Router, private activatedRouter: ActivatedRoute, private snackBar: MatSnackBar, 
    @Inject(PLATFORM_ID) private platformId: Object){}

  ngOnInit(){
    this.reactiveForm();
    this.moveLabel();
    this.changeSlide();
    this.textSlider();
    setTimeout(() => {
      this.showEffect = true;
    }, 500);
  }  

  reactiveForm():void{
    this.login = this.formBuilder.group({
      email_user:["", [Validators.required]],
      password_user:["", [Validators.required]]
    });

    this.register = this.formBuilder.group({
      id:[""],
      name_user:["",[Validators.required]],
      lastname_user:["",[Validators.required]],
      birthdate_user:["",[Validators.required]],
      email_user:["",[Validators.required, Validators.email]],
      password_user:["",[
        Validators.required, 
        Validators.min(8)]]
    });
  }
  

  loginUser(){
    console.log("login");
    this.userService.getUsers().subscribe( element => {
      const user = element.find((a:User) => {
        return a.email == this.login.get('email_user')!.value && a.password == this.login.get('password_user')!.value
      });
      if(user){
        console.log("sign in")
        this.loginError = false;
        this.router.navigate(["dashboard/" + user.id + "/home/" + user.id]);
      }
      else{
        console.log("Error");
        this.loginError = true;
      }
    });
  }

  signupUser():void{
    console.log("signup");
    this.dateRegister = new Date();
    const user: User = {
      id: this.id,
      name: this.register.get('name_user')!.value,
      lastname: this.register.get('lastname_user')!.value,
      email: this.register.get('email_user')!.value,
      password: this.register.get('password_user')!.value,
      dni: " ",
      birthday: this.register.get('birthdate_user')!.value,
      date_register: this.dateRegister,
      phone: " ",
      photo: "assets\\images\\profile-18.jpg",
      mora: 75
    }
    
    if(this.EsInsertar){
      this.userService.addUser(user).subscribe({
        next: (data) => {
          console.log("registro");
          this.snackBar.open("Se ha registrado correctamente", "OK", {duration:6000});
        },
        error: (err) => {
          console.log(err);
        }
      })
    }
  }

  moveLabel(){
    if (isPlatformBrowser(this.platformId)) {
      const inputs = document.querySelectorAll(".input-field");

    inputs.forEach((inp) => {
      inp.addEventListener("focus", () => {
        inp.classList.add("active");
      });
      inp.addEventListener("blur", () => {
        const inpu = inp as HTMLInputElement;
        if(inpu.value != "") return;
        inp.classList.remove("active");
      });
    });
    }
  }

  changeSlide(){
    if (isPlatformBrowser(this.platformId)) {
      const toggle_btn = document.querySelectorAll(".toggle");
    const main = document.querySelectorAll("main");

    toggle_btn.forEach((btn) => {
      btn.addEventListener("click", () => {
        main.forEach((mai) => {
          mai.classList.toggle("sign-up-mode");
        });
      });
    });
    }
  }

  textSlider(){
    if (isPlatformBrowser(this.platformId)) {
      const bullets = document.querySelectorAll(".bullets span");
    const images = document.querySelectorAll(".image");

    function moveSlider(this: HTMLElement){
      let index = this.dataset['value'];
      const ind = index as unknown as number;

      let currentImage = document.querySelector(`.img-${index}`);
      images.forEach((img) => img.classList.remove("show"));
      currentImage?.classList.add("show");

      const slider = document.querySelector(".text-group");
      const textLableSlider = slider as HTMLElement;
      textLableSlider.style.transform = `translateY(${-(ind - 1) * 3}rem)`;

      bullets.forEach(bull => bull.classList.remove("active"));
      this.classList.add("active");
    }

    bullets.forEach(bullet => {
      bullet.addEventListener("click", moveSlider);
    });
    }
  }

}