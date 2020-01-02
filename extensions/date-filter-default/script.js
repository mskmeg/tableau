'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  $(document).ready(function () {
    tableau.extensions.initializeAsync().then(() => {
      let dashboard = tableau.extensions.dashboardContent.dashboard;
      let worksheets = dashboard.worksheets;

      let sheets = "Worksheet List";

      worksheets.forEach(function(worksheet) {
        sheets = sheets + "<br>" + worksheet.name;
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
