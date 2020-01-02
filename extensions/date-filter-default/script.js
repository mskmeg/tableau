'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  $(document).ready(function () {
    tableau.extensions.initializeAsync().then(() => {
      let dashboard = tableau.extensions.dashboardContent.dashboard;
      let worksheets = dashboard.worksheets.find(w => w.name === 'Historical Trend');

      let sheets = "";

      worksheets.forEach(funciton(worksheet) {
        sheets = (sheets == "") ? worksheet.name : "<br>" + worksheet.name;
      });
 
      $("body").html(sheets);
    });
  });

  function updateFilterRange(worksheet, fieldName) {
    let today = new Date();
    let lastYear = new Date();
    lastYear.setFullYear(today.getFullYear()-1);
    worksheet.applyRangeFilterAsync(fieldName, { min: lastYear, max: today});
  }
})();
