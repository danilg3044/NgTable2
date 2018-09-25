import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource, MatTable} from '@angular/material';
import { NgModel } from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, FormGroup, FormBuilder} from '@angular/forms';
import { HttpClientService, Employee } from './http-client/http-client.service';
import { webSocket, WebSocketSubject } from 'rxjs/websocket';

export interface EmployeeProfile {
  id: number;
  email: string;
  salary: number;
  quality: {color: string, value: number};
  date: Date;
  locked: boolean;
}

const QUALITIES = [{color: 'maroon', value: 1}, {color: 'red', value: 2}, {color: 'orange', value: 3}, {color: 'yellow', value: 4},
                {color: 'olive', value: 5}, {color: 'green', value: 6}, {color: 'purple', value: 7}, {color: 'fuchsia', value: 8},
                {color: 'lime', value: 9}, {color: 'teal', value: 10}, {color: 'aqua', value: 11}, {color: 'blue', value: 12},
                {color: 'navy', value: 13}, {color: 'black', value: 14}, {color: 'gray', value: 15}];

const NAMES: string[] = ['Maia@gmail.com', 'Asher@yahoo.com', 'Olivia@hotmail.com', 'Atticus@comda.co.il',
'Amelia@gmail.com', 'Jack@hotmail.com', 'Charlotte@hotmail.com', 'Theodore@gmail.com', 'Isla@yahoo.com',
'Oliver@comda.co.il', 'Isabella@gmail.com', 'Jasper@comda.co.il', 'Cora@comda.co.il', 'Levi@gmail.com', 'Violet@yahoo.com',
'Arthur@hotmail.com', 'Mia@comda.co.il', 'Thomas@yahoo.com', 'Elizabeth@gmail.com'];

interface Notification {
  data: string;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    //const isSubmitted = form && form.submitted;
    //return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    return control.invalid;
  }
}

@Component({
  selector: 'app-table-component',
  styleUrls: ['table-component.css'],
  templateUrl: 'table-component.html',
})
export class TableComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['index', 'id-sep', 'id', 'email-sep', 'email', 'salary-sep', 'salary', 'quality-sep',
                                                            'quality', 'date-sep', 'date', 'locked-sep', 'locked'];
  filterColumns: string[] =    ['index-filter', 'id-filter-sep', 'id-filter', 'email-filter-sep', 'email-filter',
          'salary-filter-sep', 'salary-filter', 'quality-filter-sep', 'quality-filter', 'date-filter-sep',
          'date-filter', 'locked-filter-sep', 'locked-filter'];

  dataSource: MatTableDataSource<EmployeeProfile>;
  idFilter: string;
  emailFilter: string;
  salaryFilter: number;
  qualityFilter: number[];
  statusFilter: boolean;
  qualities: number[];
  statuses: Array<{status: string, value?: boolean}>;
  subject: WebSocketSubject<Notification>;
  sinceDate: Date;
  tillDate: Date;
  total: number;

  myForm: FormGroup;
  matcher = new MyErrorStateMatcher();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatTable)
  private _table: MatTable<EmployeeProfile>;
  public get table(): MatTable<EmployeeProfile> {
    return this._table;
  }
  public set table(value: MatTable<EmployeeProfile>) {
    this._table = value;
  }

  @ViewChild(MatSort)
  private _sort: MatSort;
  public get sort(): MatSort {
    return this._sort;
  }
  public set sort(value: MatSort) {
    this._sort = value;
  }

  constructor(private formBuilder: FormBuilder, private http: HttpClientService) {
    console.log('TableComponent c-tor ...');
    this.total = 0;
    this.qualities = Array.from(QUALITIES).map(quality => +quality.value);
    this.qualityFilter = this.qualities;
    this.statuses = [{status: 'Any', value: undefined}, {status: 'Locked', value: true}, {status: 'Unlocked', value: false}];

    this.myForm = this.formBuilder.group({'sinceDatePicker': [], 'tillDatePicker': []});
    // }, { validator: this.checkDates });
  }

  ngOnInit() {
    console.log('TableComponent ngOnInit ...');
    this.paginator.showFirstLastButtons = true;
    const employees = Array.from({length: 100}, (_, k) => createEmployees(k + 1));
    this.dataSource = new MatTableDataSource(employees);
    this.dataSource.filterPredicate = this.filterPredicate();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (record, header) => {
      if (header === 'quality') {
        return record.quality.value;
      }
      return record[header];
    };

    /* const data: Array<EmployeeProfile> = [];

    const _ = this.http.load('' + new Date().getTime()).subscribe(records => records.map(employee => data.push({
        id: employee.uid,
        email: employee.email,
        salary: employee.salary,
        quality: this.getColor(employee.value),
        date: employee.hired,
        locked: !employee.contract
      })
    ), null, () => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.filterPredicate = this.filterPredicate();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.sortingDataAccessor = (record, header) => {
        if (header === 'quality') {
          return record.quality.value;
        }
        return record[header];
      };

      this.subject = webSocket('ws://localhost:8080/DemoMvcApp/email');
      this.subject.subscribe(
          (msg) => {
            // console.log('message received: ' + msg.data);
            // this.addRow();
            this.updateRow();
          },
          (err) => console.log(err),
          () => console.log('complete')
      );
      // this.subject.next(JSON.stringify({ op: 'hello' }));
    }); */

    this.applyFilter();
  }

  ngOnDestroy() {
    console.log('TableComponent ngOnDestroy ...');
    if (this.subject) {
      this.subject.unsubscribe();
    // this.subject.complete();
    }
  }

  /* checkDates(group: FormGroup) {
    if (group.controls.sinceDatePicker.value < group.controls.tillDatePicker.value) {
      return { endDateLessThanStartDate: true };
    }
    //console.log("values - " group.controls.sinceDatePicker.value + " : " + group.controls.tillDatePicker.value);
    return null;
  } */

  onPageChange(event) {
    // console.log(event);
    // this.page = event.pageIndex;
  }

  updateRow() {
    let data: EmployeeProfile[] = [];
    if (this.dataSource) {
      data = (this.dataSource.data as EmployeeProfile[]);
    }
    data.find(e => e.id === 2).email = Math.random().toString();
    this.dataSource.data = data;
    this.table.renderRows();
  }

  addRow() {
    let data: EmployeeProfile[] = [];
    if (this.dataSource) {
      data = (this.dataSource.data as EmployeeProfile[]);
    }
    data.push({
        id: 123456,
        email: Math.random().toString(),
        salary: 9999,
        quality: QUALITIES[Math.round(Math.random() * (QUALITIES.length - 1))],
        date: new Date(+(new Date()) - Math.floor(Math.random() * 10000000000)),
        locked: Math.round(Math.random() * 1000) % 2 === 0,
    });

    this.dataSource.data = data;
    this.table.renderRows();
  }

  filterPredicate(): (record: EmployeeProfile) => boolean {
    return (record: EmployeeProfile) => {
      if (this.idFilter && !record.id.toString().startsWith(this.idFilter)) {
        return false;
      }

      if (this.emailFilter && !record.email.toLowerCase().startsWith(this.emailFilter)) {
        return false;
      }

      if (this.statusFilter !== undefined && record.locked !== this.statusFilter) {
        return false;
      }

      if (this.salaryFilter && record.salary > this.salaryFilter) {
        return false;
      }

      if (this.qualityFilter && !this.qualityFilter.includes(record.quality.value) ) {
        return false;
      }

      if (this.sinceDate && this.sinceDate.getTime() > record.date.getTime()) {
        return false;
      }

      if (this.tillDate && this.tillDate.getTime() < record.date.getTime()) {
        return false;
      }

      return true;
    };
  }

  onChange(event, index, row) {
    row.locked = !row.locked;
    this.applyFilter();
  }

  changeEmail(value, id) {
    this.http.updateEmail(id, value);
    this.applyFilter();
  }

  getColor(value: number) {
    return QUALITIES.find(c => c.value === value).color;
  }

  selectAll(el: NgModel, select: boolean) {
    const qualities = select ? this.qualities : [];
    this.filterByQuality(qualities, el);
  }

  filterByQuality(filterValue: number[], select: NgModel) {
    this.qualityFilter = filterValue;
    this.applyFilter();
  }

  filterByDate(till: boolean, date: Date) {
    if (till) {
      this.tillDate = date;
    } else {
      this.sinceDate = date;
    }

    this.applyFilter();
  }

  filterByEmail(filterValue: string) {
    this.emailFilter = filterValue.length ? filterValue.toLowerCase() : null;
    this.applyFilter();
  }

  filterBySalary(filterValue: number) {
    this.salaryFilter = filterValue;
    this.applyFilter();
  }

  filterByStatus(filterValue?: boolean) {
    this.statusFilter = filterValue;
    this.applyFilter();
  }

  filterById(filterValue: string) {
    this.idFilter = filterValue.length ? filterValue : null;
    this.applyFilter();
  }

  applyFilter() {
    this.dataSource.filter = '*';

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    let total = 0;
    this.dataSource.filteredData.forEach(function(employee: EmployeeProfile, index: number, data: EmployeeProfile[]) {
      total += employee.salary;
    });
    this.total = total;
  }

  getTotalCost() {
    return this.total;
  }
}

function createEmployees(id: number): EmployeeProfile {
  const email = NAMES[Math.round(Math.random() * (NAMES.length - 1))];

  return {
    id: id,
    email: email,
    salary: Math.round(Math.random() * 1000) + 1000,
    quality: QUALITIES[Math.round(Math.random() * (QUALITIES.length - 1))],
    date: new Date(+(new Date()) - Math.floor(Math.random() * 20000000000)),
    locked: Math.round(Math.random() * 1000) % 2 === 0,
  };
}
