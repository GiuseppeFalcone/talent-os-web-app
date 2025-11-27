import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, DatePipe],
  templateUrl: './footer.html',
})
export class Footer {
  readonly currentYear = new Date();
}
