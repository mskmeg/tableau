'use strict';

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  $(document).ready(function () {
    tableau.extensions.initializeAsync().then(() => {
      let dashboard = tableau.extensions.dashboardContent.dashboard;
      let worksheets = dashboard.worksheets;

      let sheets = "Worksheet Filters";

      worksheets.forEach(function(worksheet) {
        sheets = sheets + "<br>" + worksheet.name;

        worksheet.getFiltersAsync().then(function(filters) {
          filters.forEach(function(filter) {
		  alert(filter.fieldName);
            sheets = sheets + "<br>=> " + filter.fieldName;
	  });
	});
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
