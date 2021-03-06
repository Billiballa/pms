import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { TableViewService } from './table-view.service';
import { ViewModel } from './view.model';

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss'],
  providers: [TableViewService]
})
export class TableViewComponent {

  // 项目ID
  releaseId: string;

  viewModel = ViewModel;

  viewType;

  role;

  rows = [];

  temp = [];

  columns = [];

  selected = [];

  @ViewChild('table') tableEl: any;

  constructor(private route: ActivatedRoute, private router: Router, private service: TableViewService, private sanitizer: DomSanitizer) {

    this.releaseId = sessionStorage.getItem('releaseId');

    this.role = sessionStorage.getItem('userRoleInProject');

    this.viewType = this.route.snapshot.data['type'];

    if (!this.releaseId || !this.role || !this.viewType || !this.viewModel[this.viewType]) {
      this.router.navigate([`/pages/${this.role}/release/view`]);
    } else {
      this.columns = this.viewModel[this.viewType].columns;
      this.initData();
    }

  }

  initData() {
    this.service
      .getViewData(this.releaseId, this.viewModel[this.viewType].url)
      .then(res => {
        if (res.message) {
          this.router.navigate([`/pages/${this.role}/release/view`]);
        }

        res.map(date => {
          date.name = date.title ? date.title : date.name;
        });

        // cache our list
        this.temp = [...res];

        // push our inital complete list
        this.rows = res;
      })
      .catch(err => console.log(err));
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.tableEl.offset = 0;
  }

  toggleExpandRow(row) {
    // console.log('Toggled Expand Row!', row);
    event.stopPropagation();
    this.tableEl.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event) {
    // console.log('Detail Toggled', event);
  }

  addItem() {
    this.router.navigate([`/pages/project/${this.viewType}/new`]);
  }

  ViewDetail(event) {
    if (event.type === 'click') {
      // console.log('Activate Event', event);
      this.router.navigate([`/pages/project/${this.viewType}/${event.row.id}`]);
    }
  }

}
