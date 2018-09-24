import { TestBed, async, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { TableComponent } from './table-component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatTableModule, MatCheckboxModule, MatSelectModule,
         MatDatepickerModule, MatPaginatorModule, MatNativeDateModule, MatInputModule } from '@angular/material';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientService } from './http-client/http-client.service';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TestUtilsService } from './test-utils/test-utils.service';

describe('TableComponent', () => {
  let table: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TableComponent
      ],
      imports: [NoopAnimationsModule, FormsModule, ReactiveFormsModule, HttpClientModule, MatFormFieldModule, MatTableModule,
                          MatCheckboxModule, MatSelectModule, MatDatepickerModule, MatPaginatorModule,
                          MatNativeDateModule, MatInputModule],
      providers: [HttpClientService, TestUtilsService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    table = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the table', async(() => {
    expect(table).toBeTruthy();
  }));

  it('check first row', async(() => {
    expect(table.dataSource.data[0].id).toEqual(1);
  }));

  it('Color filter test', fakeAsync(() => {
    const http = fixture.debugElement.injector.get(HttpClientService);
    expect(http).toBeTruthy();

    TestUtilsService.pickFromMatSelect('', '1', fixture, '1');
    console.log(table.colorFilter);
  }));

  /* it('Sort by name test', async(() => {
    expect(table.dataSource.data[0].id).toEqual(1);
  })); */
});
