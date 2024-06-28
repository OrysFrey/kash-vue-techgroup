import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared/shared.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../../models/users';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  myForm!: FormGroup;
  id!: number; 
  isUpdate: boolean = true;
  photoUser!: string;

  constructor(private usersServices: UserService, private formBuilder: FormBuilder, private snackBar: MatSnackBar,
    private router: Router, private activatedRouter: ActivatedRoute){}

  ngOnInit(){
    this.reactiveForm();
  }

  reactiveForm():void{
    this.myForm = this.formBuilder.group({
      name:["",[Validators.required, Validators.maxLength(60), Validators.minLength(2)]],
      lastname:["",[Validators.required, Validators.maxLength(60), Validators.minLength(2)]],
      email:["",[Validators.required, Validators.email]],
      password:["",[Validators.required, Validators.minLength(8),Validators.pattern(/[A-Z]/),
        Validators.pattern(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/), Validators.pattern(/[0-9]/)]],
      dni:["",[Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      birthdate:["",[Validators.required]],
      phone:["",[Validators.required]],
      mora:["",[Validators.required, Validators.max(99), Validators.min(1)]]
    });

    this.id = this.activatedRouter.snapshot.params["id"];

    if(this.id != 0 && this.id != undefined){
      this.usersServices.getUser(this.id).subscribe({
        next: (data) => {
           this.myForm.get("name")?.setValue(data.name);
           this.myForm.get("lastname")?.setValue(data.lastname);
           this.myForm.get("email")?.setValue(data.email);
           this.myForm.get("password")?.setValue(data.password);
           this.myForm.get("dni")?.setValue(data.dni);
           this.myForm.get("birthdate")?.setValue(data.birthday);
           this.myForm.get("phone")?.setValue(data.phone);
           this.myForm.get("mora")?.setValue(data.mora);
           this.photoUser = data.photo;
        },
        error: (err) => {
          console.log(err);
        }
      });
    }

  }

  isValidForm():boolean{
    return this.myForm.valid;
  }

  saveChanges():void{
    const dateRegister = new Date();
    const user: User = {
      id: this.id,
      name: this.myForm.get("name")!.value,
      lastname: this.myForm.get("lastname")!.value,
      email: this.myForm.get("email")!.value,
      password: this.myForm.get("password")!.value,
      dni: this.myForm.get("dni")!.value,
      birthday: this.myForm.get("birthdate")!.value,
      date_register: dateRegister,
      phone: this.myForm.get("phone")!.value,
      photo: this.photoUser,
      mora: this.myForm.get("mora")!.value
    }

    if(this.isUpdate){
      this.usersServices.updateUser(user).subscribe({
        next: (data) => {
          this.snackBar.open("Se guardaron correctamente los cambios", "OK", {duration: 4000});
        },
        error: (err) => {
            console.log(err);
        },
      });
    }
  }
}
