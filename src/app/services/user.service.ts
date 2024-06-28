import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/users';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  pathServer: string = "https://techgroup-finance.azurewebsites.net/";
  source: string = "api/User";

  constructor(private http:HttpClient) { }

  getUsers(){
    return this.http.get<User[]>(this.pathServer + "/" + this.source);
  }

  getUser(id: number){
    return this.http.get<User>(this.pathServer + "/" + this.source + "/" + id.toString());
  }

  addUser(user: User){
    return this.http.post<User>(this.pathServer + "/" + this.source, user);
  }

  updateUser(user: User){
    return this.http.put<User>(this.pathServer + "/" + this.source + "/" + user.id.toString(), user);
  }

  deleteUser(id: number){
    return this.http.delete<User>(this.pathServer + "/" + this.source + "/" + id.toString());
  }

  validateUser(email: string, password: string){
    return this.http.get<User>(this.pathServer + "/" + this.source + "/email/" + email + "/password/" + password);
  }
}
