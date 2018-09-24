import { Injectable } from '@angular/core';
import { ComponentFixture, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

@Injectable()
export class TestUtilsService {

  static pickFromMatSelect(cssSelector: string, itemIdx: string, fixture: ComponentFixture<any>, selectIdx?: string) {
    fixture.debugElement.query(By.css(cssSelector + ' .mat-select-trigger')).nativeElement.click();
    fixture.detectChanges();
    tick();

    let selector = 'mat-option:nth-child(' + itemIdx + ')';
    if (selectIdx) {
         selector = 'div.cdk-overlay-pane:nth-child(' + selectIdx + ') ' + selector;
    }

    fixture.debugElement.query(By.css(selector)).nativeElement.click();
    fixture.detectChanges();
    tick();
  }
}
