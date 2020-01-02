'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  $(document).ready(function () {
    tableau.extensions.initializeAsync().then(() => {
      let dashboard = tableau.extensions.dashboardContent.dashboard;
      let selectedWorksheet = dashboard.worksheets.find(w => w.name === 'Historical Trend');
      // let fieldName = 'Date';
      // updateFilterRange(selectedWorksheet, fieldName);

      $("body").html("Hello 3");
    });
  });

  function updateFilterRange(worksheet, fieldName) {
    let today = new Date();
    let lastYear = new Date();
    lastYear.setFullYear(today.getFullYear()-1);
    worksheet.applyRangeFilterAsync(fieldName, { min: lastYear, max: today});
  }
})();
