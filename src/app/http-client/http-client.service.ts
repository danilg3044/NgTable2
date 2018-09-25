import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

export class Employee {
  constructor(public uid: number, public email: string, public salary: number,
        public quality: number, public hired: Date, public contract: boolean ) {}
}

interface Response {
  results: Employee[];
}

@Injectable()
export class HttpClientService {
  server = 'http://localhost:8080/DemoMvcApp/table/users.json';
  constructor(private http: HttpClient) {}

  load(param: string): Observable<Employee[]> {
    const url = `${this.server}?param=${param}`;
    return this.http.get(url).pipe(
      map((res: Response) => {
        return res.results.map(e => new Employee(e.uid, e.email, e.salary, e.quality, e.hired, e.contract));
      })
    );
  }

  updateEmail(id: number, email: string, callback?: any) {
    // this.http.put('update/name', {id: id, name: name});
    const req = this.http.post('update/name', {id: id, email: email}).subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log('Error occured');
      }
    );
  }
}
